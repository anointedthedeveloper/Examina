import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function gradeFromPercentage(pct: number): { label: string; color: string } {
  if (pct >= 70) return { label: 'A', color: 'bg-green-50 text-green-700' }
  if (pct >= 60) return { label: 'B', color: 'bg-blue-50 text-blue-700' }
  if (pct >= 50) return { label: 'C', color: 'bg-yellow-50 text-yellow-700' }
  if (pct >= 40) return { label: 'D', color: 'bg-orange-50 text-orange-700' }
  return { label: 'F', color: 'bg-red-50 text-red-700' }
}

export default async function ResultsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: attempts } = await supabase
    .from('exam_attempts')
    .select(`
      id,
      score,
      total,
      percentage,
      submitted_at,
      student_id,
      exam_id,
      profiles!exam_attempts_student_id_fkey ( full_name, email ),
      exams ( title )
    `)
    .order('submitted_at', { ascending: false })

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Results</h1>
          <p className="text-sm text-gray-500 mt-1">All exam attempt results</p>
        </div>
        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[#f5f0ff] text-[#681DF4]">
          {attempts?.length ?? 0} attempts
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {attempts && attempts.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Exam</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Percentage</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Grade</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a, i) => {
                const student = a.profiles as unknown as { full_name: string; email: string } | null
                const exam = a.exams as unknown as { title: string } | null
                const grade = gradeFromPercentage(a.percentage)
                return (
                  <tr key={a.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-6 py-4 font-medium text-gray-900">{student?.full_name ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{exam?.title ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-700">{a.score}/{a.total}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-16">
                          <div
                            className="h-1.5 rounded-full"
                            style={{ width: `${a.percentage}%`, background: '#681DF4' }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700">{a.percentage.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${grade.color}`}>
                        {grade.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(a.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <form action="/api/report-cards/send" method="POST">
                        <input type="hidden" name="attempt_id" value={a.id} />
                        <button
                          type="submit"
                          className="text-xs font-medium text-[#681DF4] border border-[#681DF4] rounded-lg px-3 py-1 hover:bg-[#f5f0ff] transition-colors"
                        >
                          Send Report Card
                        </button>
                      </form>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No results yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
