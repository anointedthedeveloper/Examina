import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from './supabase'
import { Icons } from './Icons'
import Layout from './Layout'

const PAGE_ROUTES = { overview: '/dashboard', classes: '/dashboard/classes', results: '/dashboard/results' }

export default function StudentDashboard({ profile, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const getPage = () => { const p = location.pathname; if (p.includes('classes')) return 'classes'; if (p.includes('results')) return 'results'; return 'overview' }
  const page = getPage()
  const setPage = (p) => navigate(PAGE_ROUTES[p] || '/dashboard')
  const [classes, setClasses] = useState([])
  const [results, setResults] = useState([])

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    const [{ data: cls }, { data: res }] = await Promise.all([
      supabase.from('enrollments').select('classes(id, name)').eq('student_id', profile.id),
      supabase.from('results').select('id, score, remarks, exams(title, scheduled_at)').eq('student_id', profile.id).order('created_at', { ascending: false }),
    ])
    if (cls) setClasses(cls.map(e => e.classes))
    if (res) setResults(res)
  }

  const navItems = [
    { key: 'overview', label: 'Overview', icon: Icons.overview, active: page === 'overview', onClick: () => setPage('overview') },
    { key: 'classes', label: 'My Classes', icon: Icons.classes, active: page === 'classes', onClick: () => setPage('classes') },
    { key: 'results', label: 'Results', icon: Icons.results, active: page === 'results', onClick: () => setPage('results') },
  ]

  return (
    <Layout profile={profile} onLogout={onLogout} navItems={navItems}>
      <p className="pageTitle">
        {page === 'overview' ? `Welcome, ${profile.full_name || profile.username}` : page === 'classes' ? 'My Classes' : 'Results'}
      </p>

      {page === 'overview' && (
        <>
          <div className="statsRow">
            <div className="statCard"><p className="statLabel">Classes</p><p className="statValue">{classes.length}</p></div>
            <div className="statCard"><p className="statLabel">Exams Taken</p><p className="statValue">{results.length}</p></div>
          </div>
          <div className="card">
            <p className="cardTitle">Recent Results</p>
            <table>
              <thead><tr><th>Exam</th><th>Score</th><th>Remarks</th></tr></thead>
              <tbody>
                {results.length === 0 && <tr><td colSpan={3} className="emptyRow">No results yet.</td></tr>}
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
          <p className="cardTitle">Enrolled Classes</p>
          <table>
            <thead><tr><th>Class Name</th></tr></thead>
            <tbody>
              {classes.length === 0 && <tr><td className="emptyRow">Not enrolled in any class.</td></tr>}
              {classes.map(c => <tr key={c.id}><td>{c.name}</td></tr>)}
            </tbody>
          </table>
        </div>
      )}

      {page === 'results' && (
        <div className="card">
          <p className="cardTitle">All Results</p>
          <table>
            <thead><tr><th>Exam</th><th>Score</th><th>Remarks</th></tr></thead>
            <tbody>
              {results.length === 0 && <tr><td colSpan={3} className="emptyRow">No results yet.</td></tr>}
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
