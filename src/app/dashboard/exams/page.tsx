import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function ExamsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: exams } = await supabase
    .from('exams')
    .select(`
      id,
      title,
      duration_minutes,
      created_at,
      subjects ( name ),
      classes ( name )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exams</h1>
          <p className="text-sm text-gray-500 mt-1">All configured exams</p>
        </div>
        <Link
          href="/dashboard/exams/new"
          className="bg-[#681DF4] text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#5a12d4] transition-colors"
        >
          + New Exam
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {exams && exams.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Class</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam, i) => {
                const sub = exam.subjects as unknown as { name: string } | null
                const cls = exam.classes as unknown as { name: string } | null
                return (
                  <tr key={exam.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-6 py-4 font-medium text-gray-900">{exam.title}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-700">
                        {sub?.name ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">
                        {cls?.name ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-purple-50 text-[#681DF4]">
                        {exam.duration_minutes} min
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/results?exam_id=${exam.id}`}
                        className="text-xs font-medium text-[#681DF4] hover:underline"
                      >
                        View Results
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No exams yet. Create your first exam.</p>
          </div>
        )}
      </div>
    </div>
  )
}
