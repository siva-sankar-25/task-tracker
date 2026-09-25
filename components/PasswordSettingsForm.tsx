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
        <div className="rounded-md bg-green-50 p-3.5 text-xs sm:text-sm text-green-700 dark:bg-green-950/70 dark:text-green-200 border border-green-200 dark:border-green-900">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-3.5 text-xs sm:text-sm text-red-700 dark:bg-red-950/70 dark:text-red-200 border border-red-200 dark:border-red-900">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="new-password"
            className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
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
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-500 transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
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
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-500 transition-colors"
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
