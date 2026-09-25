'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Goal } from '@/types/database'

interface GoalEditFormProps {
  goal: Goal
}

export default function GoalEditForm({ goal }: GoalEditFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(goal.title || '')
  const [description, setDescription] = useState(goal.description || '')
  const [targetDate, setTargetDate] = useState(goal.target_date || '')
  const [progress, setProgress] = useState(
    typeof goal.progress === 'number' ? String(goal.progress) : '0'
  )
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const supabase = createClient()
      const numericProgress =
        progress !== '' ? Math.min(100, Math.max(0, parseInt(progress, 10) || 0)) : null

      const { error: updateError } = await supabase
        .from('goals')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          target_date: targetDate || null,
          progress: numericProgress,
        })
        .eq('id', goal.id)

      if (updateError) {
        setError(updateError.message)
        setSubmitting(false)
      } else {
        router.push('/goals')
        router.refresh()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setSubmitting(false)
    }
  }

  return (
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
            placeholder="Describe your goal and milestones..."
            className="block w-full rounded-md border border-[var(--border-color)] bg-black/5 dark:bg-white/5 px-3 py-2 text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
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

          <div>
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="progress"
                className="block text-xs sm:text-sm font-medium text-[var(--text-primary)]"
              >
                Progress (%)
              </label>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                {progress || '0'}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="progress-range"
                type="range"
                min="0"
                max="100"
                value={progress || '0'}
                onChange={(e) => setProgress(e.target.value)}
                className="w-full accent-blue-600 dark:accent-blue-500 cursor-pointer"
              />
              <input
                id="progress"
                name="progress"
                type="number"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                className="w-18 rounded-md border border-[var(--border-color)] bg-black/5 dark:bg-white/5 px-2 py-1 text-center text-xs sm:text-sm text-[var(--text-primary)] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-3 pt-4 border-t border-[var(--border-color)]">
          <Link
            href="/goals"
            className="inline-flex justify-center rounded-md border border-[var(--border-color)] bg-black/5 dark:bg-white/5 px-4 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || !title.trim()}
            className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Saving changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

