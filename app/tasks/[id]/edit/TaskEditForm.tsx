'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Task } from '@/types/database'

interface TaskEditFormProps {
  task: Task
  goals: { id: string; title: string }[]
}

export default function TaskEditForm({ task, goals }: TaskEditFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(task.title || '')
  const [description, setDescription] = useState(task.description || '')
  const [dueDate, setDueDate] = useState(task.due_date || '')
  const [priority, setPriority] = useState(task.priority || 'medium')
  const [status, setStatus] = useState(task.status || 'todo')
  const [goalId, setGoalId] = useState(task.goal_id || '')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('tasks')
        .update({
          title: title.trim(),
          description: description.trim() || null,
          due_date: dueDate || null,
          priority: priority || 'medium',
          status: status || 'todo',
          goal_id: goalId ? goalId : null,
        })
        .eq('id', task.id)

      if (updateError) {
        setError(updateError.message)
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
            placeholder="e.g., Update documentation"
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

        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-3">
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

          <div>
            <label
              htmlFor="status"
              className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white transition-colors"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
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
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white transition-colors"
          >
            <option value="">None (No Goal)</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
          <Link
            href="/tasks"
            className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700 transition-colors"
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
