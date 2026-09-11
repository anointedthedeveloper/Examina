import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function QuestionsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: questions } = await supabase
    .from('questions')
    .select(`
      id,
      text,
      correct_option,
      created_at,
      subject_id,
      subjects (
        name,
        class_id,
        classes ( name )
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Questions</h1>
          <p className="text-sm text-gray-500 mt-1">Question bank across all subjects</p>
        </div>
        <Link
          href="/dashboard/questions/new"
          className="bg-[#681DF4] text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#5a12d4] transition-colors"
        >
          + New Question
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {questions && questions.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Question</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Class</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Answer</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, i) => {
                const sub = q.subjects as unknown as { name: string; classes: { name: string } | null } | null
                return (
                  <tr key={q.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-6 py-4 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-6 py-4 text-gray-900 max-w-xs">
                      <p className="truncate">{q.text}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-700">
                        {sub?.name ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">
                        {sub?.classes?.name ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold bg-green-50 text-green-700">
                        {q.correct_option}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No questions yet. Add questions to the bank.</p>
          </div>
        )}
      </div>
    </div>
  )
}
