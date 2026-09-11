import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function MyChildrenPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'parent') redirect('/dashboard')

  const { data: children } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      email,
      class_id,
      classes ( name )
    `)
    .eq('parent_email', profile.email)
    .order('full_name')

  // Get recent scores per child
  const childIds = children?.map((c) => c.id) ?? []
  let recentScores: Record<string, { percentage: number; submitted_at: string }[]> = {}

  if (childIds.length > 0) {
    const { data: attempts } = await supabase
      .from('exam_attempts')
      .select('student_id, percentage, submitted_at')
      .in('student_id', childIds)
      .order('submitted_at', { ascending: false })

    recentScores = childIds.reduce((acc, id) => {
      acc[id] = (attempts ?? [])
        .filter((a) => a.student_id === id)
        .slice(0, 3)
      return acc
    }, {} as Record<string, { percentage: number; submitted_at: string }[]>)
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Children</h1>
          <p className="text-sm text-gray-500 mt-1">Academic overview for your children</p>
        </div>
        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-[#f5f0ff] text-[#681DF4]">
          {children?.length ?? 0} {children?.length === 1 ? 'child' : 'children'}
        </span>
      </div>

      <div className="grid gap-5">
        {children && children.length > 0 ? (
          children.map((child) => {
            const cls = child.classes as unknown as { name: string } | null
            const scores = recentScores[child.id] ?? []
            const avg = scores.length > 0
              ? scores.reduce((s, a) => s + a.percentage, 0) / scores.length
              : null

            return (
              <div key={child.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: '#681DF4' }}
                    >
                      {child.full_name?.[0]?.toUpperCase() ?? 'C'}
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">{child.full_name}</h2>
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-700">
                        {cls?.name ?? 'No class assigned'}
                      </span>
                    </div>
                  </div>
                  {avg !== null && (
                    <div className="text-right">
                      <p className="text-lg font-bold" style={{ color: '#681DF4' }}>
                        {avg.toFixed(0)}%
                      </p>
                      <p className="text-xs text-gray-400">Avg. score</p>
                    </div>
                  )}
                </div>

                {scores.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Recent Scores</p>
                    <div className="flex flex-wrap gap-2">
                      {scores.map((s, i) => {
                        const color = s.percentage >= 70
                          ? 'bg-green-50 text-green-700'
                          : s.percentage >= 50
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-red-50 text-red-700'
                        return (
                          <span key={i} className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${color}`}>
                            {s.percentage.toFixed(0)}%
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}

                {scores.length === 0 && (
                  <p className="text-sm text-gray-400">No exam attempts yet.</p>
                )}
              </div>
            )
          })
        ) : (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No children linked to your account yet. Contact the school administrator.</p>
          </div>
        )}
      </div>
    </div>
  )
}
