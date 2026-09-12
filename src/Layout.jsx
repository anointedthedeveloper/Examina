import { supabase } from './supabase'
import './Layout.css'

export default function Layout({ profile, children, navItems, onLogout }) {
  const handleLogout = async () => {
    await supabase.auth.signOut()
    onLogout()
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/examina.png" alt="Examina" />
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`nav-item ${item.active ? 'active' : ''}`}
              onClick={item.onClick}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar">{(profile.full_name || profile.username)[0].toUpperCase()}</div>
            <div>
              <p className="sidebar-name">{profile.full_name || profile.username}</p>
              <p className="sidebar-role">{profile.role}</p>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>Log Out</button>
        </div>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
