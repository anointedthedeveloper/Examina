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
            Anobyte Technologies &copy; {new Date().getFullYear()}
          </p>
        </div>

        {/* ── Right / Bottom: Illustration — hidden on mobile ── */}
        <div
          className="hidden md:flex flex-1 items-center justify-center px-6 py-8 relative"
          style={{ background: '#f0f0f5' }}
        >
          <SmallDotGrid className="absolute top-5 right-5 opacity-25" />
          <ExamIllustration />
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

/* ─── Exam Illustration ───────────────────────────────────────── */

function ExamIllustration() {
  return (
    <svg
      viewBox="0 0 320 280"
      className="w-full max-w-xs"
      role="img"
      aria-label="Student sitting an exam with answer sheet, pencil and clock"
    >
      {/* Desk shadow */}
      <ellipse cx="160" cy="252" rx="110" ry="10" fill="#c4b5fd" opacity="0.25" />

      {/* Desk surface */}
      <rect x="40" y="185" width="240" height="14" rx="4" fill="#7c3aed" opacity="0.2" />
      <rect x="44" y="192" width="232" height="60" rx="4" fill="#ede9fe" opacity="0.6" />

      {/* Desk legs */}
      <rect x="60" y="252" width="8" height="22" rx="3" fill="#7c3aed" opacity="0.3" />
      <rect x="252" y="252" width="8" height="22" rx="3" fill="#7c3aed" opacity="0.3" />

      {/* Answer sheet */}
      <rect x="72" y="155" width="110" height="100" rx="5" fill="white" />
      <rect x="72" y="155" width="110" height="18" rx="5" fill="#681DF4" />
      <text x="127" y="168" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold" letterSpacing="1">
        ANSWER SHEET
      </text>

      {/* Q rows with A B C D bubbles */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i} transform={`translate(82, ${183 + i * 13})`}>
          <text x="0" y="8" fontSize="6" fill="#6b7280" fontWeight="600">{i + 1}.</text>
          {['A', 'B', 'C', 'D'].map((opt, j) => {
            const filled =
              (i === 0 && j === 1) || (i === 1 && j === 3) ||
              (i === 2 && j === 0) || (i === 4 && j === 2)
            return (
              <g key={opt} transform={`translate(${14 + j * 17}, 0)`}>
                <circle
                  cx="5.5" cy="4.5" r="4.5"
                  fill={filled ? '#681DF4' : 'none'}
                  stroke={filled ? '#681DF4' : '#c4b5fd'}
                  strokeWidth="1.2"
                />
                <text
                  x="5.5" y="7.5"
                  textAnchor="middle"
                  fontSize="5"
                  fill={filled ? 'white' : '#a78bfa'}
                  fontWeight="600"
                >
                  {opt}
                </text>
              </g>
            )
          })}
        </g>
      ))}

      {/* Pencil */}
      <g transform="translate(196, 148) rotate(-35)">
        <rect x="0" y="0" width="11" height="65" rx="2" fill="#fbbf24" />
        <rect x="0" y="0" width="11" height="9" rx="2" fill="#f87171" />
        <rect x="0" y="9" width="11" height="4" fill="#94a3b8" />
        <polygon points="0,65 11,65 5.5,76" fill="#fcd34d" />
        <polygon points="2.5,70 8.5,70 5.5,76" fill="#1e293b" />
        <rect x="2.5" y="14" width="2" height="46" rx="1" fill="white" opacity="0.3" />
      </g>

      {/* Person — head */}
      <circle cx="162" cy="88" r="20" fill="#fcd34d" />
      {/* hair */}
      <path d="M142 86 Q145 67 162 65 Q179 67 182 86 Q174 76 162 77 Q150 76 142 86Z" fill="#1e3a5f" />
      {/* body */}
      <rect x="149" y="107" width="26" height="32" rx="6" fill="#681DF4" />
      {/* collar */}
      <path d="M162 107 l-5 7 l5-3.5 l5 3.5 l-5-7Z" fill="white" opacity="0.35" />
      {/* left arm resting */}
      <path d="M149 118 Q125 130 108 168" stroke="#681DF4" strokeWidth="9" strokeLinecap="round" fill="none" />
      <circle cx="108" cy="170" r="6.5" fill="#fcd34d" />
      {/* right arm with pencil */}
      <path d="M175 118 Q194 132 204 156" stroke="#681DF4" strokeWidth="9" strokeLinecap="round" fill="none" />
      <circle cx="205" cy="158" r="6.5" fill="#fcd34d" />

      {/* Chair */}
      <rect x="136" y="178" width="5" height="30" rx="2" fill="#94a3b8" />
      <rect x="179" y="178" width="5" height="30" rx="2" fill="#94a3b8" />
      <rect x="133" y="206" width="54" height="4" rx="2" fill="#94a3b8" />
      <rect x="133" y="170" width="54" height="9" rx="4" fill="#7c3aed" opacity="0.45" />
      <rect x="133" y="138" width="7" height="34" rx="3" fill="#7c3aed" opacity="0.38" />
      <rect x="180" y="138" width="7" height="34" rx="3" fill="#7c3aed" opacity="0.38" />
      <rect x="133" y="138" width="54" height="7" rx="3" fill="#7c3aed" opacity="0.38" />

      {/* Clock on wall */}
      <circle cx="278" cy="72" r="22" fill="white" stroke="#681DF4" strokeWidth="2.5" />
      <circle cx="278" cy="72" r="2.5" fill="#681DF4" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => {
        const a = (i * 30 - 90) * Math.PI / 180
        return (
          <line
            key={i}
            x1={278 + 16 * Math.cos(a)} y1={72 + 16 * Math.sin(a)}
            x2={278 + 19 * Math.cos(a)} y2={72 + 19 * Math.sin(a)}
            stroke="#a78bfa"
            strokeWidth={i % 3 === 0 ? 2 : 1}
          />
        )
      })}
      {/* hour hand pointing ~10 */}
      <line x1="278" y1="72" x2="269" y2="58" stroke="#681DF4" strokeWidth="2.5" strokeLinecap="round" />
      {/* minute hand pointing ~2 */}
      <line x1="278" y1="72" x2="290" y2="64" stroke="#3b0764" strokeWidth="1.8" strokeLinecap="round" />

      {/* Grade A badge */}
      <circle cx="54" cy="70" r="20" fill="#681DF4" />
      <text x="54" y="67" textAnchor="middle" fontSize="13" fill="white" fontWeight="bold">A</text>
      <text x="54" y="78" textAnchor="middle" fontSize="6.5" fill="#c4b5fd">grade</text>

      {/* Accent diamonds */}
      <rect x="44" y="130" width="9" height="9" rx="1" fill="#a78bfa" opacity="0.45" transform="rotate(45 48.5 134.5)" />
      <rect x="248" y="200" width="8" height="8" rx="1" fill="#681DF4" opacity="0.3" transform="rotate(45 252 204)" />
    </svg>
  )
}
