import { Routes, Route, Navigate } from 'react-router-dom'
import AdminDashboard from './AdminDashboard'
import TeacherDashboard from './TeacherDashboard'
import StudentDashboard from './StudentDashboard'
import ParentDashboard from './ParentDashboard'

export default function Dashboard({ profile, onLogout }) {
  const props = { profile, onLogout }

  const roleComponent = {
    admin:   <AdminDashboard   {...props} />,
    teacher: <TeacherDashboard {...props} />,
    student: <StudentDashboard {...props} />,
    parent:  <ParentDashboard  {...props} />,
  }[profile.role] ?? <p>Unknown role.</p>

  return (
    <Routes>
      <Route path="/*" element={roleComponent} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
