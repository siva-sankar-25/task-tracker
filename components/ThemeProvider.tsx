'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export type ThemeType =
  | 'clean-white'
  | 'midnight'
  | 'aurora'
  | 'sunset'
  | 'emerald'

export type ModeType = 'light' | 'dark'

export interface ThemeDefinition {
  id: ThemeType
  name: string
  description: string
  previewBg: string
  previewGradient: string
  borderPreview: string
  accentColor: string
  textColor: string
  isDark: boolean
}

export const THEMES: ThemeDefinition[] = [
  {
    id: 'clean-white',
    name: 'Clean White',
    description: 'Minimalist theme supporting Light and Dark modes',
    previewBg: '#f8fafc',
    previewGradient: 'none',
    borderPreview: '#e2e8f0',
    accentColor: '#3b82f6',
    textColor: '#0f172a',
    isDark: false,
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep sleek obsidian dark theme',
    previewBg: '#090a0f',
    previewGradient: 'none',
    borderPreview: '#27272a',
    accentColor: '#60a5fa',
    textColor: '#f1f5f9',
    isDark: true,
  },
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Cosmic purple glow with drifting lights',
    previewBg: '#0e0a1f',
    previewGradient: 'radial-gradient(ellipse at top, #2e1065 0%, #0e0a1f 60%)',
    borderPreview: '#7c3aed',
    accentColor: '#a78bfa',
    textColor: '#f1f5f9',
    isDark: true,
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm evening glow with crimson accents',
    previewBg: '#1a0f14',
    previewGradient: 'radial-gradient(ellipse at bottom, #451a1a 0%, #1a0f14 65%)',
    borderPreview: '#f87171',
    accentColor: '#fca5a5',
    textColor: '#fef3c7',
    isDark: true,
  },
  {
    id: 'emerald',
    name: 'Emerald',
    description: 'Rich deep forest and jade tones',
    previewBg: '#0a1410',
    previewGradient: 'radial-gradient(ellipse at top left, #064e3b 0%, #0a1410 65%)',
    borderPreview: '#34d399',
    accentColor: '#6ee7b7',
    textColor: '#d1fae5',
    isDark: true,
  },
]

interface ThemeContextType {
  theme: ThemeType
  mode: ModeType
  setTheme: (theme: ThemeType) => void
  setMode: (mode: ModeType) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'clean-white',
  mode: 'light',
  setTheme: () => {},
  setMode: () => {},
})

export const useTheme = () => useContext(ThemeContext)

const VALID_THEMES: ThemeType[] = [
  'clean-white',
  'midnight',
  'aurora',
  'sunset',
  'emerald',
]

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>('clean-white')
  const [mode, setModeState] = useState<ModeType>('light')
  const pathname = usePathname()

  useEffect(() => {
    // If on /login or /signup, those pages manage forceCleanWhiteView()
    if (pathname === '/login' || pathname === '/signup') {
      return
    }

    // 1. Read from localStorage
    const storedTheme = localStorage.getItem('app-theme') as ThemeType | null
    const storedMode = localStorage.getItem('app-mode') as ModeType | null

    const initialTheme: ThemeType =
      storedTheme && VALID_THEMES.includes(storedTheme)
        ? storedTheme
        : (document.documentElement.dataset.theme as ThemeType) || 'clean-white'

    const initialMode: ModeType =
      storedMode && (storedMode === 'light' || storedMode === 'dark')
        ? storedMode
        : (document.documentElement.dataset.mode as ModeType) || 'light'

    const resolvedTheme = VALID_THEMES.includes(initialTheme) ? initialTheme : 'clean-white'
    const resolvedMode = initialMode === 'dark' ? 'dark' : 'light'

    setThemeState(resolvedTheme)
    setModeState(resolvedMode)

    document.documentElement.dataset.theme = resolvedTheme
    const effectiveMode = resolvedTheme === 'clean-white' ? resolvedMode : 'dark'
    document.documentElement.dataset.mode = effectiveMode

    if (effectiveMode === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // 2. Reconcile with Supabase user metadata once session exists
    try {
      const supabase = createClient()
      supabase.auth
        .getUser()
        .then(({ data: { user } }) => {
          if (!user) return

          const userTheme = user.user_metadata?.theme as ThemeType | undefined
          const userMode = user.user_metadata?.mode as ModeType | undefined

          let updatedTheme = resolvedTheme
          let updatedMode = resolvedMode
          let changed = false

          if (userTheme && VALID_THEMES.includes(userTheme) && userTheme !== storedTheme) {
            updatedTheme = userTheme
            setThemeState(userTheme)
            localStorage.setItem('app-theme', userTheme)
            document.documentElement.dataset.theme = userTheme
            changed = true
          } else if (!storedTheme && userTheme && VALID_THEMES.includes(userTheme)) {
            updatedTheme = userTheme
            setThemeState(userTheme)
            localStorage.setItem('app-theme', userTheme)
            document.documentElement.dataset.theme = userTheme
            changed = true
          }

          if (userMode && (userMode === 'light' || userMode === 'dark') && userMode !== storedMode) {
            updatedMode = userMode
            setModeState(userMode)
            localStorage.setItem('app-mode', userMode)
            changed = true
          } else if (!storedMode && userMode && (userMode === 'light' || userMode === 'dark')) {
            updatedMode = userMode
            setModeState(userMode)
            localStorage.setItem('app-mode', userMode)
            changed = true
          }

          if (changed) {
            const currentEffectiveMode =
              updatedTheme === 'clean-white' ? updatedMode : 'dark'
            document.documentElement.dataset.mode = currentEffectiveMode

            if (currentEffectiveMode === 'dark') {
              document.documentElement.classList.add('dark')
            } else {
              document.documentElement.classList.remove('dark')
            }
          }
        })
        .catch(() => {})
    } catch (e) {
      // Ignore background auth errors
    }
  }, [pathname])

  const setTheme = (newTheme: ThemeType) => {
    if (!VALID_THEMES.includes(newTheme)) return

    setThemeState(newTheme)
    document.documentElement.dataset.theme = newTheme
    localStorage.setItem('app-theme', newTheme)

    const effectiveMode = newTheme === 'clean-white' ? mode : 'dark'
    document.documentElement.dataset.mode = effectiveMode

    if (effectiveMode === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Fire-and-forget Supabase sync (only if user exists)
    try {
      const supabase = createClient()
      supabase.auth
        .getUser()
        .then(({ data: { user } }) => {
          if (user) {
            supabase.auth
              .updateUser({
                data: { theme: newTheme },
              })
              .catch(() => {})
          }
        })
        .catch(() => {})
    } catch (err) {
      // Ignore background sync errors
    }
  }

  const setMode = (newMode: ModeType) => {
    if (newMode !== 'light' && newMode !== 'dark') return

    setModeState(newMode)
    localStorage.setItem('app-mode', newMode)

    const isCurrentDOMCleanWhite =
      theme === 'clean-white' ||
      (typeof document !== 'undefined' &&
        document.documentElement.dataset.theme === 'clean-white')

    if (isCurrentDOMCleanWhite) {
      document.documentElement.dataset.mode = newMode
      if (newMode === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    // Fire-and-forget Supabase sync (only if user exists)
    try {
      const supabase = createClient()
      supabase.auth
        .getUser()
        .then(({ data: { user } }) => {
          if (user) {
            supabase.auth
              .updateUser({
                data: { mode: newMode },
              })
              .catch(() => {})
          }
        })
        .catch(() => {})
    } catch (err) {
      // Ignore background sync errors
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, mode, setTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

