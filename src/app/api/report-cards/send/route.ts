import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url), { status: 302 })
    }

    // Support both JSON body (from fetch) and form data (from form submit)
    let attemptId: string | null = null
    const contentType = request.headers.get('content-type') ?? ''

    if (contentType.includes('application/json')) {
      const body = await request.json()
      attemptId = body.attempt_id
    } else {
      const formData = await request.formData()
      attemptId = formData.get('attempt_id') as string | null
    }

    if (!attemptId) {
      return NextResponse.json({ error: 'Missing attempt_id' }, { status: 400 })
    }

    // Get attempt + student info
    const { data: attempt } = await supabase
      .from('exam_attempts')
      .select(`
        id, score, total, percentage, submitted_at,
        student_id,
        profiles!exam_attempts_student_id_fkey ( full_name, email, parent_email ),
        exams ( title, subjects ( name ) )
      `)
      .eq('id', attemptId)
      .single()

    if (!attempt) {
      return NextResponse.json({ error: 'Attempt not found' }, { status: 404 })
    }

    const student = attempt.profiles as unknown as {
      full_name: string; email: string; parent_email: string | null
    } | null

    if (!student?.parent_email) {
      return NextResponse.json({ error: 'Student has no parent email configured.' }, { status: 422 })
    }

    // Insert report card record
    const { error: rcErr } = await supabase
      .from('report_cards')
      .upsert({
        exam_attempt_id: attempt.id,
        parent_email: student.parent_email,
        sent_at: new Date().toISOString(),
        sent_by: user.id,
      }, { onConflict: 'exam_attempt_id' })

    if (rcErr) {
      return NextResponse.json({ error: rcErr.message }, { status: 500 })
    }

    // Redirect back to results page for form submissions
    if (!contentType.includes('application/json')) {
      return NextResponse.redirect(new URL('/dashboard/results', request.url), { status: 302 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
