import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/lib/types'

function gradeFromPercentage(pct: number): { label: string; color: string } {
  if (pct >= 70) return { label: 'A', color: 'bg-green-50 text-green-700' }
  if (pct >= 60) return { label: 'B', color: 'bg-blue-50 text-blue-700' }
  if (pct >= 50) return { label: 'C', color: 'bg-yellow-50 text-yellow-700' }
  if (pct >= 40) return { label: 'D', color: 'bg-orange-50 text-orange-700' }
  return { label: 'F', color: 'bg-red-50 text-red-700' }
}

export default async function ReportCardsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!rawProfile) redirect('/login')

  const profile = rawProfile as Profile

  if (profile.role === 'admin' || profile.role === 'teacher') {
    // Show all sent report cards
    const { data: reportCards } = await supabase
      .from('report_cards')
      .select(`
        id,
        sent_at,
        parent_email,
        exam_attempts (
          score, total, percentage,
          profiles!exam_attempts_student_id_fkey ( full_name ),
          exams ( title )
        )
      `)
      .order('sent_at', { ascending: false })

    return (
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Report Cards</h1>
            <p className="text-sm text-gray-500 mt-1">Report cards sent to parents</p>
          </div>
          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[#f5f0ff] text-[#681DF4]">
            {reportCards?.length ?? 0} sent
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {reportCards && reportCards.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Exam</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Parent Email</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sent</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reportCards.map((rc, i) => {
                  const attempt = rc.exam_attempts as unknown as {
                    score: number; total: number; percentage: number
                    profiles: { full_name: string } | null
                    exams: { title: string } | null
                  } | null
                  const grade = gradeFromPercentage(attempt?.percentage ?? 0)
                  return (
                    <tr key={rc.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="px-6 py-4 font-medium text-gray-900">{attempt?.profiles?.full_name ?? '—'}</td>
                      <td className="px-6 py-4 text-gray-600 max-w-xs truncate">{attempt?.exams?.title ?? '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700">{attempt?.score}/{attempt?.total}</span>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${grade.color}`}>
                            {grade.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">{rc.parent_email}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {new Date(rc.sent_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <form action="/api/report-cards/send" method="POST">
                          <input type="hidden" name="attempt_id" value={(rc.exam_attempts as unknown as { id?: string } | null)?.id ?? ''} />
                          <button
                            type="submit"
                            className="text-xs font-medium text-[#681DF4] border border-[#681DF4] rounded-lg px-3 py-1 hover:bg-[#f5f0ff] transition-colors"
                          >
                            Resend
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
              <p className="text-sm">No report cards have been sent yet.</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Parent view: see own children's report cards
  const { data: reportCards } = await supabase
    .from('report_cards')
    .select(`
      id,
      sent_at,
      exam_attempts (
        score, total, percentage, submitted_at,
        profiles!exam_attempts_student_id_fkey ( full_name ),
        exams ( title, subjects ( name ) )
      )
    `)
    .eq('parent_email', profile.email)
    .order('sent_at', { ascending: false })

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report Cards</h1>
          <p className="text-sm text-gray-500 mt-1">Academic report cards for your children</p>
        </div>
        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[#f5f0ff] text-[#681DF4]">
          {reportCards?.length ?? 0} cards
        </span>
      </div>

      <div className="grid gap-4">
        {reportCards && reportCards.length > 0 ? (
          reportCards.map((rc) => {
            const attempt = rc.exam_attempts as unknown as {
              score: number; total: number; percentage: number; submitted_at: string
              profiles: { full_name: string } | null
              exams: { title: string; subjects: { name: string } | null } | null
            } | null
            const grade = gradeFromPercentage(attempt?.percentage ?? 0)
            return (
              <div key={rc.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      {attempt?.profiles?.full_name ?? 'Unknown student'}
                    </h2>
                    <p className="text-sm text-gray-600 mt-0.5">{attempt?.exams?.title ?? '—'}</p>
                    {attempt?.exams?.subjects && (
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 mt-1.5">
                        {attempt.exams.subjects.name}
                      </span>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-2 justify-end">
                      <span className="text-xl font-bold" style={{ color: '#681DF4' }}>
                        {attempt?.score}/{attempt?.total}
                      </span>
                      <span className={`inline-flex items-center rounded-full w-9 h-9 justify-center text-sm font-bold ${grade.color}`}>
                        {grade.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Sent {new Date(rc.sent_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No report cards have been sent to you yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
