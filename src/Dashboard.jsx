import { supabase } from './supabase'
import './Dashboard.css'

export default function Dashboard({ profile, onLogout }) {
  const handleLogout = async () => {
    await supabase.auth.signOut()
    onLogout()
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-card">
        <span className="role-badge">{profile.role}</span>
        <h1>Welcome, {profile.full_name || profile.username}</h1>
        <p className="dash-sub">You are logged in as <strong>{profile.username}</strong></p>
        <button className="btn-logout" onClick={handleLogout}>Log Out</button>
      </div>
    </div>
  )
}
