import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import TaskStatusControl from '@/components/TaskStatusControl'
import TaskFilters from '@/components/TaskFilters'
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
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <Navbar userEmail={user.email} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-200 dark:border-zinc-800 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Tasks
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage your tasks, filter by status and priority, and track progress.
            </p>
          </div>
          <Link
            href="/tasks/new"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            + New Task
          </Link>
        </div>

        {tasksError && (
          <div className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950 dark:text-red-200 border border-red-200 dark:border-red-900">
            Error loading tasks: {tasksError.message}
          </div>
        )}

        {/* Filter & Sort Controls */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <TaskFilters
            currentStatus={statusFilter}
            currentPriority={priorityFilter}
            currentSort={sortBy}
          />
        </div>

        <div className="mt-6">
          {tasks.length === 0 ? (
            <div className="text-center py-12 rounded-lg border-2 border-dashed border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {isFiltered ? 'No matching tasks' : 'No tasks yet'}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {isFiltered
                  ? 'Try adjusting your filters or sort options.'
                  : 'You have not added any tasks yet. Create one to get started.'}
              </p>
              <div className="mt-6 flex justify-center gap-3">
                {isFiltered ? (
                  <Link
                    href="/tasks"
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-200 transition-colors"
                  >
                    Clear Filters
                  </Link>
                ) : (
                  <Link
                    href="/tasks/new"
                    className="inline-flex items-center rounded-md bg-blue-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    Create Task
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <ul className="divide-y divide-gray-200 dark:divide-zinc-800">
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
                      className={`p-4 sm:p-6 transition-colors ${
                        isDone
                          ? 'bg-gray-50/70 dark:bg-zinc-900/40'
                          : 'hover:bg-gray-50/50 dark:hover:bg-zinc-800/30'
                      }`}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="pt-0.5">
                            <TaskStatusControl
                              taskId={task.id}
                              initialStatus={task.status}
                            />
                          </div>
                          <div>
                            <h2
                              className={`text-base font-semibold ${
                                isDone
                                  ? 'line-through text-gray-400 dark:text-zinc-500'
                                  : 'text-gray-900 dark:text-white'
                              }`}
                            >
                              {task.title}
                            </h2>
                            {task.description && (
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {task.description}
                              </p>
                            )}

                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
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
                                <span className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                  <span>📅</span> Due {formattedDueDate}
                                </span>
                              )}
                            </div>
                          </div>
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
