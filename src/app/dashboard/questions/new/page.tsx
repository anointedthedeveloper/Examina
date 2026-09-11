'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Subject } from '@/lib/types'

type CorrectOption = 'A' | 'B' | 'C' | 'D'

export default function NewQuestionPage() {
  const router = useRouter()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [subjectId, setSubjectId] = useState('')
  const [text, setText] = useState('')
  const [optionA, setOptionA] = useState('')
  const [optionB, setOptionB] = useState('')
  const [optionC, setOptionC] = useState('')
  const [optionD, setOptionD] = useState('')
  const [correct, setCorrect] = useState<CorrectOption>('A')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('subjects').select('*').order('name').then(({ data }) => {
      if (data) setSubjects(data as Subject[])
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!subjectId) { setError('Please select a subject.'); return }
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Not authenticated'); setLoading(false); return }

      const { error: err } = await supabase.from('questions').insert({
        subject_id: subjectId,
        text: text.trim(),
        option_a: optionA.trim(),
        option_b: optionB.trim(),
        option_c: optionC.trim(),
        option_d: optionD.trim(),
        correct_option: correct,
        created_by: user.id,
      })
      if (err) { setError(err.message); setLoading(false); return }
      router.push('/dashboard/questions')
      router.refresh()
    } catch {
      setError('An unexpected error occurred.')
      setLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">New Question</h1>
        <p className="text-sm text-gray-500 mt-1">Add a question to the question bank</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {error && (
          <div className="mb-5 rounded-xl px-4 py-3 text-sm text-red-700 border border-red-200 bg-red-50" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Subject */}
          <div>
            <label htmlFor="subjectSelect" className="block text-sm font-medium text-gray-700 mb-1.5">
              Subject <span className="text-red-500">*</span>
            </label>
            <select
              id="subjectSelect"
              required
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#681DF4] transition-colors bg-white"
            >
              <option value="">Select a subject…</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Question text */}
          <div>
            <label htmlFor="questionText" className="block text-sm font-medium text-gray-700 mb-1.5">
              Question <span className="text-red-500">*</span>
            </label>
            <textarea
              id="questionText"
              required
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type the question here…"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#681DF4] transition-colors resize-none"
            />
          </div>

          {/* Options */}
          {(['A', 'B', 'C', 'D'] as const).map((opt) => {
            const val = opt === 'A' ? optionA : opt === 'B' ? optionB : opt === 'C' ? optionC : optionD
            const setter = opt === 'A' ? setOptionA : opt === 'B' ? setOptionB : opt === 'C' ? setOptionC : setOptionD
            return (
              <div key={opt}>
                <label htmlFor={`option${opt}`} className="block text-sm font-medium text-gray-700 mb-1.5">
                  Option {opt} <span className="text-red-500">*</span>
                </label>
                <input
                  id={`option${opt}`}
                  type="text"
                  required
                  value={val}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={`Option ${opt}`}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#681DF4] transition-colors"
                />
              </div>
            )
          })}

          {/* Correct answer */}
          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">Correct Answer <span className="text-red-500">*</span></p>
            <div className="flex gap-4">
              {(['A', 'B', 'C', 'D'] as const).map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="correct"
                    value={opt}
                    checked={correct === opt}
                    onChange={() => setCorrect(opt)}
                    className="accent-[#681DF4]"
                  />
                  <span className={`text-sm font-medium ${correct === opt ? 'text-[#681DF4]' : 'text-gray-600'}`}>
                    {opt}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#681DF4] text-white rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-[#5a12d4] disabled:opacity-60 transition-colors"
            >
              {loading ? 'Saving…' : 'Save Question'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="border border-[#681DF4] text-[#681DF4] rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-[#f5f0ff] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
