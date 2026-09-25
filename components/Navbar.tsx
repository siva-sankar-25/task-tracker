'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'
import ThemeModeToggle from '@/components/ThemeModeToggle'

interface NavbarProps {
  userEmail?: string | null
  userName?: string | null
}

export default function Navbar({ userEmail, userName }: NavbarProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const displayName = userName || userEmail

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Goals', href: '/goals' },
    { name: 'Tasks', href: '/tasks' },
    { name: 'Calendar', href: '/calendar' },
    { name: 'Weekly Review', href: '/weekly-review' },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  const isSettingsActive = pathname.startsWith('/settings')

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-color)] bg-[var(--card-bg)] backdrop-blur-md transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-5 md:gap-8">
            <Link
              href="/dashboard"
              className="text-xl font-bold tracking-tight text-[var(--text-primary)] hover:opacity-90 transition-all duration-200 ease-out hover:-translate-y-0.5"
            >
              Task Tracker
            </Link>

            {/* Desktop Navigation links */}
            <nav className="hidden sm:flex sm:items-center sm:gap-1">
              {navLinks.map((link) => {
                const active = isActive(link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-out hover:-translate-y-0.5 ${
                      active
                        ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 font-semibold shadow-2xs'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Desktop Right items */}
          <div className="hidden sm:flex sm:items-center sm:gap-3">
            {displayName && (
              <span className="text-xs md:text-sm text-[var(--text-secondary)] font-medium truncate max-w-[180px]">
                {displayName}
              </span>
            )}
            <ThemeModeToggle />
            <Link
              href="/settings"
              title="Settings & Appearance"
              aria-label="Settings & Appearance"
              className={`inline-flex h-9 w-9 items-center justify-center rounded-md border shadow-2xs hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200 ease-out hover:-translate-y-0.5 ${
                isSettingsActive
                  ? 'border-blue-500 bg-blue-500/15 text-blue-600 dark:text-blue-400'
                  : 'border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-primary)]'
              }`}
            >
              <svg
                className="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            </Link>
            <LogoutButton />
          </div>

          {/* Mobile Right items */}
          <div className="flex items-center gap-2 sm:hidden">
            <ThemeModeToggle />
            <Link
              href="/settings"
              title="Settings & Appearance"
              aria-label="Settings & Appearance"
              className={`inline-flex h-9 w-9 items-center justify-center rounded-md border shadow-2xs hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
                isSettingsActive
                  ? 'border-blue-500 bg-blue-500/15 text-blue-600 dark:text-blue-400'
                  : 'border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-primary)]'
              }`}
            >
              <svg
                className="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-primary)] shadow-xs hover:bg-black/5 dark:hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
            >
              {mobileMenuOpen ? (
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-[var(--border-color)] bg-[var(--card-bg)] backdrop-blur-md px-4 pt-3 pb-4 shadow-lg">
          {displayName && (
            <div className="pb-3 mb-2 border-b border-[var(--border-color)]">
              <p className="text-xs text-[var(--text-secondary)]">Signed in as</p>
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                {displayName}
              </p>
            </div>
          )}
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </Link>
              )
            })}
            <Link
              href="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isSettingsActive
                  ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              Settings
            </Link>
          </nav>
          <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex justify-end">
            <LogoutButton />
          </div>
        </div>
      )}
    </header>
  )
}

