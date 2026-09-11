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

    // Supabase auth will go here
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
      className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #3d0a9e 0%, #5a12d4 40%, #681DF4 70%, #7c2ff7 100%)' }}
    >
      {/* Dot grid — top left */}
      <DotGrid className="absolute top-10 left-10 opacity-25" />
      {/* Dot grid — bottom right */}
      <DotGrid className="absolute bottom-10 right-16 opacity-25" />

      {/* Decorative outline square — bottom left */}
      <div
        className="absolute bottom-16 left-20 w-12 h-12 rounded-md rotate-12"
        style={{ border: '2px solid rgba(255,255,255,0.35)' }}
      />

      {/* Decorative triangle — bottom left */}
      <div
        className="absolute bottom-10 left-36"
        style={{
          width: 0, height: 0,
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderBottom: '18px solid #00e5ff',
          opacity: 0.85,
        }}
      />

      {/* Decorative bar — top right */}
      <div
        className="absolute top-14 right-6 w-20 h-7 rounded-sm opacity-75 rotate-2"
        style={{ background: '#00e5ff' }}
      />

      {/* Card */}
      <div className="relative w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex"
        style={{ background: '#f0f0f5', minHeight: 380 }}>

        {/* ── Left: Form ── */}
        <div className="flex flex-col justify-between flex-1 px-10 py-10">

          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <Image src="/examina.png" alt="Examina logo" width={38} height={38} className="rounded-xl" />
            <span className="text-2xl font-extrabold tracking-tight" style={{ color: '#681DF4' }}>
              Examina
            </span>
          </div>

          {/* Heading */}
          <p className="text-gray-700 font-semibold text-sm mb-5">Login to your account</p>

          {/* Error */}
          {error && (
            <div role="alert" className="mb-4 rounded-lg px-4 py-3 text-sm text-red-700 border border-red-200" style={{ background: '#fef2f2' }}>
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
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 shadow-sm focus:outline-none transition"
              style={{ border: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px #681DF4')}
              onBlur={(e) => (e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)')}
            />

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl bg-white px-4 py-3 pr-12 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none transition"
                style={{ border: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
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

            {/* Forgot + Login row */}
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

          {/* Footer */}
          <p className="text-xs text-gray-400 mt-8">
            Anobyte Technologies &copy; {new Date().getFullYear()}
          </p>
        </div>

        {/* ── Right: Illustration ── */}
        <div className="hidden md:flex flex-1 items-center justify-center px-6 py-8 relative" style={{ background: '#f0f0f5' }}>
          <SmallDotGrid className="absolute top-5 right-5 opacity-30" />
          <StudyIllustration />
        </div>
      </div>
    </main>
  )
}

/* ─── SVG helpers ─────────────────────────────────────────────── */

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

function StudyIllustration() {
  return (
    <svg viewBox="0 0 320 280" className="w-full max-w-xs" role="img" aria-label="Student sitting an exam with answer sheet and pencil">

      {/* ── Desk shadow ── */}
      <ellipse cx="160" cy="252" rx="110" ry="10" fill="#c4b5fd" opacity="0.25" />

      {/* ── Desk surface ── */}
      <rect x="40" y="185" width="240" height="14" rx="4" fill="#7c3aed" opacity="0.2" />
      <rect x="44" y="192" width="232" height="60" rx="4" fill="#ede9fe" opacity="0.6" />

      {/* ── Desk legs ── */}
      <rect x="60" y="252" width="8" height="22" rx="3" fill="#7c3aed" opacity="0.3" />
      <rect x="252" y="252" width="8" height="22" rx="3" fill="#7c3aed" opacity="0.3" />

      {/* ── Answer sheet ── */}
      <rect x="72" y="155" width="110" height="140" rx="5" fill="white" />
      <rect x="72" y="155" width="110" height="18" rx="5" fill="#681DF4" />
      <text x="127" y="168" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold" letterSpacing="1">ANSWER SHEET</text>

      {/* Question rows — A B C D bubbles */}
      {[0,1,2,3,4,5].map((i) => (
        <g key={i} transform={`translate(82, ${183 + i * 18})`}>
          <text x="0" y="8" fontSize="6.5" fill="#6b7280" fontWeight="600">{i + 1}.</text>
          {['A','B','C','D'].map((opt, j) => {
            const filled =
              (i === 0 && j === 1) || (i === 1 && j === 3) ||
              (i === 2 && j === 0) || (i === 4 && j === 2)
            return (
              <g key={opt} transform={`translate(${14 + j * 18}, 0)`}>
                <circle cx="6" cy="5" r="5"
                  fill={filled ? '#681DF4' : 'none'}
                  stroke={filled ? '#681DF4' : '#c4b5fd'}
                  strokeWidth="1.2"
                />
                <text x="6" y="8" textAnchor="middle" fontSize="5.5"
                  fill={filled ? 'white' : '#a78bfa'} fontWeight="600"
                >{opt}</text>
              </g>
            )
          })}
        </g>
      ))}

      {/* ── Pencil ── */}
      <g transform="translate(198, 145) rotate(-35)">
        <rect x="0" y="0" width="12" height="70" rx="2" fill="#fbbf24" />
        <rect x="0" y="0" width="12" height="10" rx="2" fill="#f87171" />
        <rect x="0" y="10" width="12" height="4" fill="#94a3b8" />
        <polygon points="0,70 12,70 6,82" fill="#fcd34d" />
        <polygon points="3,75 9,75 6,82" fill="#1e293b" />
        <rect x="3" y="15" width="2.5" height="50" rx="1" fill="white" opacity="0.3" />
      </g>

      {/* ── Person ── */}
      <circle cx="162" cy="88" r="20" fill="#fcd34d" />
      <path d="M142 86 Q145 67 162 65 Q179 67 182 86 Q174 76 162 77 Q150 76 142 86Z" fill="#1e3a5f" />
      <rect x="149" y="107" width="26" height="32" rx="6" fill="#681DF4" />
      <path d="M162 107 l-6 8 l6-4 l6 4 l-6-8Z" fill="white" opacity="0.4" />
      {/* left arm on desk */}
      <path d="M149 118 Q125 128 108 168" stroke="#681DF4" strokeWidth="9" strokeLinecap="round" fill="none" />
      <circle cx="108" cy="170" r="7" fill="#fcd34d" />
      {/* right arm holding pencil */}
      <path d="M175 118 Q195 132 205 158" stroke="#681DF4" strokeWidth="9" strokeLinecap="round" fill="none" />
      <circle cx="206" cy="160" r="7" fill="#fcd34d" />

      {/* ── Chair ── */}
      <rect x="136" y="178" width="6" height="30" rx="2" fill="#94a3b8" />
      <rect x="178" y="178" width="6" height="30" rx="2" fill="#94a3b8" />
      <rect x="133" y="206" width="54" height="5" rx="2" fill="#94a3b8" />
      <rect x="133" y="170" width="54" height="10" rx="4" fill="#7c3aed" opacity="0.5" />
      <rect x="133" y="138" width="8" height="35" rx="3" fill="#7c3aed" opacity="0.4" />
      <rect x="179" y="138" width="8" height="35" rx="3" fill="#7c3aed" opacity="0.4" />
      <rect x="133" y="138" width="54" height="8" rx="3" fill="#7c3aed" opacity="0.4" />

      {/* ── Clock ── */}
      <circle cx="278" cy="75" r="22" fill="white" stroke="#681DF4" strokeWidth="2.5" />
      <circle cx="278" cy="75" r="2.5" fill="#681DF4" />
      {[0,1,2,3,4,5,6,7,8,9,10,11].map((i) => {
        const a = (i * 30 - 90) * Math.PI / 180
        return (
          <line key={i}
            x1={278 + 16 * Math.cos(a)} y1={75 + 16 * Math.sin(a)}
            x2={278 + 19 * Math.cos(a)} y2={75 + 19 * Math.sin(a)}
            stroke="#a78bfa" strokeWidth={i % 3 === 0 ? 2 : 1}
          />
        )
      })}
      <line x1="278" y1="75" x2="278" y2="60" stroke="#681DF4" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="278" y1="75" x2="290" y2="78" stroke="#3b0764" strokeWidth="1.8" strokeLinecap="round" />

      {/* ── Grade badge ── */}
      <circle cx="56" cy="72" r="20" fill="#681DF4" />
      <text x="56" y="69" textAnchor="middle" fontSize="13" fill="white" fontWeight="bold">A</text>
      <text x="56" y="80" textAnchor="middle" fontSize="7" fill="#c4b5fd">grade</text>

      {/* ── Accent diamonds ── */}
      <rect x="44" y="130" width="9" height="9" rx="1" fill="#a78bfa" opacity="0.5" transform="rotate(45 48.5 134.5)" />
      <rect x="250" y="200" width="8" height="8" rx="1" fill="#681DF4" opacity="0.35" transform="rotate(45 254 204)" />
    </svg>
  )
}

      {/* Shadow */}
      <ellipse cx="158" cy="232" rx="85" ry="12" fill="#c4b5fd" opacity="0.3" />

      {/* ── Laptop ── */}
      <rect x="88" y="185" width="142" height="9" rx="4" fill="#5b21b6" />
      <rect x="98" y="128" width="122" height="60" rx="6" fill="#ede9fe" />
      <rect x="104" y="134" width="110" height="48" rx="4" fill="#7c3aed" />
      {/* screen lines */}
      <rect x="112" y="143" width="50" height="4" rx="2" fill="#c4b5fd" opacity="0.6" />
      <rect x="112" y="152" width="70" height="3" rx="2" fill="#c4b5fd" opacity="0.4" />
      <rect x="112" y="160" width="58" height="3" rx="2" fill="#c4b5fd" opacity="0.4" />
      {/* keyboard row */}
      <rect x="102" y="186" width="114" height="5" rx="2" fill="#7c3aed" opacity="0.3" />

      {/* ── Calendar ── */}
      <rect x="205" y="82" width="88" height="100" rx="8" fill="#ede9fe" />
      <rect x="205" y="82" width="88" height="22" rx="8" fill="#681DF4" />
      {/* rings */}
      {[220, 235, 250, 265, 280].map((x) => (
        <rect key={x} x={x} y="76" width="5" height="13" rx="2.5" fill="#4c0abf" />
      ))}
      {/* grid cells */}
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2].map((col) => {
          const highlight = row === 1 && col === 1
          return (
            <rect
              key={`${row}-${col}`}
              x={213 + col * 26}
              y={112 + row * 17}
              width="18"
              height="12"
              rx="2"
              fill={highlight ? '#681DF4' : '#c4b5fd'}
            />
          )
        })
      )}
      {/* tick on highlighted cell */}
      <path d="M238 118 l4 4 l8-8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* ── Person ── */}
      {/* head */}
      <circle cx="156" cy="84" r="17" fill="#fcd34d" />
      {/* hair */}
      <path d="M139 82 Q142 66 156 64 Q170 66 173 82 Q166 73 156 74 Q146 73 139 82Z" fill="#1e3a5f" />
      {/* body */}
      <rect x="144" y="100" width="24" height="28" rx="5" fill="#681DF4" />
      {/* left arm */}
      <path d="M144 110 Q126 116 124 136" stroke="#681DF4" strokeWidth="8" strokeLinecap="round" fill="none" />
      {/* right arm */}
      <path d="M168 110 Q182 116 180 134" stroke="#681DF4" strokeWidth="8" strokeLinecap="round" fill="none" />
      {/* hands */}
      <circle cx="124" cy="138" r="6" fill="#fcd34d" />
      <circle cx="180" cy="136" r="6" fill="#fcd34d" />
      {/* legs */}
      <path d="M150 128 L146 160" stroke="#1e3a5f" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M166 128 L170 160" stroke="#1e3a5f" strokeWidth="7" strokeLinecap="round" fill="none" />
      <ellipse cx="146" cy="161" rx="7" ry="5" fill="#1e3a5f" />
      <ellipse cx="170" cy="161" rx="7" ry="5" fill="#1e3a5f" />

      {/* ── Stool ── */}
      <rect x="142" y="163" width="34" height="6" rx="3" fill="#94a3b8" />
      <rect x="148" y="169" width="4" height="20" rx="2" fill="#94a3b8" />
      <rect x="166" y="169" width="4" height="20" rx="2" fill="#94a3b8" />
      <rect x="145" y="188" width="28" height="4" rx="2" fill="#94a3b8" />

      {/* ── Connection line person → calendar ── */}
      <path d="M178 122 Q196 112 205 114" stroke="#681DF4" strokeWidth="1.5" strokeDasharray="5 3" fill="none" opacity="0.5" />

      {/* ── Chat bubble ── */}
      <rect x="72" y="142" width="36" height="22" rx="6" fill="#681DF4" />
      <circle cx="83" cy="153" r="2.5" fill="white" />
      <circle cx="90" cy="153" r="2.5" fill="white" />
      <circle cx="97" cy="153" r="2.5" fill="white" />
      <path d="M82 164 L78 172" stroke="#681DF4" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* ── Coin badge ── */}
      <circle cx="298" cy="90" r="11" fill="#34d399" />
      <text x="298" y="95" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">$</text>

      {/* ── Small floating diamond accents ── */}
      <rect x="97" y="104" width="9" height="9" rx="1" fill="#a78bfa" opacity="0.55" transform="rotate(45 101.5 108.5)" />
      <rect x="208" y="205" width="8" height="8" rx="1" fill="#681DF4" opacity="0.4" transform="rotate(45 212 209)" />
    </svg>
  )
}
