'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import { getDisplayName } from '@/lib/getDisplayName'

export default function NewTaskPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('medium')
  const [goalId, setGoalId] = useState('')
  const [goals, setGoals] = useState<{ id: string; title: string }[]>([])
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [loadingGoals, setLoadingGoals] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          setUserEmail(user.email ?? null)
          setUserName(getDisplayName(user))
        }

        const { data, error } = await supabase
          .from('goals')
          .select('id, title')
          .order('title', { ascending: true })

        if (!error && data) {
          setGoals(data as { id: string; title: string }[])
        }
      } catch (err) {
        console.error('Failed to load initial data:', err)
      } finally {
        setLoadingGoals(false)
      }
    }
    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

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

      const { error: insertError } = await supabase.from('tasks').insert({
        title: title.trim(),
        description: description.trim() || null,
        due_date: dueDate || null,
        priority: priority || 'medium',
        status: 'todo',
        goal_id: goalId ? goalId : null,
        user_id: user.id,
      })

      if (insertError) {
        setError(insertError.message)
        setSubmitting(false)
      } else {
        router.push('/tasks')
        router.refresh()
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100">
      <Navbar userName={userName} userEmail={userEmail} />

      <main className="mx-auto max-w-2xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Create New Task
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Add a new task, assign a priority, and link to a milestone goal.
            </p>
          </div>
          <Link
            href="/tasks"
            className="text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors self-start sm:self-auto"
          >
            ← Back to Tasks
          </Link>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/80 dark:text-red-200 border border-red-200 dark:border-red-900">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Set up database schema, Review PR"
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-500 transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Description (Optional)
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details about what needs to be done..."
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="due_date"
                  className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Due Date (Optional)
                </label>
                <input
                  id="due_date"
                  name="due_date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder-zinc-500 transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="priority"
                  className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white transition-colors"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="goal"
                className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Linked Goal (Optional)
              </label>
              <select
                id="goal"
                name="goal"
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                disabled={loadingGoals}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white disabled:opacity-50 transition-colors"
              >
                <option value="">None (No Goal)</option>
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title}
                  </option>
                ))}
              </select>
              {loadingGoals && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Loading goals...</p>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
              <Link
                href="/tasks"
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xs"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting || !title.trim()}
                className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xs cursor-pointer"
              >
                {submitting ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
