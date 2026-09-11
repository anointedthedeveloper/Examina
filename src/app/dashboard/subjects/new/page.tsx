'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Class } from '@/lib/types'

export default function NewSubjectPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [classId, setClassId] = useState('')
  const [classes, setClasses] = useState<Class[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('classes').select('*').order('name').then(({ data }) => {
      if (data) setClasses(data as Class[])
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!classId) { setError('Please select a class.'); return }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.from('subjects').insert({
        name: name.trim(),
        class_id: classId,
      })
      if (err) { setError(err.message); setLoading(false); return }
      router.push('/dashboard/subjects')
      router.refresh()
    } catch {
      setError('An unexpected error occurred.')
      setLoading(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">New Subject</h1>
        <p className="text-sm text-gray-500 mt-1">Add a subject to a class</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {error && (
          <div className="mb-5 rounded-xl px-4 py-3 text-sm text-red-700 border border-red-200 bg-red-50" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="subjectName" className="block text-sm font-medium text-gray-700 mb-1.5">
              Subject Name <span className="text-red-500">*</span>
            </label>
            <input
              id="subjectName"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mathematics, English Language"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#681DF4] transition-colors"
            />
          </div>

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
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#681DF4] text-white rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-[#5a12d4] disabled:opacity-60 transition-colors"
            >
              {loading ? 'Creating…' : 'Create Subject'}
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
