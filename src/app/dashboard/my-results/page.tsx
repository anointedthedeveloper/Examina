import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function gradeFromPercentage(pct: number): { label: string; color: string } {
  if (pct >= 70) return { label: 'A', color: 'bg-green-50 text-green-700' }
  if (pct >= 60) return { label: 'B', color: 'bg-blue-50 text-blue-700' }
  if (pct >= 50) return { label: 'C', color: 'bg-yellow-50 text-yellow-700' }
  if (pct >= 40) return { label: 'D', color: 'bg-orange-50 text-orange-700' }
  return { label: 'F', color: 'bg-red-50 text-red-700' }
}

export default async function MyResultsPage() {
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
      exams ( title, subjects ( name ) )
    `)
    .eq('student_id', user.id)
    .order('submitted_at', { ascending: false })

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Results</h1>
          <p className="text-sm text-gray-500 mt-1">Your exam history and scores</p>
        </div>
        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[#f5f0ff] text-[#681DF4]">
          {attempts?.length ?? 0} exams taken
        </span>
      </div>

      <div className="grid gap-4">
        {attempts && attempts.length > 0 ? (
          attempts.map((a) => {
            const exam = a.exams as unknown as { title: string; subjects: { name: string } | null } | null
            const grade = gradeFromPercentage(a.percentage)
            return (
              <div
                key={a.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h2 className="text-base font-semibold text-gray-900">{exam?.title ?? 'Unknown Exam'}</h2>
                  <div className="flex items-center gap-2 mt-1.5">
                    {exam?.subjects && (
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-700">
                        {exam.subjects.name}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(a.submitted_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold" style={{ color: '#681DF4' }}>
                      {a.score}/{a.total}
                    </p>
                    <p className="text-xs text-gray-400">{a.percentage.toFixed(0)}%</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full w-10 h-10 justify-center text-sm font-bold ${grade.color}`}>
                    {grade.label}
                  </span>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No exam results yet. Take an exam to see your scores here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
