'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

export default function LoginPage() {
  const [username, setUsername]         = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]               = useState('')
  const [loading, setLoading]           = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email: username, password })
      if (error) { setError(error.message); setLoading(false); return }
      window.location.href = '/dashboard'
    } catch {
      setError('Authentication service not configured yet.')
      setLoading(false)
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #3b0ca8 0%, #5612d6 45%, #681DF4 100%)' }}
    >
      {/* Background dot grids */}
      <BgDots className="absolute top-8 left-10 opacity-20" />
      <BgDots className="absolute bottom-10 right-12 opacity-20" />

      {/* Decorative accents — matching reference */}
      <div className="absolute bottom-16 left-20 w-12 h-12 rounded-lg rotate-12 hidden sm:block"
        style={{ border: '2px solid rgba(255,255,255,0.3)' }} />
      <div className="absolute bottom-10 left-36 hidden sm:block"
        style={{ width:0, height:0,
          borderLeft:'10px solid transparent', borderRight:'10px solid transparent',
          borderBottom:'18px solid #22d3ee', opacity:0.9 }} />
      <div className="absolute top-10 right-6 w-20 h-7 rounded opacity-80 -rotate-1 hidden sm:block"
        style={{ background:'#22d3ee' }} />

      {/* ── Card ── */}
      <div
        className="relative w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
        style={{ maxWidth: 860, background: '#f0eff6', border: '1.5px solid rgba(255,255,255,0.25)' }}
      >

        {/* ─── Left: Form ─── */}
        <div className="flex flex-col flex-1 px-10 py-10 sm:px-12 sm:py-12">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <Image
              src="/examina.png"
              alt="Examina"
              width={50}
              height={50}
              className="rounded-2xl"
              style={{ boxShadow: '0 4px 16px rgba(104,29,244,0.3)' }}
            />
            <div>
              <p className="text-[26px] font-extrabold leading-none tracking-tight"
                style={{ color: '#681DF4' }}>
                Examina
              </p>
              <p className="text-[11px] tracking-widest font-semibold mt-0.5"
                style={{ color: '#a78bfa' }}>
                CBT EXAM PORTAL
              </p>
            </div>
          </div>

          {/* Heading */}
          <p className="text-gray-600 font-semibold text-sm mb-6">Login to your account</p>

          {/* Error */}
          {error && (
            <div role="alert"
              className="mb-5 rounded-xl px-4 py-3 text-sm text-red-700 border border-red-200 bg-red-50">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                autoComplete="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="w-full rounded-xl bg-white px-4 py-3.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none transition-all"
                style={{ border: '1.5px solid #d0c8f0' }}
                onFocus={e => (e.currentTarget.style.border = '1.5px solid #681DF4')}
                onBlur={e  => (e.currentTarget.style.border = '1.5px solid #d0c8f0')}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl bg-white px-4 py-3.5 pr-12 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none transition-all"
                  style={{ border: '1.5px solid #d0c8f0' }}
                  onFocus={e => (e.currentTarget.style.border = '1.5px solid #681DF4')}
                  onBlur={e  => (e.currentTarget.style.border = '1.5px solid #d0c8f0')}
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

            {/* Forgot row */}
            <div className="flex items-center justify-between pt-1">
              {/* Hover tooltip */}
              <div className="relative group">
                <span
                  className="text-xs cursor-default transition-colors"
                  style={{ color: '#681DF4' }}
                >
                  Forgot password?
                </span>
                {/* Tooltip — visible on hover */}
                <div
                  className="absolute bottom-full left-0 mb-2 w-64 rounded-xl px-4 py-3 text-xs text-gray-600 leading-relaxed border border-purple-100 pointer-events-none
                    opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0
                    transition-all duration-200 z-10"
                  style={{ background: '#f5f0ff', boxShadow: '0 8px 24px rgba(104,29,244,0.12)' }}
                >
                  <p className="font-bold text-gray-800 mb-1">Can&apos;t access your account?</p>
                  <p>
                    Contact your{' '}
                    <span className="font-semibold" style={{ color: '#681DF4' }}>school administrator</span>
                    {' '}to reset your password or recover access to your account.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex-shrink-0 rounded-full px-8 py-2.5 text-sm font-bold text-white disabled:opacity-60 shadow-lg transition-opacity"
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

          {/* Footer */}
          <p className="text-xs text-gray-400 mt-10">
            &copy; {new Date().getFullYear()} Anobyte Technologies
          </p>
        </div>

        {/* ─── Right: Animation ─── */}
        <div
          className="hidden md:flex flex-1 items-center justify-center relative px-6 py-10"
          style={{ background: '#f0eff6', borderLeft: '1.5px solid rgba(104,29,244,0.1)' }}
        >
          {/* Small dot accent */}
          <div className="absolute top-5 right-5 opacity-25">
            <SmallDots />
          </div>
          <CbtAnimation />
        </div>

      </div>
    </main>
  )
}

/* ─── Icons ─────────────────────────────────────────────────────── */

function EyeIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )
}

/* ─── Decorative ─────────────────────────────────────────────────── */

function BgDots({ className }: { className?: string }) {
  return (
    <svg width="90" height="90" viewBox="0 0 90 90" className={className} aria-hidden="true">
      {Array.from({ length: 6 }).map((_, r) =>
        Array.from({ length: 6 }).map((_, c) => (
          <circle key={`${r}${c}`} cx={c * 16 + 8} cy={r * 16 + 8} r="2.5" fill="white" />
        ))
      )}
    </svg>
  )
}

function SmallDots() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
      {Array.from({ length: 4 }).map((_, r) =>
        Array.from({ length: 4 }).map((_, c) => (
          <circle key={`${r}${c}`} cx={c * 16 + 8} cy={r * 16 + 8} r="2.5" fill="#681DF4" />
        ))
      )}
    </svg>
  )
}

/* ─── CBT Animation ──────────────────────────────────────────────── */

function CbtAnimation() {
  const LOOP = 6 // seconds per cycle

  // Build a keyframe string: element is invisible, fades in at `delay` seconds,
  // holds until near the end, then fades out so the loop looks clean.
  function kf(delaySec: number, riseDur = 0.45) {
    const L = LOOP
    const a = ((delaySec) / L * 100).toFixed(1)
    const b = ((delaySec + riseDur) / L * 100).toFixed(1)
    const c = (((L - 0.55) / L) * 100).toFixed(1)
    return [
      `0%{opacity:0;transform:translateY(7px)}`,
      `${a}%{opacity:0;transform:translateY(7px)}`,
      `${b}%{opacity:1;transform:translateY(0)}`,
      `${c}%{opacity:1;transform:translateY(0)}`,
      `100%{opacity:0;transform:translateY(0)}`,
    ].join('')
  }

  function popKf(delaySec: number) {
    const L = LOOP
    const a = ((delaySec) / L * 100).toFixed(1)
    const b = ((delaySec + 0.35) / L * 100).toFixed(1)
    const c = (((L - 0.55) / L) * 100).toFixed(1)
    return [
      `0%{opacity:0;transform:scale(0.4)}`,
      `${a}%{opacity:0;transform:scale(0.4)}`,
      `${b}%{opacity:1;transform:scale(1)}`,
      `${c}%{opacity:1;transform:scale(1)}`,
      `100%{opacity:0;transform:scale(1)}`,
    ].join('')
  }

  const opts  = ['Lagos', 'Abuja', 'Kano', 'Ibadan']
  const ans   = 1 // Abuja

  return (
    <div className="select-none" aria-hidden="true" style={{ width: 260 }}>

      {/* Floating pencil above the card */}
      <div className="flex justify-end mb-3 pr-4">
        <div style={{ animation: 'cbtPencil 2.2s ease-in-out infinite', transformOrigin: 'bottom center' }}>
          <svg width="28" height="80" viewBox="0 0 28 80">
            <rect x="5" y="0" width="18" height="56" rx="3" fill="#fbbf24" />
            <rect x="5" y="0" width="18" height="9" rx="3" fill="#f87171" />
            <rect x="5" y="9" width="18" height="4" fill="#d1d5db" />
            <polygon points="5,56 23,56 14,70" fill="#fde68a" />
            <polygon points="9,63 19,63 14,70" fill="#1c1917" />
            <rect x="9" y="14" width="3" height="38" rx="1.5" fill="white" opacity="0.22" />
          </svg>
        </div>
      </div>

      {/* Exam card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'white',
          boxShadow: '0 12px 40px rgba(104,29,244,0.15)',
        }}
      >
        {/* Card header */}
        <div style={{ background: '#681DF4', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              background: 'rgba(255,255,255,0.2)', borderRadius: 6,
              padding: '2px 8px', fontSize: 8, color: 'white', fontWeight: 700, letterSpacing: 1.2
            }}>
              CBT
            </div>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 9, fontWeight: 600 }}>
              General Knowledge
            </span>
          </div>
          {/* Timer */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '2px 8px',
            opacity: 0, animation: `cbtA0 ${LOOP}s ease-in-out infinite`,
          }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
            <span style={{ fontSize: 9, color: 'white', fontWeight: 700 }}>29:47</span>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ padding: '8px 16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 8, color: '#9ca3af', fontWeight: 600 }}>Question 2 of 10</span>
            <span style={{ fontSize: 8, color: '#681DF4', fontWeight: 700 }}>20%</span>
          </div>
          <div style={{ height: 5, borderRadius: 9999, background: '#ede9fe' }}>
            <div style={{
              height: '100%', width: '20%', borderRadius: 9999,
              background: 'linear-gradient(90deg, #681DF4, #a78bfa)',
              opacity: 0, animation: `cbtA0 ${LOOP}s ease-in-out infinite`,
            }} />
          </div>
        </div>

        {/* Question body */}
        <div style={{ padding: '12px 16px 14px' }}>

          {/* Q text */}
          <p style={{
            fontSize: 11, color: '#1f2937', fontWeight: 700, lineHeight: 1.55, marginBottom: 12,
            opacity: 0, animation: `cbtA1 ${LOOP}s ease-in-out infinite`,
          }}>
            What is the capital city of Nigeria?
          </p>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {opts.map((opt, j) => (
              <div
                key={opt}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  borderRadius: 10, padding: '7px 10px',
                  background: j === ans ? '#f5f0ff' : '#fafafa',
                  border: `1.5px solid ${j === ans ? '#681DF4' : '#e5e7eb'}`,
                  opacity: 0,
                  animation: `cbtOpt${j} ${LOOP}s ease-in-out infinite`,
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  background: j === ans ? '#681DF4' : '#ede9fe',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 8, fontWeight: 800,
                  color: j === ans ? 'white' : '#a78bfa',
                }}>
                  {['A','B','C','D'][j]}
                </div>
                <span style={{
                  fontSize: 10,
                  color: j === ans ? '#681DF4' : '#374151',
                  fontWeight: j === ans ? 700 : 500,
                }}>
                  {opt}
                </span>
                {j === ans && (
                  <div style={{ marginLeft: 'auto' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#681DF4"/>
                      <path d="M7 12.5 l3.5 3.5 l6-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Next button */}
          <div style={{
            marginTop: 12, borderRadius: 10, padding: '9px 0',
            background: '#681DF4', textAlign: 'center',
            fontSize: 10, fontWeight: 800, color: 'white', letterSpacing: 0.8,
            opacity: 0, animation: `cbtNext ${LOOP}s ease-in-out infinite`,
            cursor: 'default',
          }}>
            NEXT QUESTION →
          </div>
        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes cbtA0    { ${kf(0.1, 0.5)} }
        @keyframes cbtA1    { ${kf(0.4, 0.45)} }
        ${opts.map((_, j) => `@keyframes cbtOpt${j} { ${popKf(0.9 + j * 0.28)} }`).join('\n')}
        @keyframes cbtNext  { ${kf(2.2, 0.4)} }
        @keyframes cbtPencil {
          0%,100% { transform: translateY(0) rotate(-15deg); }
          50%      { transform: translateY(-10px) rotate(-9deg); }
        }
      `}</style>
    </div>
  )
}
