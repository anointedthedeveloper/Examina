import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import { Icons } from './Icons'
import './Layout.css'

export default function Layout({ profile, children, navItems, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [expandedKey, setExpandedKey] = useState(null)
  const [sessionInfo, setSessionInfo] = useState(null)

  useEffect(() => {
    supabase.from('academic_sessions').select('id, name, terms(id, name, is_active)').eq('is_active', true).maybeSingle()
      .then(({ data }) => {
        if (data) {
          const activeTerm = data.terms?.find(t => t.is_active)
          setSessionInfo({ session: data.name, term: activeTerm?.name || null })
        }
      })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    onLogout()
  }

  const handleNavClick = (item) => {
    if (item.children) {
      setExpandedKey(prev => prev === item.key ? null : item.key)
      return
    }
    item.onClick()
    setMobileOpen(false)
    setExpandedKey(null)
  }

  const handleSubClick = (sub) => {
    sub.onClick()
    setMobileOpen(false)
  }

  const sidebarClass = `sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'open' : ''}`

  return (
    <div className={`layout ${collapsed ? 'sidebarCollapsed' : ''}`}>
      {/* Mobile top bar */}
      <div className="mobileTopBar">
        <button className="menuBtn" onClick={() => setMobileOpen(true)}>{Icons.menu}</button>
        <div className="mobileBrand">
          <img src="/examina.png" alt="Examina" />
          <span>Examina</span>
        </div>
      </div>

      {mobileOpen && <div className="sidebarOverlay" onClick={() => setMobileOpen(false)} />}

      <aside className={sidebarClass}>
        <div className="sidebarBrand">
          {!collapsed && <img src="/examina.png" alt="Examina" />}
          {!collapsed && <span>Examina</span>}
          {/* Desktop collapse toggle */}
          <button className="collapseBtn" onClick={() => { setCollapsed(c => !c); setExpandedKey(null) }} title={collapsed ? 'Expand' : 'Collapse'}>
            {collapsed ? Icons.menu : Icons.close}
          </button>
          {/* Mobile close */}
          <button className="sidebarClose" onClick={() => setMobileOpen(false)}>{Icons.close}</button>
        </div>

        <nav className="sidebarNav">
          {navItems.map((item) => (
            <div key={item.key} className="navGroup">
              <button
                className={`navItem ${item.active || (item.children?.some(c => c.active)) ? 'active' : ''}`}
                onClick={() => handleNavClick(item)}
                title={collapsed ? item.label : undefined}
              >
                <span className="navIcon">{item.icon}</span>
                {!collapsed && <span className="navLabel">{item.label}</span>}
                {!collapsed && item.children && (
                  <span className={`navChevron ${expandedKey === item.key ? 'open' : ''}`}>
                    {Icons.chevron}
                  </span>
                )}
              </button>

              {/* Subnav — expanded inline when sidebar is open */}
              {!collapsed && item.children && expandedKey === item.key && (
                <div className="subNav">
                  {item.children.map(sub => (
                    <button
                      key={sub.key}
                      className={`subNavItem ${sub.active ? 'active' : ''}`}
                      onClick={() => handleSubClick(sub)}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Collapsed tooltip subnav */}
              {collapsed && item.children && (
                <div className="collapsedSubNav">
                  <div className="collapsedSubNavLabel">{item.label}</div>
                  {item.children.map(sub => (
                    <button key={sub.key} className={`collapsedSubNavItem ${sub.active ? 'active' : ''}`} onClick={() => handleSubClick(sub)}>
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="sidebarFooter">
          {!collapsed && sessionInfo && (
            <div className="sessionInfo">
              <p className="sessionName">{sessionInfo.session}</p>
              {sessionInfo.term && <p className="termName">{sessionInfo.term}</p>}
            </div>
          )}
          {!collapsed && (
            <div className="sidebarUser">
              <div className="avatar">{(profile.full_name || profile.username)[0].toUpperCase()}</div>
              <div className="sidebarUserInfo">
                <p className="sidebarName">{profile.full_name || profile.username}</p>
                <p className="sidebarRole">{profile.role}</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="avatar" style={{ margin: '0 auto' }} title={profile.full_name || profile.username}>
              {(profile.full_name || profile.username)[0].toUpperCase()}
            </div>
          )}
          {!collapsed && <button className="btnLogout" onClick={handleLogout}>Log Out</button>}
          {collapsed && (
            <button className="btnLogout btnLogoutIcon" onClick={handleLogout} title="Log Out">{Icons.logout}</button>
          )}
        </div>
      </aside>

      <main className="mainContent">
        {children}
      </main>
    </div>
  )
}
