'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { forceCleanWhiteView } from '@/lib/theme'
import AntigravityCanvas from '@/components/AntigravityCanvas'
import ThemeModeToggle from '@/components/ThemeModeToggle'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    forceCleanWhiteView()
  }, [])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setError(signUpError.message)
    } else {
      setMessage('Registration successful! Please check your email for confirmation.')
    }
    setLoading(false)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:py-12 sm:px-6 lg:px-8 text-[var(--text-primary)]">
      <AntigravityCanvas />

      <ThemeModeToggle className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10" />

      <div className="relative z-10 w-full max-w-md space-y-6 sm:space-y-8 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] backdrop-blur-md p-6 sm:p-8 shadow-lg transition-all duration-200">
        <div>
          <h2 className="text-center text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Create an account
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-[var(--text-secondary)]">
            Or{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 underline-offset-2 hover:underline"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <form className="mt-6 sm:mt-8 space-y-5 sm:space-y-6" onSubmit={handleSignup}>
          {error && (
            <div className="rounded-md bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-300 border border-red-500/20">
              {error}
            </div>
          )}

          {message && (
            <div className="rounded-md bg-green-500/10 p-4 text-sm text-green-700 dark:text-green-300 border border-green-500/20">
              {message}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs sm:text-sm font-medium text-[var(--text-primary)] mb-1"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border border-[var(--border-color)] bg-black/5 dark:bg-white/5 px-3 py-2 text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm transition-colors"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs sm:text-sm font-medium text-[var(--text-primary)] mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border border-[var(--border-color)] bg-black/5 dark:bg-white/5 px-3 py-2 text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-colors"
            >
              {loading ? 'Signing up...' : 'Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

