'use client'

import React from 'react'
import { useTheme } from '@/components/ThemeProvider'

interface ThemeModeToggleProps {
  className?: string
}

export default function ThemeModeToggle({ className = '' }: ThemeModeToggleProps) {
  const { theme, mode, setMode } = useTheme()

  const isDOMCleanWhite =
    typeof document !== 'undefined'
      ? document.documentElement.dataset.theme === 'clean-white'
      : true

  const isCleanWhite = theme === 'clean-white' || isDOMCleanWhite
  const isDark = isCleanWhite ? mode === 'dark' : true

  const handleToggle = () => {
    if (!isCleanWhite) return
    setMode(mode === 'dark' ? 'light' : 'dark')
  }

  const tooltipText = !isCleanWhite
    ? 'Only available with Clean White theme'
    : `Switch to ${isDark ? 'Light' : 'Dark'} mode`

  return (
    <div className={`relative inline-flex ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={!isCleanWhite}
        title={tooltipText}
        aria-label={tooltipText}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-md border shadow-2xs transition-all duration-200 ease-out ${
          isCleanWhite
            ? 'border-[var(--border-color)] bg-[var(--card-bg)] backdrop-blur-md text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 hover:-translate-y-0.5 cursor-pointer'
            : 'border-[var(--border-color)]/40 bg-[var(--card-bg)]/40 text-[var(--text-secondary)] opacity-40 cursor-not-allowed'
        }`}
      >
        {isDark ? (
          // Sun Icon (indicates clicking will switch to Light mode)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-amber-400"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
        ) : (
          // Moon Icon (indicates clicking will switch to Dark mode)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-slate-700 dark:text-slate-200"
          >
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        )}
      </button>
    </div>
  )
}
