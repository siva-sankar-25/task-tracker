'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'

interface TaskFiltersProps {
  currentStatus: string
  currentPriority: string
  currentSort: string
}

export default function TaskFilters({
  currentStatus,
  currentPriority,
  currentSort,
}: TaskFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    startTransition(() => {
      const qs = params.toString()
      router.push(qs ? `${pathname}?${qs}` : pathname)
    })
  }

  const resetFilters = () => {
    startTransition(() => {
      router.push(pathname)
    })
  }

  const hasActiveFilters =
    currentStatus !== 'all' ||
    currentPriority !== 'all' ||
    (currentSort !== 'due_date' && currentSort !== '')

  return (
    <div className="flex flex-wrap items-center gap-4 py-2">
      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="status-filter"
          className="text-xs font-medium text-gray-700 dark:text-gray-300"
        >
          Status:
        </label>
        <select
          id="status-filter"
          value={currentStatus}
          onChange={(e) => updateParam('status', e.target.value)}
          disabled={isPending}
          className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        >
          <option value="all">All</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      {/* Priority Filter */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="priority-filter"
          className="text-xs font-medium text-gray-700 dark:text-gray-300"
        >
          Priority:
        </label>
        <select
          id="priority-filter"
          value={currentPriority}
          onChange={(e) => updateParam('priority', e.target.value)}
          disabled={isPending}
          className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        >
          <option value="all">All</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Sort Control */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="sort-control"
          className="text-xs font-medium text-gray-700 dark:text-gray-300"
        >
          Sort by:
        </label>
        <select
          id="sort-control"
          value={currentSort || 'due_date'}
          onChange={(e) => updateParam('sort', e.target.value)}
          disabled={isPending}
          className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        >
          <option value="due_date">Due Date</option>
          <option value="priority">Priority</option>
        </select>
      </div>

      {/* Reset Link */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={resetFilters}
          disabled={isPending}
          className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline cursor-pointer"
        >
          Reset filters
        </button>
      )}

      {isPending && (
        <span className="text-xs text-gray-400 dark:text-zinc-500 animate-pulse">
          Filtering...
        </span>
      )}
    </div>
  )
}
