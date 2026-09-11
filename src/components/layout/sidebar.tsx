'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import type { Profile } from '@/lib/types'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

function DashboardIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}
function ClassIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )
}
function SubjectIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  )
}
function QuestionIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
function ExamIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  )
}
function StudentsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
}
function TeachersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}
function ResultsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}
function ReportIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}
function ChildrenIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  )
}

const NAV_ITEMS: Record<string, NavItem[]> = {
  admin: [
    { label: 'Dashboard',    href: '/dashboard',              icon: <DashboardIcon /> },
    { label: 'Classes',      href: '/dashboard/classes',      icon: <ClassIcon /> },
    { label: 'Subjects',     href: '/dashboard/subjects',     icon: <SubjectIcon /> },
    { label: 'Questions',    href: '/dashboard/questions',    icon: <QuestionIcon /> },
    { label: 'Exams',        href: '/dashboard/exams',        icon: <ExamIcon /> },
    { label: 'Students',     href: '/dashboard/students',     icon: <StudentsIcon /> },
    { label: 'Teachers',     href: '/dashboard/teachers',     icon: <TeachersIcon /> },
    { label: 'Results',      href: '/dashboard/results',      icon: <ResultsIcon /> },
    { label: 'Report Cards', href: '/dashboard/report-cards', icon: <ReportIcon /> },
  ],
  teacher: [
    { label: 'Dashboard',    href: '/dashboard',              icon: <DashboardIcon /> },
    { label: 'My Classes',   href: '/dashboard/classes',      icon: <ClassIcon /> },
    { label: 'Questions',    href: '/dashboard/questions',    icon: <QuestionIcon /> },
    { label: 'Exams',        href: '/dashboard/exams',        icon: <ExamIcon /> },
    { label: 'Results',      href: '/dashboard/results',      icon: <ResultsIcon /> },
    { label: 'Report Cards', href: '/dashboard/report-cards', icon: <ReportIcon /> },
  ],
  student: [
    { label: 'Dashboard',  href: '/dashboard',             icon: <DashboardIcon /> },
    { label: 'My Exams',   href: '/dashboard/my-exams',    icon: <ExamIcon /> },
    { label: 'My Results', href: '/dashboard/my-results',  icon: <ResultsIcon /> },
  ],
  parent: [
    { label: 'Dashboard',    href: '/dashboard',              icon: <DashboardIcon /> },
    { label: 'My Children',  href: '/dashboard/my-children',  icon: <ChildrenIcon /> },
    { label: 'Report Cards', href: '/dashboard/report-cards', icon: <ReportIcon /> },
  ],
}

const ROLE_COLORS: Record<string, string> = {
  admin:   'bg-red-100 text-red-700',
  teacher: 'bg-blue-100 text-blue-700',
  student: 'bg-green-100 text-green-700',
  parent:  'bg-orange-100 text-orange-700',
}

interface SidebarProps {
  profile: Profile
}

export default function Sidebar({ profile }: SidebarProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const navItems = NAV_ITEMS[profile.role] ?? NAV_ITEMS.student
  const initial = (profile.full_name?.[0] ?? 'U').toUpperCase()

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo area */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3 mb-2">
          <Image
            src="/examina.png"
            alt="Examina logo"
            width={32}
            height={32}
            className="rounded-xl"
          />
          <div>
            <p className="text-lg font-extrabold leading-none tracking-tight text-[#681DF4]">
              Examina
            </p>
            <p className="text-[10px] text-gray-400 font-medium tracking-wider mt-0.5">
              CBT Portal
            </p>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 leading-snug font-medium">
          Peter Harvard International Schools
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5" aria-label="Main navigation">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#f5f0ff] text-[#681DF4]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className={active ? 'text-[#681DF4]' : 'text-gray-400'}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User + sign out */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: '#681DF4' }}
          >
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{profile.full_name}</p>
            <span className={`inline-block text-[10px] font-semibold rounded-full px-2 py-0.5 ${ROLE_COLORS[profile.role] ?? 'bg-gray-100 text-gray-600'}`}>
              {profile.role}
            </span>
          </div>
        </div>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium border border-gray-200 text-gray-600 hover:border-[#681DF4] hover:text-[#681DF4] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        aria-label="Open navigation menu"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 shadow-sm"
      >
        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transform transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile navigation"
      >
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 h-screen sticky top-0 flex-shrink-0">
        <SidebarContent />
      </aside>
    </>
  )
}
