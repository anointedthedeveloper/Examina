import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from './supabase'
import { toAuthEmail, generateUniqueUsername } from './utils'
import { Icons } from './Icons'
import Layout from './Layout'

const ALL_ROLES = ['teacher', 'student', 'parent']

const PAGE_ROUTES = {
  overview: '/dashboard',
  teacher: '/dashboard/teachers',
  student: '/dashboard/students',
  parent: '/dashboard/parents',
  classes: '/dashboard/classes',
  subjects: '/dashboard/subjects',
}

export default function AdminDashboard({ profile, onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()

  const getPage = () => {
    const p = location.pathname
    if (p.includes('teachers')) return 'teacher'
    if (p.includes('students')) return 'student'
    if (p.includes('parents')) return 'parent'
    if (p.includes('classes')) return 'classes'
    if (p.includes('subjects')) return 'subjects'
    return 'overview'
  }

  const page = getPage()
  const setPage = (p) => navigate(PAGE_ROUTES[p] || '/dashboard')

  const [users, setUsers] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [stats, setStats] = useState({ teachers: 0, students: 0, parents: 0, classes: 0, subjects: 0 })
  const [pageLoading, setPageLoading] = useState(true)

  // User modal
  const [showUserModal, setShowUserModal] = useState(false)
  const [userForm, setUserForm] = useState({ fullName: '', username: '', password: '', role: 'student' })
  const [userFormError, setUserFormError] = useState('')
  const [savingUser, setSavingUser] = useState(false)

  // Class modal
  const [showClassModal, setShowClassModal] = useState(false)
  const [classForm, setClassForm] = useState({ name: '' })
  const [classFormError, setClassFormError] = useState('')
  const [savingClass, setSavingClass] = useState(false)

  // Subject modal
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [subjectName, setSubjectName] = useState('')
  const [savingSubject, setSavingSubject] = useState(false)

  // Enroll students modal
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [enrollClassId, setEnrollClassId] = useState(null)
  const [enrolledStudentIds, setEnrolledStudentIds] = useState([])
  const [selectedStudents, setSelectedStudents] = useState([])
  const [savingEnroll, setSavingEnroll] = useState(false)

  // Assign teachers modal
  const [showTeacherModal, setShowTeacherModal] = useState(false)
  const [assignClassId, setAssignClassId] = useState(null)
  const [assignedTeacherIds, setAssignedTeacherIds] = useState([])
  const [selectedTeachers, setSelectedTeachers] = useState([])
  const [savingTeachers, setSavingTeachers] = useState(false)

  // Assign subjects modal
  const [showSubjectAssignModal, setShowSubjectAssignModal] = useState(false)
  const [assignSubjectClassId, setAssignSubjectClassId] = useState(null)
  const [assignedSubjectIds, setAssignedSubjectIds] = useState([])
  const [selectedSubjects, setSelectedSubjects] = useState([])
  const [savingSubjects, setSavingSubjects] = useState(false)

  // Reset password modal
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetUser, setResetUser] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [resetError, setResetError] = useState('')
  const [savingReset, setSavingReset] = useState(false)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    setPageLoading(true)
    const [
      { data: usersData },
      { data: classesData },
      { data: subjectsData },
    ] = await Promise.all([
      supabase.from('profiles')
        .select('id, username, fullName:full_name, role, createdAt:created_at')
        .neq('role', 'admin')
        .order('created_at', { ascending: false }),
      supabase.from('classes')
        .select('id, name, createdAt:created_at')
        .order('created_at', { ascending: false }),
      supabase.from('subjects')
        .select('id, name, createdAt:created_at')
        .order('name'),
    ])
    if (usersData) {
      setUsers(usersData)
      setStats(s => ({
        ...s,
        teachers: usersData.filter(u => u.role === 'teacher').length,
        students: usersData.filter(u => u.role === 'student').length,
        parents: usersData.filter(u => u.role === 'parent').length,
      }))
    }
    if (classesData) {
      setClasses(classesData)
      setStats(s => ({ ...s, classes: classesData.length }))
    }
    if (subjectsData) {
      setSubjects(subjectsData)
      setStats(s => ({ ...s, subjects: subjectsData.length }))
    }
    setPageLoading(false)
  }

  // ── User ──
  const openUserModal = () => {
    const autoRole = ALL_ROLES.includes(page) ? page : 'student'
    setUserForm({ fullName: '', username: '', password: '', role: autoRole })
    setUserFormError('')
    setShowUserModal(true)
  }

  const handleUsernameBlur = async () => {
    if (!userForm.username) return
    const unique = await generateUniqueUsername(userForm.username)
    if (unique !== userForm.username.toLowerCase().replace(/\s+/g, '')) {
      setUserForm(f => ({ ...f, username: unique }))
      setUserFormError(`Username taken — suggested: ${unique}`)
    } else setUserFormError('')
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    setUserFormError('')
    setSavingUser(true)
    const finalUsername = await generateUniqueUsername(userForm.username)
    const email = toAuthEmail(finalUsername)
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: { email, password: userForm.password, username: finalUsername, full_name: userForm.fullName, role: userForm.role },
    })
    if (error || data?.error) {
      setUserFormError(data?.error || error?.message || 'Failed to create user.')
      setSavingUser(false)
      return
    }
    setShowUserModal(false)
    setSavingUser(false)
    fetchAll()
  }

  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user?')) return
    await supabase.from('profiles').delete().eq('id', id)
    fetchAll()
  }

  const openResetModal = (user) => {
    setResetUser(user)
    setNewPassword('')
    setResetError('')
    setShowResetModal(true)
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setResetError('')
    setSavingReset(true)
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: { action: 'reset-password', user_id: resetUser.id, password: newPassword },
    })
    if (error || data?.error) {
      setResetError(data?.error || error?.message || 'Failed to reset password.')
      setSavingReset(false)
      return
    }
    setShowResetModal(false)
    setSavingReset(false)
  }

  // ── Class ──
  const handleAddClass = async (e) => {
    e.preventDefault()
    setClassFormError('')
    setSavingClass(true)
    const { error } = await supabase.from('classes').insert({ name: classForm.name })
    if (error) { setClassFormError(error.message); setSavingClass(false); return }
    setShowClassModal(false)
    setClassForm({ name: '' })
    setSavingClass(false)
    fetchAll()
  }

  const handleDeleteClass = async (id) => {
    if (!confirm('Delete this class?')) return
    await supabase.from('classes').delete().eq('id', id)
    fetchAll()
  }

  // ── Subject ──
  const handleAddSubject = async (e) => {
    e.preventDefault()
    setSavingSubject(true)
    await supabase.from('subjects').insert({ name: subjectName })
    setShowSubjectModal(false)
    setSubjectName('')
    setSavingSubject(false)
    fetchAll()
  }

  const handleDeleteSubject = async (id) => {
    if (!confirm('Delete this subject?')) return
    await supabase.from('subjects').delete().eq('id', id)
    fetchAll()
  }

  // ── Enroll students ──
  const openEnrollModal = async (classId) => {
    setEnrollClassId(classId)
    setSelectedStudents([])
    const { data } = await supabase.from('enrollments').select('student_id').eq('class_id', classId)
    setEnrolledStudentIds(data?.map(e => e.student_id) || [])
    setShowEnrollModal(true)
  }

  const handleBulkEnroll = async () => {
    setSavingEnroll(true)
    const toEnroll = selectedStudents.filter(id => !enrolledStudentIds.includes(id))
    if (toEnroll.length > 0) {
      await supabase.from('enrollments').insert(
        toEnroll.map(studentId => ({ student_id: studentId, class_id: enrollClassId }))
      )
    }
    setSavingEnroll(false)
    setShowEnrollModal(false)
    fetchAll()
  }

  // ── Assign teachers ──
  const openTeacherModal = async (classId) => {
    setAssignClassId(classId)
    setSelectedTeachers([])
    const { data } = await supabase.from('class_teachers').select('teacher_id').eq('class_id', classId)
    setAssignedTeacherIds(data?.map(t => t.teacher_id) || [])
    setShowTeacherModal(true)
  }

  const handleAssignTeachers = async () => {
    setSavingTeachers(true)
    const toAdd = selectedTeachers.filter(id => !assignedTeacherIds.includes(id))
    if (toAdd.length > 0) {
      await supabase.from('class_teachers').insert(
        toAdd.map(teacherId => ({ teacher_id: teacherId, class_id: assignClassId }))
      )
    }
    setSavingTeachers(false)
    setShowTeacherModal(false)
    fetchAll()
  }

  // ── Assign subjects ──
  const openSubjectAssignModal = async (classId) => {
    setAssignSubjectClassId(classId)
    setSelectedSubjects([])
    const { data } = await supabase.from('class_subjects').select('subject_id').eq('class_id', classId)
    setAssignedSubjectIds(data?.map(s => s.subject_id) || [])
    setShowSubjectAssignModal(true)
  }

  const handleAssignSubjects = async () => {
    setSavingSubjects(true)
    const toAdd = selectedSubjects.filter(id => !assignedSubjectIds.includes(id))
    if (toAdd.length > 0) {
      await supabase.from('class_subjects').insert(
        toAdd.map(subjectId => ({ subject_id: subjectId, class_id: assignSubjectClassId }))
      )
    }
    setSavingSubjects(false)
    setShowSubjectAssignModal(false)
    fetchAll()
  }

  const students = users.filter(u => u.role === 'student')
  const teachers = users.filter(u => u.role === 'teacher')
  const filteredUsers = ALL_ROLES.includes(page) ? users.filter(u => u.role === page) : users
  const pageLabel = { overview: 'Overview', classes: 'Classes', subjects: 'Subjects', teacher: 'Teachers', student: 'Students', parent: 'Parents' }[page] || 'Overview'

  const navItems = [
    { key: 'overview', label: 'Overview', icon: Icons.overview, active: page === 'overview', onClick: () => setPage('overview') },
    {
      key: 'users', label: 'Users', icon: Icons.teachers,
      active: ['teacher', 'student', 'parent'].includes(page),
      onClick: () => setPage('teacher'),
      children: [
        { key: 'teacher', label: 'Teachers', active: page === 'teacher', onClick: () => setPage('teacher') },
        { key: 'student', label: 'Students', active: page === 'student', onClick: () => setPage('student') },
        { key: 'parent', label: 'Parents', active: page === 'parent', onClick: () => setPage('parent') },
      ],
    },
    { key: 'classes', label: 'Classes', icon: Icons.classes, active: page === 'classes', onClick: () => setPage('classes') },
    { key: 'subjects', label: 'Subjects', icon: Icons.exams, active: page === 'subjects', onClick: () => setPage('subjects') },
  ]

  const CheckboxModal = ({ title, items, assignedIds, selected, onToggle, onSave, saving, onClose, badgeLabel }) => (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{title}</h2>
        <div className="checkboxList">
          {items.length === 0 && <p style={{ fontSize: 13, color: 'var(--text)' }}>None available.</p>}
          {items.map(item => {
            const already = assignedIds.includes(item.id)
            const checked = already || selected.includes(item.id)
            return (
              <label key={item.id} className="checkboxItem">
                <input type="checkbox" checked={checked} disabled={already} onChange={() => !already && onToggle(item.id)} />
                {item.fullName || item.name || item.username}
                {already && <span className="badge" style={{ marginLeft: 6 }}>{badgeLabel}</span>}
              </label>
            )
          })}
        </div>
        <div className="modalActions">
          <button className="btn btnSecondary" onClick={onClose}>Cancel</button>
          <button className="btn btnPrimary" onClick={onSave} disabled={saving || selected.length === 0}>
            {saving && <span className="loader" />}
            {saving ? 'Saving…' : `Assign${selected.length > 0 ? ` (${selected.length})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <Layout profile={profile} onLogout={onLogout} navItems={navItems}>
      <p className="pageTitle">{pageLabel}</p>

      {pageLoading ? (
        <div className="pageLoader"><div className="pageLoaderSpinner" /></div>
      ) : (
        <>
          {page === 'overview' && (
            <div className="statsRow">
              <div className="statCard"><p className="statLabel">Teachers</p><p className="statValue">{stats.teachers}</p></div>
              <div className="statCard"><p className="statLabel">Students</p><p className="statValue">{stats.students}</p></div>
              <div className="statCard"><p className="statLabel">Parents</p><p className="statValue">{stats.parents}</p></div>
              <div className="statCard"><p className="statLabel">Classes</p><p className="statValue">{stats.classes}</p></div>
              <div className="statCard"><p className="statLabel">Subjects</p><p className="statValue">{stats.subjects}</p></div>
            </div>
          )}

          {page === 'classes' && (
            <div className="card">
              <div className="cardHeader">
                <p className="cardTitle">Classes</p>
                <button className="btn btnPrimary" onClick={() => { setClassForm({ name: '' }); setClassFormError(''); setShowClassModal(true) }}>+ Add Class</button>
              </div>
              <div className="tableWrap">
                <table>
                  <thead><tr><th>Class Name</th><th>Created</th><th></th></tr></thead>
                  <tbody>
                    {classes.length === 0 && <tr><td colSpan={3} className="emptyRow">No classes yet.</td></tr>}
                    {classes.map(c => (
                      <tr key={c.id}>
                        <td>{c.name}</td>
                        <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td><div className="tdActions">
                          <button className="btn btnPrimary" onClick={() => openEnrollModal(c.id)}>Enroll Students</button>
                          <button className="btn btnPrimary" onClick={() => openTeacherModal(c.id)}>Assign Teachers</button>
                          <button className="btn btnPrimary" onClick={() => openSubjectAssignModal(c.id)}>Assign Subjects</button>
                          <button className="btn btnDanger" onClick={() => handleDeleteClass(c.id)}>Delete</button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {page === 'subjects' && (
            <div className="card">
              <div className="cardHeader">
                <p className="cardTitle">Subjects</p>
                <button className="btn btnPrimary" onClick={() => { setSubjectName(''); setShowSubjectModal(true) }}>+ Add Subject</button>
              </div>
              <div className="tableWrap">
                <table>
                  <thead><tr><th>Subject Name</th><th>Created</th><th></th></tr></thead>
                  <tbody>
                    {subjects.length === 0 && <tr><td colSpan={3} className="emptyRow">No subjects yet.</td></tr>}
                    {subjects.map(s => (
                      <tr key={s.id}>
                        <td>{s.name}</td>
                        <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                        <td><button className="btn btnDanger" onClick={() => handleDeleteSubject(s.id)}>Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(ALL_ROLES.includes(page) || page === 'overview') && (
            <div className="card">
              <div className="cardHeader">
                <p className="cardTitle">{page === 'overview' ? 'All Users' : pageLabel}</p>
                <button className="btn btnPrimary" onClick={openUserModal}>+ Add User</button>
              </div>
              <div className="tableWrap">
                <table>
                  <thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Joined</th><th></th></tr></thead>
                  <tbody>
                    {filteredUsers.length === 0 && <tr><td colSpan={5} className="emptyRow">No users found.</td></tr>}
                    {filteredUsers.map(u => (
                      <tr key={u.id}>
                        <td>{u.fullName || '—'}</td>
                        <td>{u.username}</td>
                        <td><span className="badge">{u.role}</span></td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td><div className="tdActions">
                          <button className="btn btnSecondary" onClick={() => openResetModal(u)}>Reset Password</button>
                          <button className="btn btnDanger" onClick={() => handleDeleteUser(u.id)}>Delete</button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add User Modal */}
      {showUserModal && (
        <div className="modalOverlay" onClick={() => setShowUserModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add User</h2>
            <form onSubmit={handleAddUser}>
              <div className="field"><label>Full Name</label>
                <input value={userForm.fullName} onChange={e => setUserForm({ ...userForm, fullName: e.target.value })} placeholder="John Doe" required />
              </div>
              <div className="field"><label>Username</label>
                <input value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value.toLowerCase() })} onBlur={handleUsernameBlur} placeholder="johndoe" required />
              </div>
              <div className="field"><label>Password</label>
                <input type="password" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} placeholder="••••••••" required />
              </div>
              <div className="field"><label>Role</label>
                <select value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
                  {ALL_ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
              </div>
              {userFormError && <p className="errorMsg">{userFormError}</p>}
              <div className="modalActions">
                <button type="button" className="btn btnSecondary" onClick={() => setShowUserModal(false)}>Cancel</button>
                <button type="submit" className="btn btnPrimary" disabled={savingUser}>
                  {savingUser && <span className="loader" />}{savingUser ? 'Saving…' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Class Modal */}
      {showClassModal && (
        <div className="modalOverlay" onClick={() => setShowClassModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add Class</h2>
            <form onSubmit={handleAddClass}>
              <div className="field"><label>Class Name</label>
                <input value={classForm.name} onChange={e => setClassForm({ name: e.target.value })} placeholder="e.g. Grade 10 - A" required />
              </div>
              {classFormError && <p className="errorMsg">{classFormError}</p>}
              <div className="modalActions">
                <button type="button" className="btn btnSecondary" onClick={() => setShowClassModal(false)}>Cancel</button>
                <button type="submit" className="btn btnPrimary" disabled={savingClass}>
                  {savingClass && <span className="loader" />}{savingClass ? 'Saving…' : 'Add Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {showSubjectModal && (
        <div className="modalOverlay" onClick={() => setShowSubjectModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Add Subject</h2>
            <form onSubmit={handleAddSubject}>
              <div className="field"><label>Subject Name</label>
                <input value={subjectName} onChange={e => setSubjectName(e.target.value)} placeholder="e.g. Mathematics" required />
              </div>
              <div className="modalActions">
                <button type="button" className="btn btnSecondary" onClick={() => setShowSubjectModal(false)}>Cancel</button>
                <button type="submit" className="btn btnPrimary" disabled={savingSubject}>
                  {savingSubject && <span className="loader" />}{savingSubject ? 'Saving…' : 'Add Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEnrollModal && (
        <CheckboxModal title="Enroll Students" items={students} assignedIds={enrolledStudentIds}
          selected={selectedStudents} onToggle={id => setSelectedStudents(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])}
          onSave={handleBulkEnroll} saving={savingEnroll} onClose={() => setShowEnrollModal(false)} badgeLabel="Enrolled" />
      )}

      {showTeacherModal && (
        <CheckboxModal title="Assign Teachers" items={teachers} assignedIds={assignedTeacherIds}
          selected={selectedTeachers} onToggle={id => setSelectedTeachers(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])}
          onSave={handleAssignTeachers} saving={savingTeachers} onClose={() => setShowTeacherModal(false)} badgeLabel="Assigned" />
      )}

      {showSubjectAssignModal && (
        <CheckboxModal title="Assign Subjects" items={subjects} assignedIds={assignedSubjectIds}
          selected={selectedSubjects} onToggle={id => setSelectedSubjects(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])}
          onSave={handleAssignSubjects} saving={savingSubjects} onClose={() => setShowSubjectAssignModal(false)} badgeLabel="Assigned" />
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="modalOverlay" onClick={() => setShowResetModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Reset Password</h2>
            <p style={{ fontSize: 13, color: 'var(--text)', marginBottom: 16 }}>
              Setting new password for <strong>{resetUser?.fullName || resetUser?.username}</strong>
            </p>
            <form onSubmit={handleResetPassword}>
              <div className="field"><label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  minLength={6}
                  required
                />
              </div>
              {resetError && <p className="errorMsg">{resetError}</p>}
              <div className="modalActions">
                <button type="button" className="btn btnSecondary" onClick={() => setShowResetModal(false)}>Cancel</button>
                <button type="submit" className="btn btnPrimary" disabled={savingReset}>
                  {savingReset && <span className="loader" />}{savingReset ? 'Saving…' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
