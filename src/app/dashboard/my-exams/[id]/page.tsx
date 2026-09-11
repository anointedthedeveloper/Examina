'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Question {
  id: string
  text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
}

interface ExamData {
  id: string
  title: string
  duration_minutes: number
  questions: Question[]
}

type Option = 'A' | 'B' | 'C' | 'D'
const OPTIONS: Option[] = ['A', 'B', 'C', 'D']
const OPTION_KEYS: Record<Option, keyof Question> = {
  A: 'option_a',
  B: 'option_b',
  C: 'option_c',
  D: 'option_d',
}

export default function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [exam, setExam] = useState<ExamData | null>(null)
  const [answers, setAnswers] = useState<Record<string, Option>>({})
  const [currentIdx, setCurrentIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<{ score: number; total: number; percentage: number } | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadExam() {
      const supabase = createClient()

      // Get exam
      const { data: examData } = await supabase
        .from('exams')
        .select('id, title, duration_minutes')
        .eq('id', id)
        .single()

      if (!examData) { setError('Exam not found.'); setLoading(false); return }

      // Get questions linked to this exam
      const { data: examQs } = await supabase
        .from('exam_questions')
        .select('question_id')
        .eq('exam_id', id)

      if (!examQs || examQs.length === 0) {
        setError('This exam has no questions.')
        setLoading(false)
        return
      }

      const qIds = examQs.map((eq) => eq.question_id)

      const { data: questions } = await supabase
        .from('questions')
        .select('id, text, option_a, option_b, option_c, option_d')
        .in('id', qIds)

      setExam({
        ...examData,
        questions: (questions ?? []) as Question[],
      })
      setTimeLeft(examData.duration_minutes * 60)
      setLoading(false)
    }
    loadExam()
  }, [id])

  const handleSubmit = useCallback(async () => {
    if (!exam || submitting) return
    setSubmitting(true)
    try {
      const answerArray = exam.questions.map((q) => ({
        question_id: q.id,
        selected_option: answers[q.id] ?? null,
      }))

      const res = await fetch('/api/exams/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exam_id: exam.id, answers: answerArray }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        setError(json.error ?? 'Failed to submit exam.')
        setSubmitting(false)
        return
      }

      const json = await res.json()
      setResult(json)
      setSubmitted(true)
    } catch {
      setError('Network error. Please try again.')
      setSubmitting(false)
    }
  }, [exam, answers, submitting])

  // Countdown timer
  useEffect(() => {
    if (!exam || submitted) return
    if (timeLeft <= 0) {
      handleSubmit()
      return
    }
    const tick = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(tick)
  }, [exam, timeLeft, submitted, handleSubmit])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#681DF4] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading exam…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 max-w-md w-full text-center">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard/my-exams')}
            className="bg-[#681DF4] text-white rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-[#5a12d4] transition-colors"
          >
            Back to Exams
          </button>
        </div>
      </div>
    )
  }

  if (submitted && result) {
    const pct = result.percentage
    const grade = pct >= 70 ? 'A' : pct >= 60 ? 'B' : pct >= 50 ? 'C' : pct >= 40 ? 'D' : 'F'
    const gradeColor = pct >= 70
      ? 'text-green-600' : pct >= 50 ? 'text-yellow-600' : 'text-red-600'

    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-md w-full text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6"
            style={{ background: '#681DF4' }}
          >
            {grade}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Exam Submitted!</h1>
          <p className="text-gray-500 mb-6">{exam?.title}</p>
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <p className="text-4xl font-bold mb-1" style={{ color: '#681DF4' }}>
              {result.score}/{result.total}
            </p>
            <p className={`text-2xl font-bold ${gradeColor}`}>
              {pct.toFixed(1)}%
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/dashboard/my-results')}
              className="bg-[#681DF4] text-white rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-[#5a12d4] transition-colors"
            >
              View All Results
            </button>
            <button
              onClick={() => router.push('/dashboard/my-exams')}
              className="border border-[#681DF4] text-[#681DF4] rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-[#f5f0ff] transition-colors"
            >
              Back to Exams
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!exam) return null

  const questions = exam.questions
  const q = questions[currentIdx]
  const totalQ = questions.length
  const mins = Math.floor(timeLeft / 60)
  const secs = timeLeft % 60
  const timerWarning = timeLeft < 300

  const answeredCount = Object.keys(answers).length
  const progress = (answeredCount / totalQ) * 100

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div
          className="rounded-2xl p-4 mb-6 flex items-center justify-between text-white"
          style={{ background: '#681DF4' }}
        >
          <div>
            <h1 className="text-base font-bold leading-tight">{exam.title}</h1>
            <p className="text-xs text-purple-200 mt-0.5">
              Question {currentIdx + 1} of {totalQ}
            </p>
          </div>
          <div className={`flex items-center gap-2 rounded-full px-4 py-2 ${timerWarning ? 'bg-red-500' : 'bg-white/20'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-bold tabular-nums">
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 font-medium">Progress</span>
            <span className="text-xs font-bold" style={{ color: '#681DF4' }}>
              {answeredCount}/{totalQ} answered
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, background: '#681DF4' }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
          <div className="flex items-start gap-3 mb-6">
            <span
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background: '#681DF4' }}
            >
              {currentIdx + 1}
            </span>
            <p className="text-base text-gray-800 font-medium leading-relaxed pt-0.5">{q.text}</p>
          </div>

          <div className="space-y-3">
            {OPTIONS.map((opt) => {
              const text = q[OPTION_KEYS[opt]] as string
              const isSelected = answers[q.id] === opt
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                  className={`w-full flex items-center gap-3 rounded-xl p-4 text-left transition-all ${
                    isSelected
                      ? 'bg-[#f5f0ff] border-[1.5px] border-[#681DF4]'
                      : 'bg-gray-50 border border-gray-200 hover:border-[#681DF4] hover:bg-[#f5f0ff]/50'
                  }`}
                >
                  <span
                    className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isSelected ? 'bg-[#681DF4] text-white' : 'bg-white text-gray-500 border border-gray-200'
                    }`}
                  >
                    {opt}
                  </span>
                  <span className={`text-sm ${isSelected ? 'text-[#681DF4] font-semibold' : 'text-gray-700'}`}>
                    {text}
                  </span>
                  {isSelected && (
                    <svg className="ml-auto w-5 h-5 text-[#681DF4]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx((i) => i - 1)}
            className="border border-gray-200 text-gray-700 rounded-xl px-5 py-2.5 text-sm font-medium hover:border-[#681DF4] hover:text-[#681DF4] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Previous
          </button>

          {/* Question dots */}
          <div className="flex flex-wrap gap-1.5 justify-center">
            {questions.map((q2, i) => (
              <button
                key={q2.id}
                type="button"
                onClick={() => setCurrentIdx(i)}
                aria-label={`Go to question ${i + 1}`}
                className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
                  i === currentIdx
                    ? 'text-white scale-110'
                    : answers[q2.id]
                    ? 'bg-[#f5f0ff] text-[#681DF4] border border-[#681DF4]'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                style={i === currentIdx ? { background: '#681DF4' } : {}}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {currentIdx < totalQ - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIdx((i) => i + 1)}
              className="bg-[#681DF4] text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-[#5a12d4] transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="bg-green-600 text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-green-700 disabled:opacity-60 transition-colors"
            >
              {submitting ? 'Submitting…' : 'Submit Exam'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
