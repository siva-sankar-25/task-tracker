import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import TaskStatusControl from '@/components/TaskStatusControl'
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
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <Navbar userEmail={user.email} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Welcome Banner */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Welcome, {user.email}
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Here is an overview of your agenda for today and goal progression.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/tasks/new"
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3.5 py-2 text-sm font-medium text-white shadow-xs hover:bg-blue-700 transition-colors"
              >
                + New Task
              </Link>
              <Link
                href="/goals/new"
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-200 dark:hover:bg-zinc-700 transition-colors"
              >
                + New Goal
              </Link>
            </div>
          </div>
        </div>

        {/* Section 1: Today & Overdue */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
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
              className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              View all tasks →
            </Link>
          </div>

          {todayAndOverdueTasks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="text-3xl mb-2">🎉</div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Nothing due — nice!
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                You are all caught up with your deadlines for today.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <ul className="divide-y divide-gray-200 dark:divide-zinc-800">
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
                      className="p-4 transition-colors hover:bg-gray-50/50 dark:hover:bg-zinc-800/30"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="pt-0.5">
                            <TaskStatusControl
                              taskId={task.id}
                              initialStatus={task.status}
                            />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                              {/* Overdue/Today badge */}
                              <span
                                className={`inline-flex items-center rounded-md px-2 py-0.5 font-medium ${
                                  isOverdue
                                    ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-semibold'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                }`}
                              >
                                {isOverdue ? `⚠️ Overdue (${formattedDueDate})` : `📅 Due Today`}
                              </span>

                              {/* Priority tag */}
                              {getPriorityBadge(task.priority)}

                              {/* Goal */}
                              {goalTitle && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10 dark:bg-purple-950/50 dark:text-purple-300 dark:ring-purple-900">
                                  <span>🎯</span> {goalTitle}
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
        </section>

        {/* Section 2: Goals progress */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Goals Progress
            </h2>
            <Link
              href="/goals"
              className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              View all goals →
            </Link>
          </div>

          {goals.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                No goals yet
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Create a goal to start tracking progress on your milestones.
              </p>
              <div className="mt-4">
                <Link
                  href="/goals/new"
                  className="inline-flex items-center rounded-md bg-blue-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  Create Goal
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                    className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-6 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {goal.title}
                      </h3>
                      {goal.description && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {goal.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-zinc-700 overflow-hidden">
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

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-800 text-xs text-gray-500 dark:text-gray-400">
                        <span>Target Date:</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
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
  )
}
