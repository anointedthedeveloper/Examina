import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function ClassesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: classes } = await supabase
    .from('classes')
    .select(`
      id,
      name,
      created_at,
      teacher_id,
      profiles!classes_teacher_id_fkey ( full_name )
    `)
    .order('created_at', { ascending: false })

  // Get student counts per class
  const { data: studentCounts } = await supabase
    .from('profiles')
    .select('class_id')
    .eq('role', 'student')
    .not('class_id', 'is', null)

  const countMap: Record<string, number> = {}
  studentCounts?.forEach((s) => {
    if (s.class_id) countMap[s.class_id] = (countMap[s.class_id] ?? 0) + 1
  })

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Heading row */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-sm text-gray-500 mt-1">All classes in the school</p>
        </div>
        <Link
          href="/dashboard/classes/new"
          className="bg-[#681DF4] text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#5a12d4] transition-colors"
        >
          + New Class
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {classes && classes.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Class</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Teacher</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Students</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((cls, i) => {
                const teacher = cls.profiles as unknown as { full_name: string } | null
                return (
                  <tr key={cls.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-6 py-4 font-medium text-gray-900">{cls.name}</td>
                    <td className="px-6 py-4 text-gray-600">{teacher?.full_name ?? '—'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-[#f5f0ff] text-[#681DF4]">
                        {countMap[cls.id] ?? 0} students
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(cls.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No classes yet. Create your first class.</p>
          </div>
        )}
      </div>
    </div>
  )
}
