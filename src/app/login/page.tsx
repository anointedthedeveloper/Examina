'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showForgot, setShowForgot]     = useState(false)
  const [error, setError]               = useState('')
  const [loading, setLoading]           = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      window.location.href = '/dashboard'
    } catch {
      setError('Authentication service not configured yet.')
      setLoading(false)
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(140deg, #2d0780 0%, #4c0fcc 45%, #681DF4 75%, #7928f5 100%)' }}
    >
      {/* Background dot grids */}
      <DotGrid className="absolute top-8 left-8 opacity-[0.18] hidden sm:block" />
      <DotGrid className="absolute bottom-8 right-10 opacity-[0.18] hidden sm:block" />

      {/* Decorative accents */}
      <div className="absolute bottom-14 left-16 w-12 h-12 rounded-lg rotate-12 hidden sm:block"
        style={{ border: '2px solid rgba(255,255,255,0.25)' }} />
      <div className="absolute bottom-8 left-32 hidden sm:block"
        style={{ width:0, height:0, borderLeft:'10px solid transparent', borderRight:'10px solid transparent', borderBottom:'18px solid #22d3ee', opacity:0.75 }} />
      <div className="absolute top-10 right-6 w-20 h-7 rounded opacity-65 -rotate-1 hidden sm:block"
        style={{ background: '#22d3ee' }} />
      <div className="absolute top-28 right-10 w-3 h-3 rounded-full hidden sm:block"
        style={{ background: 'rgba(255,255,255,0.35)' }} />
      <div className="absolute bottom-24 left-8 w-2 h-2 rounded-full hidden sm:block"
        style={{ background: 'rgba(255,255,255,0.3)' }} />

      {/* Card */}
      <div
        className="relative w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
        style={{ background: '#f2f1f8', minHeight: 500 }}
      >

        {/* ── Left: Form ── */}
        <div className="flex flex-col flex-1 px-10 py-10 sm:px-12 sm:py-12">

          {/* Logo — bigger */}
          <div className="flex items-center gap-3 mb-8">
            <Image
              src="/examina.png"
              alt="Examina logo"
              width={52}
              height={52}
              className="rounded-2xl"
              style={{ boxShadow: '0 4px 14px rgba(104,29,244,0.25)' }}
            />
            <div>
              <p className="text-3xl font-extrabold tracking-tight leading-none" style={{ color: '#681DF4' }}>
                Examina
              </p>
              <p className="text-xs text-gray-400 mt-0.5 tracking-wide">CBT Exam Portal</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-xl font-bold text-gray-800 leading-snug">Welcome back</h1>
            <p className="text-sm text-gray-500 mt-1">Sign in to access your exam portal</p>
          </div>

          {/* Error */}
          {error && (
            <div role="alert" className="mb-5 rounded-xl px-4 py-3 text-sm text-red-700 border border-red-200 bg-red-50">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4 flex-1">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@school.edu"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl bg-white px-4 py-3.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none transition"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2.5px #681DF4')}
                onBlur={(e)  => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)')}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl bg-white px-4 py-3.5 pr-12 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none transition"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2.5px #681DF4')}
                  onBlur={(e)  => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)')}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: showPassword ? '#681DF4' : '#9ca3af' }}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowForgot(v => !v)}
                className="text-xs font-medium transition-colors"
                style={{ color: '#681DF4' }}
              >
                Forgot password?
              </button>

              {showForgot && (
                <div
                  className="mt-2 rounded-xl px-4 py-3.5 text-xs text-gray-600 leading-relaxed border border-purple-100"
                  style={{ background: '#f5f0ff' }}
                >
                  <p className="font-semibold text-gray-700 mb-1">Can&apos;t access your account?</p>
                  <p>
                    Please contact your <span className="font-semibold" style={{ color: '#681DF4' }}>school administrator</span> to
                    reset your password or recover your account. Your admin can update your credentials from the admin dashboard.
                  </p>
                </div>
              )}
            </div>

            {/* Login button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl py-3.5 text-sm font-bold text-white transition-opacity disabled:opacity-60 shadow-lg"
                style={{ background: 'linear-gradient(135deg, #5a12d4, #681DF4)', letterSpacing: '0.03em' }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Signing in…
                  </span>
                ) : 'Sign In to Portal'}
              </button>
            </div>
          </form>

          {/* Footer */}
          <p className="text-xs text-gray-400 mt-8">
            &copy; {new Date().getFullYear()} Anobyte Technologies
          </p>
        </div>

        {/* ── Right: CBT Animation panel ── */}
        <div
          className="hidden md:flex flex-col items-center justify-center gap-5 px-8 py-10 relative"
          style={{ background: 'linear-gradient(160deg, #681DF4 0%, #4c0fcc 100%)', minWidth: 320 }}
        >
          {/* Panel dot grid */}
          <div className="absolute top-6 right-6 opacity-20">
            <SmallDotGrid />
          </div>
          <div className="absolute bottom-6 left-6 opacity-15">
            <SmallDotGrid />
          </div>

          {/* Label */}
          <div className="text-center z-10">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4"
              style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)' }}>
              <span className="text-white text-xs font-bold tracking-widest uppercase">CBT Exam Portal</span>
            </div>
            <p className="text-white text-lg font-bold leading-snug">
              Computer-Based<br />Testing Made Simple
            </p>
            <p className="text-purple-200 text-xs mt-2 leading-relaxed max-w-[220px] mx-auto">
              Take exams, get instant results, and track your progress — all in one place.
            </p>
          </div>

          {/* Animation */}
          <CbtAnimation />

          {/* Stats strip */}
          <div className="flex gap-6 z-10">
            {[
              { val: '100%', label: 'Online' },
              { val: 'Auto', label: 'Graded' },
              { val: 'Live', label: 'Results' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-white font-extrabold text-lg leading-none">{s.val}</p>
                <p className="text-purple-200 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}

/* ─── Icons ───────────────────────────────────────────────────── */

function EyeIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )
}

/* ─── Dot grids ───────────────────────────────────────────────── */

function DotGrid({ className }: { className?: string }) {
  return (
    <svg width="88" height="88" viewBox="0 0 88 88" className={className} aria-hidden="true">
      {Array.from({ length: 6 }).map((_, row) =>
        Array.from({ length: 6 }).map((_, col) => (
          <circle key={`${row}-${col}`} cx={col * 16 + 8} cy={row * 16 + 8} r="2.5" fill="white" />
        ))
      )}
    </svg>
  )
}

function SmallDotGrid() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 4 }).map((_, col) => (
          <circle key={`${row}-${col}`} cx={col * 16 + 8} cy={row * 16 + 8} r="2" fill="white" />
        ))
      )}
    </svg>
  )
}

/* ─── CBT Animation ───────────────────────────────────────────── */

function CbtAnimation() {
  const LOOP = 6

  const questions = [
    { q: 'What is the capital of Nigeria?', opts: ['Lagos', 'Abuja', 'Kano', 'Ibadan'], answer: 1 },
    { q: 'Solve: 2x + 4 = 12', opts: ['x = 2', 'x = 4', 'x = 6', 'x = 8'], answer: 1 },
    { q: 'H₂O is the formula for?', opts: ['Oxygen', 'Hydrogen', 'Water', 'Salt'], answer: 2 },
  ]

  function kf(delay: number, dur = 0.5) {
    const totalFrames = LOOP
    const inPct  = ((delay) / totalFrames * 100).toFixed(1)
    const inEnd  = ((delay + dur) / totalFrames * 100).toFixed(1)
    const outPct = (((totalFrames - 0.5) / totalFrames) * 100).toFixed(1)
    return `0%{opacity:0;transform:translateY(8px)}${inPct}%{opacity:0;transform:translateY(8px)}${inEnd}%{opacity:1;transform:translateY(0)}${outPct}%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(0)}`
  }

  function bubbleKf(delay: number) {
    const totalFrames = LOOP
    const inPct  = ((delay) / totalFrames * 100).toFixed(1)
    const inEnd  = ((delay + 0.35) / totalFrames * 100).toFixed(1)
    const outPct = (((totalFrames - 0.5) / totalFrames) * 100).toFixed(1)
    return `0%{opacity:0;transform:scale(0.5)}${inPct}%{opacity:0;transform:scale(0.5)}${inEnd}%{opacity:1;transform:scale(1)}${outPct}%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1)}`
  }

  // Stagger: question at 0.3, options at 0.9, 1.2, 1.5, 1.8, submit at 2.4, progress at 0
  const qDelay   = 0.3
  const optStart = 0.9
  const submitD  = 2.4
  const progD    = 0.1

  return (
    <div className="relative z-10 select-none" aria-hidden="true" style={{ width: 240 }}>

      {/* Monitor frame */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.12)', border: '1.5px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>

        {/* Browser chrome bar */}
        <div className="flex items-center gap-1.5 px-3 py-2" style={{ background: 'rgba(0,0,0,0.2)' }}>
          <div className="w-2 h-2 rounded-full bg-red-400 opacity-80" />
          <div className="w-2 h-2 rounded-full bg-yellow-300 opacity-80" />
          <div className="w-2 h-2 rounded-full bg-green-400 opacity-80" />
          <div className="flex-1 mx-2 h-4 rounded-full text-center"
            style={{ background: 'rgba(255,255,255,0.12)', fontSize: 7, color: 'rgba(255,255,255,0.6)', lineHeight: '16px', letterSpacing: 0.5 }}>
            examina.school/exam
          </div>
        </div>

        {/* Exam UI */}
        <div className="px-4 py-3" style={{ minHeight: 180 }}>

          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: '40%',
                  background: '#22d3ee',
                  opacity: 0,
                  animation: `cbtProg ${LOOP}s ease-in-out infinite`,
                }}
              />
            </div>
            <span
              style={{
                fontSize: 8, color: 'rgba(255,255,255,0.7)', fontWeight: 700,
                opacity: 0,
                animation: `cbtProg ${LOOP}s ease-in-out infinite`,
              }}
            >
              Q 2 / 5
            </span>
          </div>

          {/* Timer chip */}
          <div
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 mb-3"
            style={{
              background: 'rgba(34,211,238,0.2)',
              border: '1px solid rgba(34,211,238,0.4)',
              opacity: 0,
              animation: `cbtProg ${LOOP}s ease-in-out infinite`,
            }}
          >
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
            <span style={{ fontSize: 8, color: '#22d3ee', fontWeight: 700 }}>28:14</span>
          </div>

          {/* Question */}
          <div
            style={{
              fontSize: 10, color: 'white', fontWeight: 600, lineHeight: 1.5, marginBottom: 10,
              opacity: 0,
              animation: `cbtQ ${LOOP}s ease-in-out infinite`,
            }}
          >
            {questions[0].q}
          </div>

          {/* Options */}
          {questions[0].opts.map((opt, j) => (
            <div
              key={opt}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                borderRadius: 8,
                padding: '5px 8px',
                marginBottom: 5,
                background: j === questions[0].answer ? 'rgba(34,211,238,0.2)' : 'rgba(255,255,255,0.08)',
                border: j === questions[0].answer ? '1px solid rgba(34,211,238,0.5)' : '1px solid rgba(255,255,255,0.1)',
                opacity: 0,
                animation: `cbtOpt${j} ${LOOP}s ease-in-out infinite`,
              }}
            >
              <div style={{
                width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                background: j === questions[0].answer ? '#22d3ee' : 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 7, fontWeight: 700,
                color: j === questions[0].answer ? '#1e1b4b' : 'rgba(255,255,255,0.6)',
              }}>
                {['A','B','C','D'][j]}
              </div>
              <span style={{ fontSize: 9, color: j === questions[0].answer ? '#22d3ee' : 'rgba(255,255,255,0.75)', fontWeight: j === questions[0].answer ? 700 : 400 }}>
                {opt}
              </span>
            </div>
          ))}

          {/* Submit button */}
          <div
            style={{
              marginTop: 8, borderRadius: 8, padding: '6px 0',
              background: '#22d3ee', textAlign: 'center',
              fontSize: 9, fontWeight: 800, color: '#1e1b4b', letterSpacing: 0.8,
              opacity: 0,
              animation: `cbtSubmit ${LOOP}s ease-in-out infinite`,
            }}
          >
            NEXT QUESTION →
          </div>
        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes cbtProg   { ${kf(progD, 0.6)} }
        @keyframes cbtQ      { ${kf(qDelay, 0.5)} }
        ${questions[0].opts.map((_, j) => `@keyframes cbtOpt${j} { ${bubbleKf(optStart + j * 0.3)} }`).join('\n')}
        @keyframes cbtSubmit { ${kf(submitD, 0.4)} }
        @keyframes cbtFloat  {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}
