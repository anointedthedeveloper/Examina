import AdminDashboard from './AdminDashboard'
import TeacherDashboard from './TeacherDashboard'
import StudentDashboard from './StudentDashboard'
import ParentDashboard from './ParentDashboard'

export default function Dashboard({ profile, onLogout }) {
  switch (profile.role) {
    case 'admin':   return <AdminDashboard   profile={profile} onLogout={onLogout} />
    case 'teacher': return <TeacherDashboard profile={profile} onLogout={onLogout} />
    case 'student': return <StudentDashboard profile={profile} onLogout={onLogout} />
    case 'parent':  return <ParentDashboard  profile={profile} onLogout={onLogout} />
    default:        return <p>Unknown role.</p>
  }
}
