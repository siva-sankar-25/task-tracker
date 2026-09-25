'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface ProfileSettingsFormProps {
  initialFullName: string
}

export default function ProfileSettingsForm({
  initialFullName,
}: ProfileSettingsFormProps) {
  const router = useRouter()
  const [fullName, setFullName] = useState(initialFullName || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({
        data: { full_name: fullName.trim() },
      })

      if (updateError) {
        setError(updateError.message)
      } else {
        setMessage('Display name updated successfully!')
        router.refresh()
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

      <div>
        <label
          htmlFor="display-name"
          className="block text-xs sm:text-sm font-medium text-[var(--text-primary)] mb-1"
        >
          Display Name
        </label>
        <input
          id="display-name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. Alex Morgan"
          className="block w-full rounded-md border border-[var(--border-color)] bg-black/5 dark:bg-white/5 px-3 py-2 text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm transition-colors"
        />
        <p className="mt-1 text-[11px] sm:text-xs text-[var(--text-secondary)]">
          This name will be displayed in the header and dashboard welcome greeting.
        </p>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-xs sm:text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-out hover:-translate-y-0.5 shadow-xs cursor-pointer"
        >
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </form>
  )
}

