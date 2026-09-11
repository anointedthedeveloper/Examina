import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface AnswerInput {
  question_id: string
  selected_option: string | null
}

interface SubmitPayload {
  exam_id: string
  answers: AnswerInput[]
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body: SubmitPayload = await request.json()
    const { exam_id, answers } = body

    if (!exam_id || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Prevent duplicate submissions
    const { data: existing } = await supabase
      .from('exam_attempts')
      .select('id')
      .eq('exam_id', exam_id)
      .eq('student_id', user.id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'You have already submitted this exam.' }, { status: 409 })
    }

    // Get questions with correct answers
    const questionIds = answers.map((a) => a.question_id)
    const { data: questions } = await supabase
      .from('questions')
      .select('id, correct_option')
      .in('id', questionIds)

    if (!questions) {
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
    }

    const correctMap: Record<string, string> = {}
    questions.forEach((q) => { correctMap[q.id] = q.correct_option })

    let score = 0
    const total = questions.length

    const answerRows = answers.map((a) => {
      const isCorrect = a.selected_option != null &&
        correctMap[a.question_id] === a.selected_option
      if (isCorrect) score++
      return {
        attempt_id: null as string | null, // filled after insert
        question_id: a.question_id,
        selected_option: a.selected_option,
        is_correct: isCorrect,
      }
    })

    const percentage = total > 0 ? (score / total) * 100 : 0

    // Insert exam attempt
    const { data: attempt, error: attemptErr } = await supabase
      .from('exam_attempts')
      .insert({
        exam_id,
        student_id: user.id,
        score,
        total,
        percentage,
      })
      .select()
      .single()

    if (attemptErr || !attempt) {
      return NextResponse.json({ error: attemptErr?.message ?? 'Failed to save attempt' }, { status: 500 })
    }

    // Insert individual answers
    const answersToInsert = answerRows.map((r) => ({
      ...r,
      attempt_id: attempt.id,
    }))

    await supabase.from('exam_answers').insert(answersToInsert)

    return NextResponse.json({
      score,
      total,
      percentage,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
