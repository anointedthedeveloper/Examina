import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from './supabase'
import { Icons } from './Icons'
import Layout from './Layout'

const PAGE_ROUTES = { overview: '/dashboard', children: '/dashboard/children', results: '/dashboard/results' }

export default function ParentDashboard({ profile, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const getPage = () => { const p = location.pathname; if (p.includes('children')) return 'children'; if (p.includes('results')) return 'results'; return 'overview' }
  const page = getPage()
  const setPage = (p) => navigate(PAGE_ROUTES[p] || '/dashboard')
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
      const { data: res } = await supabase
        .from('results')
        .select('id, score, remarks, student_id, exams(title), profiles!student_id(full_name, username)')
        .in('student_id', kids.map(k => k.id))
        .order('created_at', { ascending: false })
      if (res) setResults(res)
    }
  }

  const navItems = [
    { key: 'overview', label: 'Overview', icon: Icons.overview, active: page === 'overview', onClick: () => setPage('overview') },
    { key: 'children', label: 'Children', icon: Icons.children, active: page === 'children', onClick: () => setPage('children') },
    { key: 'results', label: 'Results', icon: Icons.results, active: page === 'results', onClick: () => setPage('results') },
  ]

  return (
    <Layout profile={profile} onLogout={onLogout} navItems={navItems}>
      <p className="pageTitle">
        {page === 'overview' ? `Welcome, ${profile.full_name || profile.username}` : page.charAt(0).toUpperCase() + page.slice(1)}
      </p>

      {page === 'overview' && (
        <>
          <div className="statsRow">
            <div className="statCard"><p className="statLabel">Children</p><p className="statValue">{children.length}</p></div>
            <div className="statCard"><p className="statLabel">Total Results</p><p className="statValue">{results.length}</p></div>
          </div>
          <div className="card">
            <p className="cardTitle">Recent Results</p>
            <table>
              <thead><tr><th>Child</th><th>Exam</th><th>Score</th></tr></thead>
              <tbody>
                {results.length === 0 && <tr><td colSpan={3} className="emptyRow">No results yet.</td></tr>}
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
          <p className="cardTitle">My Children</p>
          <table>
            <thead><tr><th>Name</th><th>Username</th></tr></thead>
            <tbody>
              {children.length === 0 && <tr><td colSpan={2} className="emptyRow">No children linked.</td></tr>}
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
          <p className="cardTitle">All Results</p>
          <table>
            <thead><tr><th>Child</th><th>Exam</th><th>Score</th><th>Remarks</th></tr></thead>
            <tbody>
              {results.length === 0 && <tr><td colSpan={4} className="emptyRow">No results yet.</td></tr>}
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
