'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import { getDisplayName } from '@/lib/getDisplayName'

export default function NewGoalPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          setUserEmail(user.email ?? null)
          setUserName(getDisplayName(user))
        }
      } catch (err) {
        console.error('Failed to load user:', err)
      }
    }
    loadUser()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        router.push('/login')
        return
      }

      const { error: insertError } = await supabase.from('goals').insert({
        title: title.trim(),
        description: description.trim() || null,
        target_date: targetDate || null,
        user_id: user.id,
      })

      if (insertError) {
        setError(insertError.message)
        setLoading(false)
      } else {
        router.push('/goals')
        router.refresh()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen text-[var(--text-primary)]">
      <Navbar userName={userName} userEmail={userEmail} />

      <main className="mx-auto max-w-2xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Create New Goal
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
              Set a new target milestone and track your achievements.
            </p>
          </div>
          <Link
            href="/goals"
            className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors self-start sm:self-auto"
          >
            ← Back to Goals
          </Link>
        </div>

        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] backdrop-blur-md p-5 sm:p-6 shadow-xs transition-colors">
          {error && (
            <div className="mb-6 rounded-md bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-300 border border-red-500/20">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-xs sm:text-sm font-medium text-[var(--text-primary)] mb-1"
              >
                Goal Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Learn TypeScript, Launch MVP"
                className="block w-full rounded-md border border-[var(--border-color)] bg-black/5 dark:bg-white/5 px-3 py-2 text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-xs sm:text-sm font-medium text-[var(--text-primary)] mb-1"
              >
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your goal and why it matters..."
                className="block w-full rounded-md border border-[var(--border-color)] bg-black/5 dark:bg-white/5 px-3 py-2 text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="target_date"
                className="block text-xs sm:text-sm font-medium text-[var(--text-primary)] mb-1"
              >
                Target Date (Optional)
              </label>
              <input
                id="target_date"
                name="target_date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="block w-full rounded-md border border-[var(--border-color)] bg-black/5 dark:bg-white/5 px-3 py-2 text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm transition-colors"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
              <Link
                href="/goals"
                className="inline-flex justify-center rounded-md border border-[var(--border-color)] bg-black/5 dark:bg-white/5 px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xs"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xs cursor-pointer"
              >
                {loading ? 'Creating...' : 'Create Goal'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

