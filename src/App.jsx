import { useState } from 'react'
import logo from '/examina.png'
import './App.css'

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    alert(`Logging in as ${username}`)
  }

  return (
    <div className="login-page">
      <div className="login-card">
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
          <button type="submit" className="btn-login">Log In</button>
        </form>

      </div>
    </div>
  )
}

export default App
