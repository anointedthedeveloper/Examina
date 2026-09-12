import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Layout from './Layout'

export default function TeacherDashboard({ profile, onLogout }) {
  const [page, setPage] = useState('overview')
  const [classes, setClasses] = useState([])
  const [exams, setExams] = useState([])

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const { data: cls } = await supabase
      .from('classes')
      .select('id, name, created_at')
      .eq('teacher_id', profile.id)

    const { data: ex } = await supabase
      .from('exams')
      .select('id, title, scheduled_at, classes(name)')
      .eq('created_by', profile.id)
      .order('scheduled_at', { ascending: true })

    if (cls) setClasses(cls)
    if (ex) setExams(ex)
  }

  const navItems = [
    { key: 'overview', label: 'Overview', icon: '🏠', active: page === 'overview', onClick: () => setPage('overview') },
    { key: 'classes', label: 'My Classes', icon: '📚', active: page === 'classes', onClick: () => setPage('classes') },
    { key: 'exams', label: 'Exams', icon: '📝', active: page === 'exams', onClick: () => setPage('exams') },
  ]

  return (
    <Layout profile={profile} onLogout={onLogout} navItems={navItems}>
      <p className="page-title">
        {page === 'overview' ? `Welcome, ${profile.full_name || profile.username}` : page.charAt(0).toUpperCase() + page.slice(1)}
      </p>

      {page === 'overview' && (
        <>
          <div className="stats-row">
            <div className="stat-card">
              <p className="stat-label">Classes</p>
              <p className="stat-value">{classes.length}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Exams</p>
              <p className="stat-value">{exams.length}</p>
            </div>
          </div>
          <div className="card">
            <p className="card-title">Upcoming Exams</p>
            <table>
              <thead><tr><th>Title</th><th>Class</th><th>Scheduled</th></tr></thead>
              <tbody>
                {exams.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text)' }}>No exams yet.</td></tr>}
                {exams.map(e => (
                  <tr key={e.id}>
                    <td>{e.title}</td>
                    <td>{e.classes?.name || '—'}</td>
                    <td>{e.scheduled_at ? new Date(e.scheduled_at).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {page === 'classes' && (
        <div className="card">
          <p className="card-title">My Classes</p>
          <table>
            <thead><tr><th>Class Name</th><th>Created</th></tr></thead>
            <tbody>
              {classes.length === 0 && <tr><td colSpan={2} style={{ textAlign: 'center', color: 'var(--text)' }}>No classes assigned.</td></tr>}
              {classes.map(c => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {page === 'exams' && (
        <div className="card">
          <p className="card-title">All Exams</p>
          <table>
            <thead><tr><th>Title</th><th>Class</th><th>Scheduled</th></tr></thead>
            <tbody>
              {exams.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text)' }}>No exams yet.</td></tr>}
              {exams.map(e => (
                <tr key={e.id}>
                  <td>{e.title}</td>
                  <td>{e.classes?.name || '—'}</td>
                  <td>{e.scheduled_at ? new Date(e.scheduled_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  )
}
