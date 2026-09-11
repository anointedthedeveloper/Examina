'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Class, Subject, Question } from '@/lib/types'

export default function NewExamPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [subjectId, setSubjectId] = useState('')
  const [classId, setClassId] = useState('')
  const [duration, setDuration] = useState('30')
  const [classes, setClasses] = useState<Class[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [selectedQs, setSelectedQs] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('classes').select('*').order('name'),
      supabase.from('subjects').select('*').order('name'),
    ]).then(([{ data: cls }, { data: sub }]) => {
      if (cls) setClasses(cls as Class[])
      if (sub) setSubjects(sub as Subject[])
    })
  }, [])

  // Filter subjects by class
  useEffect(() => {
    if (classId) {
      setFilteredSubjects(subjects.filter((s) => s.class_id === classId))
    } else {
      setFilteredSubjects([])
    }
    setSubjectId('')
    setQuestions([])
    setSelectedQs(new Set())
  }, [classId, subjects])

  // Load questions when subject changes
  useEffect(() => {
    if (!subjectId) { setQuestions([]); return }
    const supabase = createClient()
    supabase.from('questions').select('*').eq('subject_id', subjectId).order('created_at').then(({ data }) => {
      if (data) setQuestions(data as Question[])
    })
  }, [subjectId])

  function toggleQuestion(id: string) {
    setSelectedQs((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!classId) { setError('Please select a class.'); return }
    if (!subjectId) { setError('Please select a subject.'); return }
    if (selectedQs.size === 0) { setError('Please select at least one question.'); return }
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Not authenticated'); setLoading(false); return }

      const { data: exam, error: examErr } = await supabase.from('exams').insert({
        title: title.trim(),
        subject_id: subjectId,
        class_id: classId,
        duration_minutes: parseInt(duration, 10),
        created_by: user.id,
      }).select().single()

      if (examErr || !exam) { setError(examErr?.message ?? 'Failed to create exam'); setLoading(false); return }

      // Link questions to exam
      const links = Array.from(selectedQs).map((qid) => ({ exam_id: exam.id, question_id: qid }))
      const { error: linkErr } = await supabase.from('exam_questions').insert(links)
      if (linkErr) { setError(linkErr.message); setLoading(false); return }

      router.push('/dashboard/exams')
      router.refresh()
    } catch {
      setError('An unexpected error occurred.')
      setLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">New Exam</h1>
        <p className="text-sm text-gray-500 mt-1">Configure and create a new exam</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {error && (
          <div className="mb-5 rounded-xl px-4 py-3 text-sm text-red-700 border border-red-200 bg-red-50" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="examTitle" className="block text-sm font-medium text-gray-700 mb-1.5">
              Exam Title <span className="text-red-500">*</span>
            </label>
            <input
              id="examTitle"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mid-Term Mathematics Exam"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#681DF4] transition-colors"
            />
          </div>

          {/* Class */}
          <div>
            <label htmlFor="classSelect" className="block text-sm font-medium text-gray-700 mb-1.5">
              Class <span className="text-red-500">*</span>
            </label>
            <select
              id="classSelect"
              required
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#681DF4] transition-colors bg-white"
            >
              <option value="">Select a class…</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

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
              disabled={!classId}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#681DF4] transition-colors bg-white disabled:opacity-50"
            >
              <option value="">Select a subject…</option>
              {filteredSubjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1.5">
              Duration (minutes) <span className="text-red-500">*</span>
            </label>
            <input
              id="duration"
              type="number"
              required
              min={5}
              max={300}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#681DF4] transition-colors"
            />
          </div>

          {/* Question picker */}
          {questions.length > 0 && (
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-2">
                Select Questions ({selectedQs.size} selected)
              </p>
              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
                {questions.map((q) => (
                  <label key={q.id} className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedQs.has(q.id)}
                      onChange={() => toggleQuestion(q.id)}
                      className="mt-0.5 accent-[#681DF4]"
                    />
                    <span className="text-sm text-gray-700 leading-snug">{q.text}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#681DF4] text-white rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-[#5a12d4] disabled:opacity-60 transition-colors"
            >
              {loading ? 'Creating…' : 'Create Exam'}
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
