'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function PasswordSettingsForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both fields are identical.')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) {
        setError(updateError.message)
      } else {
        setMessage('Password updated successfully!')
        setPassword('')
        setConfirmPassword('')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div className="rounded-md bg-green-500/10 p-3.5 text-xs sm:text-sm text-green-700 dark:text-green-300 border border-green-500/20">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-500/10 p-3.5 text-xs sm:text-sm text-red-600 dark:text-red-300 border border-red-500/20">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="new-password"
            className="block text-xs sm:text-sm font-medium text-[var(--text-primary)] mb-1"
          >
            New Password
          </label>
          <input
            id="new-password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="block w-full rounded-md border border-[var(--border-color)] bg-black/5 dark:bg-white/5 px-3 py-2 text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="block text-xs sm:text-sm font-medium text-[var(--text-primary)] mb-1"
          >
            Confirm New Password
          </label>
          <input
            id="confirm-password"
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="block w-full rounded-md border border-[var(--border-color)] bg-black/5 dark:bg-white/5 px-3 py-2 text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm transition-colors"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading || !password}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-out hover:-translate-y-0.5 shadow-xs cursor-pointer"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </form>
  )
}

