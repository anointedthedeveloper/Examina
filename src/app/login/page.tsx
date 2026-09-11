'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
      style={{ background: 'linear-gradient(135deg, #3d0a9e 0%, #5a12d4 40%, #681DF4 70%, #7c2ff7 100%)' }}
    >
      {/* Background dot grids */}
      <DotGrid className="absolute top-8 left-8 opacity-20 hidden sm:block" />
      <DotGrid className="absolute bottom-8 right-10 opacity-20 hidden sm:block" />

      {/* Decorative shapes — hidden on very small screens */}
      <div
        className="absolute bottom-14 left-16 w-11 h-11 rounded-md rotate-12 hidden sm:block"
        style={{ border: '2px solid rgba(255,255,255,0.3)' }}
      />
      <div
        className="absolute bottom-9 left-32 hidden sm:block"
        style={{
          width: 0, height: 0,
          borderLeft: '9px solid transparent',
          borderRight: '9px solid transparent',
          borderBottom: '16px solid #00e5ff',
          opacity: 0.8,
        }}
      />
      <div
        className="absolute top-12 right-4 w-16 h-6 rounded-sm opacity-70 rotate-2 hidden sm:block"
        style={{ background: '#00e5ff' }}
      />

      {/* Card — stacks vertically on mobile, side-by-side on md+ */}
      <div
        className="relative w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
        style={{ background: '#f0f0f5' }}
      >
        {/* ── Left / Top: Form ── */}
        <div className="flex flex-col justify-between flex-1 px-8 py-8 sm:px-10 sm:py-10">

          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-6">
            <Image
              src="/examina.png"
              alt="Examina logo"
              width={36}
              height={36}
              className="rounded-xl"
            />
            <span className="text-2xl font-extrabold tracking-tight" style={{ color: '#681DF4' }}>
              Examina
            </span>
          </div>

          {/* Heading */}
          <p className="text-gray-700 font-semibold text-sm mb-5">Login to your account</p>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg px-4 py-3 text-sm text-red-700 border border-red-200"
              style={{ background: '#fef2f2' }}
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Your Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none transition"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #681DF4')}
              onBlur={(e) => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)')}
            />

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl bg-white px-4 py-3 pr-12 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none transition"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #681DF4')}
                onBlur={(e) => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)')}
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: showPassword ? '#681DF4' : '#9ca3af' }}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Forgot password?
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-full px-8 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-60 shadow-md"
                style={{ background: '#681DF4' }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Logging in
                  </span>
                ) : 'Login'}
              </button>
            </div>
          </form>

          <p className="text-xs text-gray-400 mt-8">
            &copy; {new Date().getFullYear()} Anobyte Technologies
          </p>
        </div>

        {/* ── Right / Bottom: Illustration — hidden on mobile ── */}
        <div
          className="hidden md:flex flex-1 items-center justify-center px-6 py-8 relative"
          style={{ background: '#f0f0f5' }}
        >
          <SmallDotGrid className="absolute top-5 right-5 opacity-25" />
          <ExamAnimation />
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

/* ─── Decorative SVGs ─────────────────────────────────────────── */

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

function SmallDotGrid({ className }: { className?: string }) {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className={className} aria-hidden="true">
      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 4 }).map((_, col) => (
          <circle key={`${row}-${col}`} cx={col * 16 + 8} cy={row * 16 + 8} r="2.5" fill="#681DF4" />
        ))
      )}
    </svg>
  )
}

/* ─── Exam Animation ──────────────────────────────────────────── */

function ExamAnimation() {
  // Total loop = 5s. Each item fades in at its delay, holds, then everything
  // resets at ~4.5s and the cycle repeats.
  const LOOP = 5 // seconds

  const lines = [
    { w: '85%', delay: 0.2 },
    { w: '70%', delay: 0.6 },
    { w: '90%', delay: 1.0 },
    { w: '60%', delay: 1.4 },
    { w: '78%', delay: 1.8 },
  ]

  const bubbleDelay = [2.2, 2.4, 2.6, 2.8]
  const tickDelay = 3.1

  // Keyframe: item fades in at `delay`, stays visible, fades out near end
  // We express everything as % of LOOP duration
  function lineKf(delay: number) {
    const inPct  = (delay / LOOP) * 100
    const outPct = ((LOOP - 0.4) / LOOP) * 100
    return `
      0%        { opacity:0; transform:translateY(6px); }
      ${inPct.toFixed(1)}%  { opacity:0; transform:translateY(6px); }
      ${(inPct + 8).toFixed(1)}% { opacity:1; transform:translateY(0); }
      ${outPct.toFixed(1)}% { opacity:1; transform:translateY(0); }
      100%      { opacity:0; transform:translateY(0); }
    `
  }

  function bubbleKf(delay: number) {
    const inPct  = (delay / LOOP) * 100
    const outPct = ((LOOP - 0.4) / LOOP) * 100
    return `
      0%        { opacity:0; transform:scale(0.4); }
      ${inPct.toFixed(1)}%  { opacity:0; transform:scale(0.4); }
      ${(inPct + 6).toFixed(1)}% { opacity:1; transform:scale(1); }
      ${outPct.toFixed(1)}% { opacity:1; transform:scale(1); }
      100%      { opacity:0; transform:scale(1); }
    `
  }

  return (
    <div className="relative flex items-center justify-center w-64 h-72 select-none" aria-hidden="true">

      {/* Floating dots top-left */}
      <div className="absolute top-3 left-3" style={{ animation: 'examFloat 3s ease-in-out infinite' }}>
        <svg width="38" height="38" viewBox="0 0 38 38">
          {[0,1,2].map(r => [0,1,2].map(c => (
            <circle key={`${r}${c}`} cx={c*13+6} cy={r*13+6} r="2" fill="#681DF4" opacity="0.2" />
          )))}
        </svg>
      </div>

      {/* Paper */}
      <div
        className="absolute rounded-2xl overflow-hidden"
        style={{
          width: 178,
          height: 218,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -54%)',
          background: 'white',
          boxShadow: '0 8px 32px rgba(104,29,244,0.12)',
        }}
      >
        {/* Header */}
        <div style={{ height: 32, background: '#681DF4', display: 'flex', alignItems: 'center', paddingLeft: 14 }}>
          <span style={{ color: 'white', fontSize: 8, fontWeight: 700, letterSpacing: 1.5 }}>EXAM PAPER</span>
        </div>

        {/* Lines */}
        <div style={{ padding: '14px 16px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {lines.map((line, i) => (
            <div
              key={i}
              style={{
                height: 7,
                borderRadius: 4,
                background: i % 2 === 0 ? '#ede9fe' : '#c4b5fd',
                width: line.w,
                opacity: 0,
                animation: `examLine${i} ${LOOP}s ease-in-out infinite`,
              }}
            />
          ))}

          {/* MCQ bubbles */}
          <div style={{ display: 'flex', gap: 8, paddingTop: 2 }}>
            {['A', 'B', 'C', 'D'].map((opt, j) => (
              <div
                key={opt}
                style={{
                  width: 26, height: 26, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 700,
                  background: j === 2 ? '#681DF4' : '#ede9fe',
                  color: j === 2 ? 'white' : '#a78bfa',
                  opacity: 0,
                  animation: `examBubble${j} ${LOOP}s ease-in-out infinite`,
                }}
              >
                {opt}
              </div>
            ))}
          </div>

          {/* Tick row */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              opacity: 0,
              animation: `examTick ${LOOP}s ease-in-out infinite`,
            }}
          >
            <div style={{
              width: 18, height: 18, borderRadius: '50%', background: '#681DF4',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path d="M2 5.5 l2 2 l4-4" stroke="white" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div style={{ height: 6, width: 60, borderRadius: 3, background: '#c4b5fd' }} />
          </div>
        </div>
      </div>

      {/* Pencil — bobs and rotates */}
      <div
        className="absolute"
        style={{
          bottom: 22,
          right: 18,
          animation: 'examPencil 2s ease-in-out infinite',
          transformOrigin: 'bottom center',
        }}
      >
        <svg width="32" height="90" viewBox="0 0 32 90">
          <rect x="7" y="0" width="18" height="62" rx="3" fill="#fbbf24" />
          <rect x="7" y="0" width="18" height="10" rx="3" fill="#f87171" />
          <rect x="7" y="10" width="18" height="5" fill="#d1d5db" />
          <polygon points="7,62 25,62 16,78" fill="#fde68a" />
          <polygon points="11,70 21,70 16,78" fill="#1c1917" />
          <rect x="11" y="16" width="3" height="42" rx="1.5" fill="white" opacity="0.22" />
        </svg>
      </div>

      {/* Keyframes injected via style tag */}
      <style>{`
        ${lines.map((l, i) => `@keyframes examLine${i} { ${lineKf(l.delay)} }`).join('\n')}
        ${bubbleDelay.map((d, j) => `@keyframes examBubble${j} { ${bubbleKf(d)} }`).join('\n')}
        @keyframes examTick {
          ${lineKf(tickDelay)}
        }
        @keyframes examPencil {
          0%, 100% { transform: translateY(0) rotate(-14deg); }
          50%       { transform: translateY(-10px) rotate(-9deg); }
        }
        @keyframes examFloat {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  )
}
