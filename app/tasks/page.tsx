import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import TaskCheckbox from '@/components/TaskCheckbox'
import TaskFilters from '@/components/TaskFilters'
import TaskDeleteButton from '@/components/TaskDeleteButton'
import { getDisplayName } from '@/lib/getDisplayName'
import { Task, Goal } from '@/types/database'

interface TasksPageProps {
  searchParams: Promise<{
    status?: string
    priority?: string
    sort?: string
  }>
}

export default async function TasksPage(props: TasksPageProps) {
  const searchParams = await props.searchParams
  const statusFilter = searchParams.status || 'all'
  const priorityFilter = searchParams.priority || 'all'
  const sortBy = searchParams.sort || 'due_date'

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const displayName = getDisplayName(user)

  // Build Supabase query with filters
  let tasksQuery = supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)

  if (statusFilter !== 'all') {
    tasksQuery = tasksQuery.eq('status', statusFilter)
  }

  if (priorityFilter !== 'all') {
    tasksQuery = tasksQuery.eq('priority', priorityFilter)
  }

  const [{ data: rawTasks, error: tasksError }, { data: rawGoals }] =
    await Promise.all([
      tasksQuery,
      supabase.from('goals').select('id, title').eq('user_id', user.id),
    ])

  const tasks: Task[] = (rawTasks as Task[]) ?? []
  const goals: { id: string; title: string }[] =
    (rawGoals as { id: string; title: string }[]) ?? []

  const goalMap = new Map<string, string>()
  goals.forEach((g) => goalMap.set(g.id, g.title))

  // Sort tasks in memory to ensure consistent priority/date handling
  const priorityWeight: Record<string, number> = {
    high: 3,
    medium: 2,
    low: 1,
  }

  tasks.sort((a, b) => {
    if (sortBy === 'priority') {
      const pA = priorityWeight[(a.priority || '').toLowerCase()] || 0
      const pB = priorityWeight[(b.priority || '').toLowerCase()] || 0
      if (pA !== pB) return pB - pA // High to low

      // Secondary sort by due date
      if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date)
      if (a.due_date) return -1
      if (b.due_date) return 1
      return 0
    }

    // Default: Sort by due_date ascending, with non-null dates first
    if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date)
    if (a.due_date) return -1
    if (b.due_date) return 1
    return (b.created_at || '').localeCompare(a.created_at || '')
  })

  // Color-coded priority tags: low = gray, medium = yellow, high = red
  const getPriorityBadge = (priority: string) => {
    const p = (priority || '').toLowerCase()
    if (p === 'high') {
      return (
        <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-950/60 dark:text-red-300 dark:ring-red-900">
          High
        </span>
      )
    }
    if (p === 'medium') {
      return (
        <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/30 dark:bg-yellow-950/60 dark:text-yellow-300 dark:ring-yellow-900">
          Medium
        </span>
      )
    }
    return (
      <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-500/20 dark:bg-zinc-800 dark:text-gray-300 dark:ring-zinc-700">
        Low
      </span>
    )
  }

  const isFiltered =
    statusFilter !== 'all' || priorityFilter !== 'all' || sortBy !== 'due_date'

  return (
    <div className="min-h-screen text-[var(--text-primary)]">
      <Navbar userName={displayName} userEmail={user.email} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 sm:pb-6 border-b border-[var(--border-color)] gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Tasks
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
              Manage your tasks, filter by status and priority, and track progress.
            </p>
          </div>
          <Link
            href="/tasks/new"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm self-start sm:self-auto cursor-pointer"
          >
            + New Task
          </Link>
        </div>

        {tasksError && (
          <div className="rounded-md bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-300 border border-red-500/20">
            Error loading tasks: {tasksError.message}
          </div>
        )}

        {/* Filter & Sort Controls */}
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] backdrop-blur-md p-4 shadow-xs transition-colors">
          <TaskFilters
            currentStatus={statusFilter}
            currentPriority={priorityFilter}
            currentSort={sortBy}
          />
        </div>

        <div>
          {tasks.length === 0 ? (
            <div className="text-center py-12 rounded-xl border-2 border-dashed border-[var(--border-color)] bg-[var(--card-bg)] backdrop-blur-md p-6 sm:p-8 transition-colors">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                {isFiltered ? 'No matching tasks' : 'No tasks yet'}
              </h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {isFiltered
                  ? 'Try adjusting your filters or sort options.'
                  : 'You have not added any tasks yet. Create one to get started.'}
              </p>
              <div className="mt-6 flex justify-center gap-3">
                {isFiltered ? (
                  <Link
                    href="/tasks"
                    className="inline-flex items-center rounded-md border border-[var(--border-color)] bg-black/5 dark:bg-white/5 px-3.5 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xs cursor-pointer"
                  >
                    Clear Filters
                  </Link>
                ) : (
                  <Link
                    href="/tasks/new"
                    className="inline-flex items-center rounded-md bg-blue-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xs cursor-pointer"
                  >
                    Create Task
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] backdrop-blur-md shadow-xs transition-colors">
              <ul className="divide-y divide-[var(--border-color)]">
                {tasks.map((task) => {
                  const goalTitle = task.goal_id
                    ? goalMap.get(task.goal_id)
                    : null
                  const formattedDueDate = task.due_date
                    ? new Date(task.due_date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : null
                  const isDone = task.status === 'done'

                  return (
                    <li
                      key={task.id}
                      className={`p-4 sm:p-5 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xs ${
                        isDone
                          ? 'bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                          : 'hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <TaskCheckbox
                          taskId={task.id}
                          initialStatus={task.status}
                          taskTitle={task.title}
                        >
                          {task.description && (
                            <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)] break-words">
                              {task.description}
                            </p>
                          )}

                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                            {/* In progress badge */}
                            {task.status === 'in_progress' && (
                              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-900">
                                In Progress
                              </span>
                            )}

                            {/* Color-coded priority tag */}
                            {getPriorityBadge(task.priority)}

                            {/* Goal badge */}
                            {goalTitle && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10 dark:bg-purple-950/50 dark:text-purple-300 dark:ring-purple-900">
                                <span>🎯</span> {goalTitle}
                              </span>
                            )}

                            {/* Due date */}
                            {formattedDueDate && (
                              <span className="inline-flex items-center gap-1 text-[var(--text-secondary)]">
                                <span>📅</span> Due {formattedDueDate}
                              </span>
                            )}
                          </div>
                        </TaskCheckbox>

                        {/* Actions (Edit & Delete) */}
                        <div className="flex items-center self-end sm:self-center gap-1 sm:gap-2 shrink-0">
                          <Link
                            href={`/tasks/${task.id}/edit`}
                            className="inline-flex items-center justify-center rounded-md p-1.5 text-[var(--text-secondary)] hover:text-blue-600 hover:bg-blue-500/10 transition-all duration-200 ease-out hover:-translate-y-0.5"
                            title="Edit task"
                            aria-label={`Edit task ${task.title}`}
                          >
                            <svg
                              className="h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                              />
                            </svg>
                          </Link>
                          <TaskDeleteButton
                            taskId={task.id}
                            taskTitle={task.title}
                          />
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

