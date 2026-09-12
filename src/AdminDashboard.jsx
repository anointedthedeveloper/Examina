import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { toAuthEmail } from './utils'
import Layout from './Layout'

const ROLES = ['teacher', 'student', 'parent']

export default function AdminDashboard({ profile, onLogout }) {
  const [page, setPage] = useState('overview')
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({ teachers: 0, students: 0, parents: 0 })
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ full_name: '', username: '', password: '', role: 'student' })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, full_name, role, created_at')
      .neq('role', 'admin')
      .order('created_at', { ascending: false })
    if (data) {
      setUsers(data)
      setStats({
        teachers: data.filter(u => u.role === 'teacher').length,
        students: data.filter(u => u.role === 'student').length,
        parents: data.filter(u => u.role === 'parent').length,
      })
    }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setFormError('')
    setSaving(true)

    const email = toAuthEmail(form.username)

    const { data, error } = await supabase.functions.invoke('create-user', {
      body: {
        email,
        password: form.password,
        username: form.username.toLowerCase(),
        full_name: form.full_name,
        role: form.role,
      },
    })

    if (error || data?.error) {
      setFormError(data?.error || error?.message || 'Failed to create user.')
      setSaving(false)
      return
    }

    setShowModal(false)
    setForm({ full_name: '', username: '', password: '', role: 'student' })
    setSaving(false)
    fetchUsers()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return
    await supabase.from('profiles').delete().eq('id', id)
    fetchUsers()
  }

  const filteredUsers = page === 'overview' ? users : users.filter(u => u.role === page)

  const navItems = [
    { key: 'overview', label: 'Overview', icon: '🏠', active: page === 'overview', onClick: () => setPage('overview') },
    { key: 'teacher', label: 'Teachers', icon: '👨‍🏫', active: page === 'teacher', onClick: () => setPage('teacher') },
    { key: 'student', label: 'Students', icon: '🎓', active: page === 'student', onClick: () => setPage('student') },
    { key: 'parent', label: 'Parents', icon: '👨‍👩‍👧', active: page === 'parent', onClick: () => setPage('parent') },
  ]

  return (
    <Layout profile={profile} onLogout={onLogout} navItems={navItems}>
      <p className="page-title">
        {page === 'overview' ? 'Overview' : page.charAt(0).toUpperCase() + page.slice(1) + 's'}
      </p>

      {page === 'overview' && (
        <div className="stats-row">
          <div className="stat-card">
            <p className="stat-label">Teachers</p>
            <p className="stat-value">{stats.teachers}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Students</p>
            <p className="stat-value">{stats.students}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Parents</p>
            <p className="stat-value">{stats.parents}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Total Users</p>
            <p className="stat-value">{users.length}</p>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <p className="card-title" style={{ margin: 0 }}>
            {page === 'overview' ? 'All Users' : page.charAt(0).toUpperCase() + page.slice(1) + 's'}
          </p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add User</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Role</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text)' }}>No users found.</td></tr>
            )}
            {filteredUsers.map(u => (
              <tr key={u.id}>
                <td>{u.full_name || '—'}</td>
                <td>{u.username}</td>
                <td><span className="badge">{u.role}</span></td>
                <td>{new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                  <button className="btn btn-danger" onClick={() => handleDelete(u.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add User</h2>
            <form onSubmit={handleAdd}>
              <div className="field">
                <label>Full Name</label>
                <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="John Doe" required />
              </div>
              <div className="field">
                <label>Username</label>
                <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="johndoe" required />
              </div>
              <div className="field">
                <label>Password</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required />
              </div>
              <div className="field">
                <label>Role</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
              </div>
              {formError && <p className="error-msg">{formError}</p>}
              <div className="modal-actions">
                <button type="button" className="btn" style={{ background: '#f3f4f6', color: 'var(--text-h)' }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Add User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
