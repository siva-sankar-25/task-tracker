import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import { Task, Goal } from '@/types/database'

export default async function WeeklyReviewPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Calculate 7-day range (today minus 6 days through today)
  const now = new Date()
  const endOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  )
  const startOf7DaysAgo = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 6,
    0,
    0,
    0,
    0
  )

  const startDateIso = startOf7DaysAgo.toISOString().split('T')[0]
  const endDateIso = endOfToday.toISOString().split('T')[0]

  const dateRangeLabel = `${startOf7DaysAgo.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })} – ${endOfToday.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`

  // Fetch tasks and goals in parallel
  const [{ data: rawTasks, error: tasksError }, { data: rawGoals, error: goalsError }] =
    await Promise.all([
      supabase.from('tasks').select('*').eq('user_id', user.id),
      supabase.from('goals').select('*').eq('user_id', user.id),
    ])

  const tasks: Task[] = (rawTasks as Task[]) ?? []
  const goals: Goal[] = (rawGoals as Goal[]) ?? []

  const goalMap = new Map<string, string>()
  goals.forEach((g) => goalMap.set(g.id, g.title))

  // 1. "Completed this week": tasks where status = 'done' and updated_at (or created_at) falls in last 7 days
  const completedThisWeek = tasks.filter((t) => {
    if (t.status !== 'done') return false
    const dateStr = t.updated_at || t.created_at || t.due_date
    if (!dateStr) return false
    const d = new Date(dateStr)
    return d >= startOf7DaysAgo && d <= endOfToday
  })

  // 2. "Missed this week": tasks where due_date falls within last 7 days and status != 'done'
  const missedThisWeek = tasks.filter((t) => {
    if (t.status === 'done') return false
    if (!t.due_date) return false
    return t.due_date >= startDateIso && t.due_date <= endDateIso
  })

  // 3. "Completion rate": percentage = completed / (completed + missed)
  const totalRelevant = completedThisWeek.length + missedThisWeek.length
  const completionRate =
    totalRelevant > 0
      ? Math.round((completedThisWeek.length / totalRelevant) * 100)
      : null

  // 4. "Goals worked on": any goal that had at least one linked task completed this week
  const goalsWorkedOnIds = new Set(
    completedThisWeek
      .map((t) => t.goal_id)
      .filter((id): id is string => Boolean(id))
  )

  const goalsWorkedOn = goals.filter((g) => goalsWorkedOnIds.has(g.id))

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
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100">
      <Navbar userEmail={user.email} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Header Banner */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Weekly Review
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                A summary of your productivity, completed achievements, and milestones over the last 7 days.
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              <span>📅</span>
              <span>{dateRangeLabel}</span>
            </div>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Completion Rate Card */}
          <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
            <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Weekly Completion Rate
            </dt>
            <dd className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              {completionRate !== null ? `${completionRate}%` : '—'}
            </dd>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {completionRate !== null
                ? `${completedThisWeek.length} of ${totalRelevant} tasks completed`
                : 'No tasks due or completed this week'}
            </p>
          </div>

          {/* Completed Card */}
          <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
            <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Completed This Week
            </dt>
            <dd className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {completedThisWeek.length}
            </dd>
            <p className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-400/80">
              Tasks finished in last 7 days
            </p>
          </div>

          {/* Missed Card */}
          <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
            <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Missed This Week
            </dt>
            <dd className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-red-600 dark:text-red-400">
              {missedThisWeek.length}
            </dd>
            <p className="mt-1 text-xs text-red-700/80 dark:text-red-400/80">
              Past-due tasks pending resolution
            </p>
          </div>

          {/* Goals Worked On Card */}
          <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
            <dt className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Goals Advanced
            </dt>
            <dd className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-purple-600 dark:text-purple-400">
              {goalsWorkedOn.length}
            </dd>
            <p className="mt-1 text-xs text-purple-700/80 dark:text-purple-400/80">
              Milestones with completed tasks
            </p>
          </div>
        </div>

        {/* Section 1: Completed This Week */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Completed This Week
              </h2>
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {completedThisWeek.length}
              </span>
            </div>
          </div>

          {completedThisWeek.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 sm:p-8 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No tasks were marked as completed in the last 7 days.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
              <ul className="divide-y divide-gray-200 dark:divide-zinc-800">
                {completedThisWeek.map((task) => {
                  const goalTitle = task.goal_id ? goalMap.get(task.goal_id) : null
                  const dateStr = task.updated_at || task.created_at || task.due_date
                  const formattedDate = dateStr
                    ? new Date(dateStr).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : ''

                  return (
                    <li
                      key={task.id}
                      className="p-4 sm:p-5 transition-colors bg-emerald-50/20 dark:bg-emerald-950/10"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-300 text-xs font-bold">
                            ✓
                          </span>
                          <div className="min-w-0">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white break-words">
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="mt-0.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-1 break-words">
                                {task.description}
                              </p>
                            )}

                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                              {getPriorityBadge(task.priority)}

                              {goalTitle && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10 dark:bg-purple-950/50 dark:text-purple-300 dark:ring-purple-900">
                                  <span>🎯</span> {goalTitle}
                                </span>
                              )}

                              {formattedDate && (
                                <span className="text-gray-500 dark:text-gray-400">
                                  Completed {formattedDate}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <span className="inline-flex self-start sm:self-center items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                          Done
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </section>

        {/* Section 2: Missed This Week */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Missed This Week
              </h2>
              <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-950 dark:text-red-300">
                {missedThisWeek.length}
              </span>
            </div>
          </div>

          {missedThisWeek.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 sm:p-8 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                🎉 No missed deadlines this week!
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
              <ul className="divide-y divide-gray-200 dark:divide-zinc-800">
                {missedThisWeek.map((task) => {
                  const goalTitle = task.goal_id ? goalMap.get(task.goal_id) : null
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
                      className="p-4 sm:p-5 transition-colors bg-red-50/20 dark:bg-red-950/10"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/60 dark:text-red-300 text-xs font-bold">
                            !
                          </span>
                          <div className="min-w-0">
                            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white break-words">
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="mt-0.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-1 break-words">
                                {task.description}
                              </p>
                            )}

                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                              {getPriorityBadge(task.priority)}

                              {goalTitle && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10 dark:bg-purple-950/50 dark:text-purple-300 dark:ring-purple-900">
                                  <span>🎯</span> {goalTitle}
                                </span>
                              )}

                              {formattedDueDate && (
                                <span className="text-red-600 dark:text-red-400 font-medium">
                                  Due {formattedDueDate}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <span className="inline-flex self-start sm:self-center items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
                          {task.status === 'in_progress' ? 'In Progress' : 'Pending'}
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </section>

        {/* Section 3: Goals Worked On */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                Goals Worked On
              </h2>
              <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                {goalsWorkedOn.length}
              </span>
            </div>
            <Link
              href="/goals"
              className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              View all goals →
            </Link>
          </div>

          {goalsWorkedOn.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 sm:p-8 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No goals had completed tasks this week.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {goalsWorkedOn.map((goal) => {
                const progress = getGoalProgress(goal)
                const completedForGoalCount = completedThisWeek.filter(
                  (t) => t.goal_id === goal.id
                ).length
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
                    className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-words">
                          {goal.title}
                        </h3>
                        <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
                          +{completedForGoalCount} this week
                        </span>
                      </div>
                      {goal.description && (
                        <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 break-words">
                          {goal.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 space-y-4">
                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-zinc-800 overflow-hidden">
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

                      {/* Target Date */}
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
