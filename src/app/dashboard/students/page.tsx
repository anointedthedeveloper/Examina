import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function StudentsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: students } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      email,
      class_id,
      created_at,
      classes ( name )
    `)
    .eq('role', 'student')
    .order('full_name')

  // Get last attempt per student
  const { data: attempts } = await supabase
    .from('exam_attempts')
    .select('student_id, percentage, submitted_at')
    .order('submitted_at', { ascending: false })

  const lastAttempt: Record<string, { percentage: number }> = {}
  attempts?.forEach((a) => {
    if (!lastAttempt[a.student_id]) {
      lastAttempt[a.student_id] = { percentage: a.percentage }
    }
  })

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500 mt-1">All students enrolled in the school</p>
        </div>
        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[#f5f0ff] text-[#681DF4]">
          {students?.length ?? 0} students
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {students && students.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Class</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Score</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => {
                const cls = s.classes as unknown as { name: string } | null
                const last = lastAttempt[s.id]
                return (
                  <tr key={s.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ background: '#681DF4' }}
                        >
                          {s.full_name?.[0]?.toUpperCase() ?? 'S'}
                        </div>
                        <span className="font-medium text-gray-900">{s.full_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{s.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-700">
                        {cls?.name ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {last ? (
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          last.percentage >= 70
                            ? 'bg-green-50 text-green-700'
                            : last.percentage >= 50
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {last.percentage.toFixed(0)}%
                        </span>
                      ) : (
                        <span className="text-gray-400 text-xs">No attempts</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No students found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
