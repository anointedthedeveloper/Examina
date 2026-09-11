import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function TeachersPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  const { data: teachers } = await supabase
    .from('profiles')
    .select('id, full_name, email, created_at')
    .eq('role', 'teacher')
    .order('full_name')

  // Get classes per teacher
  const { data: classes } = await supabase
    .from('classes')
    .select('teacher_id, name')

  const teacherClasses: Record<string, string[]> = {}
  classes?.forEach((c) => {
    if (!teacherClasses[c.teacher_id]) teacherClasses[c.teacher_id] = []
    teacherClasses[c.teacher_id].push(c.name)
  })

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
          <p className="text-sm text-gray-500 mt-1">All teachers in the school</p>
        </div>
        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[#f5f0ff] text-[#681DF4]">
          {teachers?.length ?? 0} teachers
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {teachers && teachers.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Classes</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t, i) => (
                <tr key={t.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: '#681DF4' }}
                      >
                        {t.full_name?.[0]?.toUpperCase() ?? 'T'}
                      </div>
                      <span className="font-medium text-gray-900">{t.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{t.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(teacherClasses[t.id] ?? []).length > 0
                        ? (teacherClasses[t.id] ?? []).map((cn) => (
                            <span key={cn} className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700">
                              {cn}
                            </span>
                          ))
                        : <span className="text-gray-400 text-xs">No classes</span>
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No teachers found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
