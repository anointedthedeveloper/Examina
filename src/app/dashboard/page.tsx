import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types'

const ROLE_BADGE: Record<string, string> = {
  admin:   'bg-red-100 text-red-700',
  teacher: 'bg-blue-100 text-blue-700',
  student: 'bg-green-100 text-green-700',
  parent:  'bg-orange-100 text-orange-700',
}

interface StatCardProps {
  label: string
  value: number | string
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <p className="text-sm text-gray-500 font-medium mb-2">{label}</p>
      <p className="text-3xl font-bold" style={{ color: '#681DF4' }}>{value}</p>
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const p = profile as Profile
  const firstName = p.full_name?.split(' ')[0] ?? 'User'

  // Fetch counts based on role
  let stats: StatCardProps[] = []

  if (p.role === 'admin' || p.role === 'teacher') {
    const [classes, questions, exams, students] = await Promise.all([
      supabase.from('classes').select('id', { count: 'exact', head: true }),
      supabase.from('questions').select('id', { count: 'exact', head: true }),
      supabase.from('exams').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
    ])
    stats = [
      { label: 'Total Classes',    value: classes.count   ?? 0 },
      { label: 'Total Questions',  value: questions.count ?? 0 },
      { label: 'Total Exams',      value: exams.count     ?? 0 },
      { label: 'Total Students',   value: students.count  ?? 0 },
    ]
  } else if (p.role === 'student') {
    const classId = p.class_id
    const [available, taken] = await Promise.all([
      classId
        ? supabase.from('exams').select('id', { count: 'exact', head: true }).eq('class_id', classId)
        : Promise.resolve({ count: 0 }),
      supabase.from('exam_attempts').select('id', { count: 'exact', head: true }).eq('student_id', p.id),
    ])
    stats = [
      { label: 'Available Exams', value: available.count ?? 0 },
      { label: 'Exams Taken',     value: taken.count    ?? 0 },
    ]
  } else if (p.role === 'parent') {
    const [children, reports] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('parent_email', p.email),
      supabase.from('report_cards').select('id', { count: 'exact', head: true }).eq('parent_email', p.email),
    ])
    stats = [
      { label: 'My Children', value: children.count ?? 0 },
      { label: 'Reports Sent', value: reports.count ?? 0 },
    ]
  }

  const quickActions: { label: string; href: string }[] = p.role === 'admin'
    ? [
        { label: 'New Class',    href: '/dashboard/classes/new' },
        { label: 'New Subject',  href: '/dashboard/subjects/new' },
        { label: 'New Question', href: '/dashboard/questions/new' },
        { label: 'New Exam',     href: '/dashboard/exams/new' },
      ]
    : p.role === 'teacher'
    ? [
        { label: 'New Question', href: '/dashboard/questions/new' },
        { label: 'New Exam',     href: '/dashboard/exams/new' },
        { label: 'View Results', href: '/dashboard/results' },
      ]
    : p.role === 'student'
    ? [
        { label: 'Take Exam',    href: '/dashboard/my-exams' },
        { label: 'My Results',   href: '/dashboard/my-results' },
      ]
    : [
        { label: 'My Children',  href: '/dashboard/my-children' },
        { label: 'Report Cards', href: '/dashboard/report-cards' },
      ]

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Page heading */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {firstName} 👋
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Here&apos;s what&apos;s happening at Peter Harvard International Schools today.
          </p>
        </div>
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${ROLE_BADGE[p.role] ?? 'bg-gray-100 text-gray-600'}`}>
          {p.role}
        </span>
      </div>

      {/* Stats */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <StatCard key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="rounded-xl px-4 py-2 text-sm font-medium bg-[#681DF4] text-white hover:bg-[#5a12d4] transition-colors"
            >
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
