import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import TaskCheckbox from '@/components/TaskCheckbox'
import NotificationReminder from '@/components/NotificationReminder'
import AntigravityCanvas from '@/components/AntigravityCanvas'
import { getDisplayName } from '@/lib/getDisplayName'
import { Task, Goal } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const displayName = getDisplayName(user)

  // Fetch tasks and goals in parallel
  const [{ data: rawTasks }, { data: rawGoals }] = await Promise.all([
    supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id),
    supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  const tasks: Task[] = (rawTasks as Task[]) ?? []
  const goals: Goal[] = (rawGoals as Goal[]) ?? []

  const goalMap = new Map<string, string>()
  goals.forEach((g) => goalMap.set(g.id, g.title))

  // Today's date string in YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0]

  // Filter tasks where due_date <= today and status != 'done'
  const todayAndOverdueTasks = tasks
    .filter((t) => t.due_date && t.due_date <= today && t.status !== 'done')
    .sort((a, b) => (a.due_date || '').localeCompare(b.due_date || ''))

  const overdueCount = todayAndOverdueTasks.filter(
    (t) => t.due_date && t.due_date < today
  ).length
  const dueTodayCount = todayAndOverdueTasks.filter(
    (t) => t.due_date && t.due_date === today
  ).length

  // Helper for goal progress calculation
  const getGoalProgress = (goal: Goal) => {
    if (typeof goal.progress === 'number' && !isNaN(goal.progress)) {
      return Math.min(100, Math.max(0, goal.progress))
    }
    const linkedTasks = tasks.filter((t) => t.goal_id === goal.id)
    if (linkedTasks.length === 0) return 0
    const completed = linkedTasks.filter((t) => t.status === 'done').length
    return Math.round((completed / linkedTasks.length) * 100)
  }

  // Priority badge styling
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

  return (
    <div className="relative min-h-screen text-[var(--text-primary)]">
      <AntigravityCanvas opacity={0.3} />
      <div className="relative z-10">
        <Navbar userName={displayName} userEmail={user.email} />

        <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        {/* Welcome Banner */}
        <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] backdrop-blur-md p-5 sm:p-6 shadow-xs transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                Welcome, {displayName}
              </h1>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Track your agenda for today, overdue tasks, and milestone progression.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Link
                href="/tasks/new"
                className="inline-flex flex-1 sm:flex-none items-center justify-center rounded-md bg-blue-600 px-3.5 py-2 text-sm font-medium text-white shadow-xs hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm"
              >
                + New Task
              </Link>
              <Link
                href="/goals/new"
                className="inline-flex flex-1 sm:flex-none items-center justify-center rounded-md border border-[var(--border-color)] bg-black/5 dark:bg-white/5 px-3.5 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xs"
              >
                + New Goal
              </Link>
            </div>
          </div>
        </div>

        {/* Highlighted Reminder Banner for Due/Overdue Tasks */}
        {todayAndOverdueTasks.length > 0 && (
          <div className="relative overflow-hidden rounded-xl border border-amber-300 bg-gradient-to-r from-amber-500/15 via-red-500/10 to-amber-500/15 p-4 sm:p-5 shadow-xs dark:border-amber-700/50 dark:from-amber-950/50 dark:via-red-950/30 dark:to-zinc-900">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-lg dark:bg-amber-500/30">
                  ⚡
                </span>
                <div>
                  <h3 className="text-base font-bold text-amber-950 dark:text-amber-200">
                    {todayAndOverdueTasks.length}{' '}
                    {todayAndOverdueTasks.length === 1
                      ? 'task needs attention'
                      : 'tasks need attention'}
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-900/80 dark:text-amber-300/80">
                    {overdueCount > 0 && `${overdueCount} overdue`}
                    {overdueCount > 0 && dueTodayCount > 0 && ' • '}
                    {dueTodayCount > 0 && `${dueTodayCount} due today`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-center">
                <NotificationReminder
                  dueTasksCount={todayAndOverdueTasks.length}
                  overdueCount={overdueCount}
                  dueTodayCount={dueTodayCount}
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 1: Today & Overdue */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
                Today & Overdue
              </h2>
              {todayAndOverdueTasks.length > 0 && (
                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-950 dark:text-red-300">
                  {todayAndOverdueTasks.length}
                </span>
              )}
            </div>
            <Link
              href="/tasks"
              className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors"
            >
              View all tasks →
            </Link>
          </div>

          {todayAndOverdueTasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--card-bg)] backdrop-blur-md p-6 sm:p-8 text-center shadow-xs transition-colors">
              <div className="text-3xl mb-2">🎉</div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                Nothing due — nice!
              </h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                You are all caught up with your deadlines for today.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] backdrop-blur-md shadow-xs transition-colors">
              <ul className="divide-y divide-[var(--border-color)]">
                {todayAndOverdueTasks.map((task) => {
                  const goalTitle = task.goal_id
                    ? goalMap.get(task.goal_id)
                    : null
                  const isOverdue = task.due_date ? task.due_date < today : false
                  const formattedDueDate = task.due_date
                    ? new Date(task.due_date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : ''

                  return (
                    <li
                      key={task.id}
                      className="p-4 sm:p-5 transition-all duration-200 ease-out hover:bg-black/5 dark:hover:bg-white/5 hover:-translate-y-0.5 hover:shadow-xs"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <TaskCheckbox
                          taskId={task.id}
                          initialStatus={task.status}
                          taskTitle={task.title}
                        >
                          {task.description && (
                            <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2 break-words">
                              {task.description}
                            </p>
                          )}
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                            {/* Overdue/Today badge */}
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-0.5 font-medium ${
                                isOverdue
                                  ? 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 font-semibold'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                              }`}
                            >
                              {isOverdue
                                ? `⚠️ Overdue (${formattedDueDate})`
                                : `📅 Due Today`}
                            </span>

                            {/* In progress status badge if relevant */}
                            {task.status === 'in_progress' && (
                              <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-900">
                                In Progress
                              </span>
                            )}

                            {/* Priority tag */}
                            {getPriorityBadge(task.priority)}

                            {/* Goal */}
                            {goalTitle && (
                              <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10 dark:bg-purple-950/50 dark:text-purple-300 dark:ring-purple-900">
                                <span>🎯</span> {goalTitle}
                              </span>
                            )}
                          </div>
                        </TaskCheckbox>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </section>

        {/* Section 2: Goals progress */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
              Goals Progress
            </h2>
            <Link
              href="/goals"
              className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors"
            >
              View all goals →
            </Link>
          </div>

          {goals.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--card-bg)] backdrop-blur-md p-6 sm:p-8 text-center shadow-xs transition-colors">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                No goals yet
              </h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Create a goal to start tracking progress on your milestones.
              </p>
              <div className="mt-4">
                <Link
                  href="/goals/new"
                  className="inline-flex items-center rounded-md bg-blue-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xs cursor-pointer"
                >
                  Create Goal
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {goals.map((goal) => {
                const progress = getGoalProgress(goal)
                const formattedTargetDate = goal.target_date
                  ? new Date(goal.target_date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'No target date'

                return (
                  <div
                    key={goal.id}
                    className="flex flex-col justify-between rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] backdrop-blur-md p-5 sm:p-6 shadow-xs transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] break-words">
                        {goal.title}
                      </h3>
                      {goal.description && (
                        <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2 break-words">
                          {goal.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-medium text-[var(--text-secondary)] mb-1.5">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-300 ${
                              progress === 100
                                ? 'bg-emerald-500'
                                : progress > 50
                                ? 'bg-blue-600'
                                : 'bg-blue-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
                        <span>Target Date:</span>
                        <span className="font-medium text-[var(--text-primary)]">
                          {formattedTargetDate}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>
      </div>
    </div>
  )
}

