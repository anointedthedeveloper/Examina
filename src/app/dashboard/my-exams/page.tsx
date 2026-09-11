import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function MyExamsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('class_id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'student') redirect('/dashboard')

  const classId = profile.class_id

  let exams: Array<{
    id: string
    title: string
    duration_minutes: number
    created_at: string
    subjects: { name: string } | null
  }> = []

  if (classId) {
    const { data } = await supabase
      .from('exams')
      .select(`
        id,
        title,
        duration_minutes,
        created_at,
        subjects ( name )
      `)
      .eq('class_id', classId)
      .order('created_at', { ascending: false })

    if (data) exams = data as typeof exams
  }

  // Get attempts for this student to mark as done
  const { data: attempts } = await supabase
    .from('exam_attempts')
    .select('exam_id, score, total, percentage')
    .eq('student_id', user.id)

  const doneMap: Record<string, { score: number; total: number; percentage: number }> = {}
  attempts?.forEach((a) => { doneMap[a.exam_id] = a })

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Exams</h1>
          <p className="text-sm text-gray-500 mt-1">Exams available for your class</p>
        </div>
      </div>

      {!classId && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-700">
          You have not been assigned to a class yet. Please contact your administrator.
        </div>
      )}

      <div className="grid gap-4">
        {exams.length > 0 ? exams.map((exam) => {
          const done = doneMap[exam.id]
          const sub = exam.subjects as unknown as { name: string } | null
          return (
            <div
              key={exam.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <h2 className="text-base font-semibold text-gray-900">{exam.title}</h2>
                <div className="flex items-center gap-2 mt-1.5">
                  {sub && (
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-700">
                      {sub.name}
                    </span>
                  )}
                  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-[#f5f0ff] text-[#681DF4]">
                    {exam.duration_minutes} min
                  </span>
                  {done && (
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-50 text-green-700">
                      Taken · {done.percentage.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
              {done ? (
                <Link
                  href="/dashboard/my-results"
                  className="border border-[#681DF4] text-[#681DF4] rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#f5f0ff] transition-colors flex-shrink-0"
                >
                  View Result
                </Link>
              ) : (
                <Link
                  href={`/dashboard/my-exams/${exam.id}`}
                  className="bg-[#681DF4] text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#5a12d4] transition-colors flex-shrink-0"
                >
                  Start Exam
                </Link>
              )}
            </div>
          )
        }) : classId ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No exams available for your class right now.</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
