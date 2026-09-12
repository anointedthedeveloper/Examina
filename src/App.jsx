import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import logo from '/examina.png'
import { supabase } from './supabase'
import { toAuthEmail } from './utils'
import Dashboard from './Dashboard'
import './App.css'

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const email = toAuthEmail(username)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError || !authData.user) {
      setError('Invalid username or password.')
      setLoading(false)
      return
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, username, role, full_name')
      .eq('id', authData.user.id)
      .single()

    if (profileData) {
      onLogin(profileData)
      navigate('/dashboard')
    } else {
      setError('Profile not found.')
    }
    setLoading(false)
  }

  return (
    <div className="loginPage">
      <div className="loginCard">
        <div className="brand">
          <img src={logo} alt="Examina" />
          <p className="tagline">by Anobyte</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btnLogin" disabled={loading}>
            {loading ? <><span className="spinnerInline" /> Logging in…</> : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function App() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('id, username, role, full_name')
          .eq('id', session.user.id)
          .single()
        if (data) setProfile(data)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setProfile(null)
        navigate('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="loginPage">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={profile ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={setProfile} />}
      />
      <Route
        path="/dashboard/*"
        element={profile ? <Dashboard profile={profile} onLogout={() => setProfile(null)} /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to={profile ? '/dashboard' : '/login'} replace />} />
    </Routes>
  )
}
