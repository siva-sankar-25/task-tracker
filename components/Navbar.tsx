'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'
import ThemeToggle from '@/components/ThemeToggle'

interface NavbarProps {
  userEmail?: string | null
}

export default function Navbar({ userEmail }: NavbarProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Goals', href: '/goals' },
    { name: 'Tasks', href: '/tasks' },
    { name: 'Weekly Review', href: '/weekly-review' },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/95 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo & Desktop Nav */}
          <div className="flex items-center gap-6 md:gap-8">
            <Link
              href="/dashboard"
              className="text-xl font-bold tracking-tight text-gray-900 dark:text-white hover:opacity-90 transition-opacity"
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
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-zinc-800'
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
            {userEmail && (
              <span className="text-xs md:text-sm text-gray-600 dark:text-gray-300 font-medium truncate max-w-[200px]">
                {userEmail}
              </span>
            )}
            <ThemeToggle />
            <LogoutButton />
          </div>

          {/* Mobile Right items (Theme toggle + Hamburger button) */}
          <div className="flex items-center gap-2 sm:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 shadow-xs hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
            >
              {mobileMenuOpen ? (
                // Close X Icon
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                // Hamburger 3 bars Icon
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-4 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          {userEmail && (
            <div className="pb-3 mb-2 border-b border-gray-100 dark:border-zinc-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {userEmail}
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
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-zinc-800'
                  }`}
                >
                  {link.name}
                </Link>
              )
            })}
          </nav>
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
            <LogoutButton />
          </div>
        </div>
      )}
    </header>
  )
}
