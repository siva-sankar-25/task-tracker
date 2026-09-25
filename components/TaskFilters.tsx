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
    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4 py-1">
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
        {/* Status Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <label
            htmlFor="status-filter"
            className="text-xs font-semibold text-[var(--text-primary)]"
          >
            Status:
          </label>
          <select
            id="status-filter"
            value={currentStatus}
            onChange={(e) => updateParam('status', e.target.value)}
            disabled={isPending}
            className="w-full sm:w-auto rounded-md border border-[var(--border-color)] bg-[var(--card-bg)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          >
            <option value="all">All</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <label
            htmlFor="priority-filter"
            className="text-xs font-semibold text-[var(--text-primary)]"
          >
            Priority:
          </label>
          <select
            id="priority-filter"
            value={currentPriority}
            onChange={(e) => updateParam('priority', e.target.value)}
            disabled={isPending}
            className="w-full sm:w-auto rounded-md border border-[var(--border-color)] bg-[var(--card-bg)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          >
            <option value="all">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Sort Control */}
        <div className="col-span-2 sm:col-auto flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <label
            htmlFor="sort-control"
            className="text-xs font-semibold text-[var(--text-primary)]"
          >
            Sort by:
          </label>
          <select
            id="sort-control"
            value={currentSort || 'due_date'}
            onChange={(e) => updateParam('sort', e.target.value)}
            disabled={isPending}
            className="w-full sm:w-auto rounded-md border border-[var(--border-color)] bg-[var(--card-bg)] px-2.5 py-1.5 text-xs text-[var(--text-primary)] focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          >
            <option value="due_date">Due Date</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      </div>

      {/* Reset & Loading indicators */}
      <div className="flex items-center justify-between sm:justify-start gap-3 pt-1 sm:pt-0">
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
          <span className="text-xs text-[var(--text-secondary)] animate-pulse">
            Filtering...
          </span>
        )}
      </div>
    </div>
  )
}

