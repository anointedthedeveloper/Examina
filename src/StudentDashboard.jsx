import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Layout from './Layout'

export default function StudentDashboard({ profile, onLogout }) {
  const [page, setPage] = useState('overview')
  const [classes, setClasses] = useState([])
  const [results, setResults] = useState([])

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const { data: cls } = await supabase
      .from('enrollments')
      .select('classes(id, name)')
      .eq('student_id', profile.id)

    const { data: res } = await supabase
      .from('results')
      .select('id, score, remarks, exams(title, scheduled_at)')
      .eq('student_id', profile.id)
      .order('created_at', { ascending: false })

    if (cls) setClasses(cls.map(e => e.classes))
    if (res) setResults(res)
  }

  const navItems = [
    { key: 'overview', label: 'Overview', icon: '🏠', active: page === 'overview', onClick: () => setPage('overview') },
    { key: 'classes', label: 'My Classes', icon: '📚', active: page === 'classes', onClick: () => setPage('classes') },
    { key: 'results', label: 'Results', icon: '📊', active: page === 'results', onClick: () => setPage('results') },
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
              <p className="stat-label">Exams Taken</p>
              <p className="stat-value">{results.length}</p>
            </div>
          </div>
          <div className="card">
            <p className="card-title">Recent Results</p>
            <table>
              <thead><tr><th>Exam</th><th>Score</th><th>Remarks</th></tr></thead>
              <tbody>
                {results.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text)' }}>No results yet.</td></tr>}
                {results.slice(0, 5).map(r => (
                  <tr key={r.id}>
                    <td>{r.exams?.title || '—'}</td>
                    <td>{r.score ?? '—'}</td>
                    <td>{r.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {page === 'classes' && (
        <div className="card">
          <p className="card-title">Enrolled Classes</p>
          <table>
            <thead><tr><th>Class Name</th></tr></thead>
            <tbody>
              {classes.length === 0 && <tr><td style={{ textAlign: 'center', color: 'var(--text)' }}>Not enrolled in any class.</td></tr>}
              {classes.map(c => <tr key={c.id}><td>{c.name}</td></tr>)}
            </tbody>
          </table>
        </div>
      )}

      {page === 'results' && (
        <div className="card">
          <p className="card-title">All Results</p>
          <table>
            <thead><tr><th>Exam</th><th>Score</th><th>Remarks</th></tr></thead>
            <tbody>
              {results.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text)' }}>No results yet.</td></tr>}
              {results.map(r => (
                <tr key={r.id}>
                  <td>{r.exams?.title || '—'}</td>
                  <td>{r.score ?? '—'}</td>
                  <td>{r.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  )
}
