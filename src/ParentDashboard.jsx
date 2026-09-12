import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Layout from './Layout'

export default function ParentDashboard({ profile, onLogout }) {
  const [page, setPage] = useState('overview')
  const [children, setChildren] = useState([])
  const [results, setResults] = useState([])

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const { data: links } = await supabase
      .from('parent_students')
      .select('profiles!student_id(id, full_name, username)')
      .eq('parent_id', profile.id)

    const kids = links?.map(l => l.profiles) || []
    setChildren(kids)

    if (kids.length > 0) {
      const ids = kids.map(k => k.id)
      const { data: res } = await supabase
        .from('results')
        .select('id, score, remarks, student_id, exams(title), profiles!student_id(full_name, username)')
        .in('student_id', ids)
        .order('created_at', { ascending: false })
      if (res) setResults(res)
    }
  }

  const navItems = [
    { key: 'overview', label: 'Overview', icon: '🏠', active: page === 'overview', onClick: () => setPage('overview') },
    { key: 'children', label: 'Children', icon: '👧', active: page === 'children', onClick: () => setPage('children') },
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
              <p className="stat-label">Children</p>
              <p className="stat-value">{children.length}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Total Results</p>
              <p className="stat-value">{results.length}</p>
            </div>
          </div>
          <div className="card">
            <p className="card-title">Recent Results</p>
            <table>
              <thead><tr><th>Child</th><th>Exam</th><th>Score</th></tr></thead>
              <tbody>
                {results.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--text)' }}>No results yet.</td></tr>}
                {results.slice(0, 5).map(r => (
                  <tr key={r.id}>
                    <td>{r.profiles?.full_name || r.profiles?.username || '—'}</td>
                    <td>{r.exams?.title || '—'}</td>
                    <td>{r.score ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {page === 'children' && (
        <div className="card">
          <p className="card-title">My Children</p>
          <table>
            <thead><tr><th>Name</th><th>Username</th></tr></thead>
            <tbody>
              {children.length === 0 && <tr><td colSpan={2} style={{ textAlign: 'center', color: 'var(--text)' }}>No children linked.</td></tr>}
              {children.map(c => (
                <tr key={c.id}>
                  <td>{c.full_name || '—'}</td>
                  <td>{c.username}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {page === 'results' && (
        <div className="card">
          <p className="card-title">All Results</p>
          <table>
            <thead><tr><th>Child</th><th>Exam</th><th>Score</th><th>Remarks</th></tr></thead>
            <tbody>
              {results.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text)' }}>No results yet.</td></tr>}
              {results.map(r => (
                <tr key={r.id}>
                  <td>{r.profiles?.full_name || r.profiles?.username || '—'}</td>
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
