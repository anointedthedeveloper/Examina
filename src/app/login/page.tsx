'use client'

import { useState, useEffect, useRef } from 'react'
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
        style={{ maxWidth: 860, background: '#f0eff6' }}
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
          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email */}
            <input
              type="email"
              placeholder="Your Email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full rounded-xl bg-white px-5 py-3.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
              style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}
              onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 2.5px #681DF4')}
              onBlur={e  => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)')}
            />

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full rounded-xl bg-white px-5 py-3.5 pr-12 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}
                onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 2.5px #681DF4')}
                onBlur={e  => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)')}
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: showPassword ? '#681DF4' : '#9ca3af' }}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>

            {/* Forgot row */}
            <div className="flex items-start justify-between gap-4 pt-1">
              <div className="flex-1">
                <button
                  type="button"
                  onClick={() => setShowForgot(v => !v)}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Forgot password?
                </button>

                {showForgot && (
                  <div
                    className="mt-2 rounded-xl px-4 py-3 text-xs text-gray-600 leading-relaxed border border-purple-100"
                    style={{ background: '#f5f0ff' }}
                  >
                    <p className="font-semibold text-gray-700 mb-0.5">Can&apos;t access your account?</p>
                    <p>
                      Contact your{' '}
                      <span className="font-semibold" style={{ color: '#681DF4' }}>
                        school administrator
                      </span>{' '}
                      to reset your password. Your admin can update credentials from the admin dashboard.
                    </p>
                  </div>
                )}
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
          style={{ background: '#f0eff6' }}
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

const QUESTIONS = [
  {
    subject: 'General Knowledge',
    qNum: 1, total: 5, progress: 20,
    text: 'What is the capital city of Nigeria?',
    opts: ['Lagos', 'Abuja', 'Kano', 'Ibadan'],
    ans: 1,
    timer: '29:47',
  },
  {
    subject: 'Mathematics',
    qNum: 2, total: 5, progress: 40,
    text: 'Solve for x:  2x + 4 = 12',
    opts: ['x = 2', 'x = 4', 'x = 6', 'x = 8'],
    ans: 1,
    timer: '28:12',
  },
  {
    subject: 'Basic Science',
    qNum: 3, total: 5, progress: 60,
    text: 'What is the chemical formula for water?',
    opts: ['CO₂', 'H₂O₂', 'H₂O', 'NaCl'],
    ans: 2,
    timer: '26:55',
  },
]

type Phase = 'entering' | 'visible' | 'answering' | 'exiting'

function CbtAnimation() {
  const [qIndex, setQIndex]   = useState(0)
  const [phase, setPhase]     = useState<Phase>('entering')
  const [selOpt, setSelOpt]   = useState<number | null>(null)
  const timerRef              = useRef<ReturnType<typeof setTimeout> | null>(null)

  function clear() { if (timerRef.current) clearTimeout(timerRef.current) }

  useEffect(() => {
    // Phase timeline per question:
    // entering  → 600ms  (slide in)
    // visible   → 1400ms (options pop in one by one)
    // answering → 900ms  (highlight answer + checkmark)
    // exiting   → 600ms  (slide out) → next question
    clear()

    if (phase === 'entering') {
      setSelOpt(null)
      timerRef.current = setTimeout(() => setPhase('visible'), 600)
    } else if (phase === 'visible') {
      timerRef.current = setTimeout(() => {
        setSelOpt(QUESTIONS[qIndex].ans)
        setPhase('answering')
      }, 1800)
    } else if (phase === 'answering') {
      timerRef.current = setTimeout(() => setPhase('exiting'), 1000)
    } else if (phase === 'exiting') {
      timerRef.current = setTimeout(() => {
        setQIndex(i => (i + 1) % QUESTIONS.length)
        setPhase('entering')
      }, 600)
    }

    return clear
  }, [phase, qIndex])

  const q = QUESTIONS[qIndex]

  const slideStyle: React.CSSProperties = {
    transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1), opacity 0.55s ease',
    transform:
      phase === 'entering' ? 'translateX(60px) skewX(-4deg)' :
      phase === 'exiting'  ? 'translateX(-60px) skewX(4deg)' :
      'translateX(0) skewX(0)',
    opacity: (phase === 'entering' || phase === 'exiting') ? 0 : 1,
  }

  return (
    <div className="select-none" aria-hidden="true" style={{ width: 264 }}>

      {/* School name tag */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{
            width:18, height:18, borderRadius:'50%',
            background:'#681DF4',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
          </div>
          <span style={{ fontSize:9, fontWeight:700, color:'#681DF4', letterSpacing:0.3 }}>
            Peter Harvard International Schools
          </span>
        </div>
        {/* Pencil */}
        <div style={{ animation:'cbtPencil 2.2s ease-in-out infinite', transformOrigin:'bottom center' }}>
          <svg width="18" height="52" viewBox="0 0 18 52">
            <rect x="3" y="0" width="12" height="36" rx="2" fill="#fbbf24"/>
            <rect x="3" y="0" width="12" height="6" rx="2" fill="#f87171"/>
            <rect x="3" y="6" width="12" height="3" fill="#d1d5db"/>
            <polygon points="3,36 15,36 9,46" fill="#fde68a"/>
            <polygon points="6,41 12,41 9,46" fill="#1c1917"/>
            <rect x="6" y="9" width="2" height="24" rx="1" fill="white" opacity="0.22"/>
          </svg>
        </div>
      </div>

      {/* Card with slide transition */}
      <div style={{ overflow:'hidden', borderRadius:16 }}>
        <div style={slideStyle}>
          <div style={{
            background:'white',
            borderRadius:16,
            boxShadow:'0 12px 40px rgba(104,29,244,0.15)',
            overflow:'hidden',
          }}>

            {/* Header */}
            <div style={{
              background:'#681DF4', padding:'9px 14px',
              display:'flex', alignItems:'center', justifyContent:'space-between',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{
                  background:'rgba(255,255,255,0.22)', borderRadius:5,
                  padding:'2px 7px', fontSize:7.5, color:'white', fontWeight:800, letterSpacing:1.2,
                }}>CBT</div>
                <span style={{ color:'rgba(255,255,255,0.9)', fontSize:8.5, fontWeight:600 }}>
                  {q.subject}
                </span>
              </div>
              <div style={{
                display:'flex', alignItems:'center', gap:3,
                background:'rgba(255,255,255,0.15)', borderRadius:20, padding:'2px 7px',
              }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                </svg>
                <span style={{ fontSize:8.5, color:'white', fontWeight:700 }}>{q.timer}</span>
              </div>
            </div>

            {/* Progress */}
            <div style={{ padding:'8px 14px 0' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                <span style={{ fontSize:7.5, color:'#9ca3af', fontWeight:600 }}>
                  Question {q.qNum} of {q.total}
                </span>
                <span style={{ fontSize:7.5, color:'#681DF4', fontWeight:700 }}>{q.progress}%</span>
              </div>
              <div style={{ height:4, borderRadius:9999, background:'#ede9fe' }}>
                <div style={{
                  height:'100%', borderRadius:9999,
                  background:'linear-gradient(90deg,#681DF4,#a78bfa)',
                  width:`${q.progress}%`,
                  transition:'width 0.6s ease',
                }}/>
              </div>
            </div>

            {/* Question + options */}
            <div style={{ padding:'11px 14px 13px' }}>
              <p style={{ fontSize:10.5, color:'#111827', fontWeight:700, lineHeight:1.55, marginBottom:10 }}>
                {q.text}
              </p>

              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {q.opts.map((opt, j) => {
                  const isAns      = j === q.ans
                  const isSelected = selOpt === j
                  const delay      = `${j * 120}ms`

                  return (
                    <div
                      key={opt}
                      style={{
                        display:'flex', alignItems:'center', gap:8,
                        borderRadius:9, padding:'6px 9px',
                        background: isSelected ? '#f5f0ff' : '#fafafa',
                        border:`1.5px solid ${isSelected ? '#681DF4' : '#e5e7eb'}`,
                        transition:`all 0.3s ease ${delay}`,
                        transform: phase === 'visible' ? 'translateX(0)' : 'translateX(0)',
                        opacity: phase === 'entering' ? 0 : 1,
                        transitionDelay: phase === 'entering' ? delay : '0ms',
                      }}
                    >
                      <div style={{
                        width:19, height:19, borderRadius:'50%', flexShrink:0,
                        background: isSelected ? '#681DF4' : '#ede9fe',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:7.5, fontWeight:800,
                        color: isSelected ? 'white' : '#a78bfa',
                        transition:'all 0.3s ease',
                      }}>
                        {isSelected && isAns
                          ? <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5.5l2 2 4-4" stroke="white" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                          : ['A','B','C','D'][j]
                        }
                      </div>
                      <span style={{
                        fontSize:9.5,
                        color: isSelected ? '#681DF4' : '#374151',
                        fontWeight: isSelected ? 700 : 500,
                        transition:'color 0.3s ease',
                      }}>
                        {opt}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Next / Submit button */}
              <div style={{
                marginTop:10, borderRadius:9, padding:'8px 0',
                background: phase === 'answering' ? '#681DF4' : '#ede9fe',
                textAlign:'center', fontSize:9.5, fontWeight:800,
                color: phase === 'answering' ? 'white' : '#c4b5fd',
                letterSpacing:0.8, transition:'all 0.35s ease',
                cursor:'default',
              }}>
                {q.qNum < q.total ? 'NEXT QUESTION →' : 'SUBMIT EXAM ✓'}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Question dot indicators */}
      <div style={{ display:'flex', justifyContent:'center', gap:6, marginTop:10 }}>
        {QUESTIONS.map((_, i) => (
          <div key={i} style={{
            width: i === qIndex ? 18 : 6,
            height:6, borderRadius:9999,
            background: i === qIndex ? '#681DF4' : '#c4b5fd',
            transition:'all 0.35s ease',
          }}/>
        ))}
      </div>

      <style>{`
        @keyframes cbtPencil {
          0%,100% { transform:translateY(0) rotate(-14deg); }
          50%      { transform:translateY(-8px) rotate(-8deg); }
        }
      `}</style>
    </div>
  )
}
