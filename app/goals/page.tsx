import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import { Goal } from '@/types/database'

export default async function GoalsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Fetch goals
  const { data: rawGoals, error: goalsError } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const goals: Goal[] = rawGoals ?? []

  // Fetch tasks to calculate progress if goal.progress is not explicitly set
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, goal_id, status')
    .eq('user_id', user.id)

  const getGoalProgress = (goal: Goal) => {
    if (typeof goal.progress === 'number' && !isNaN(goal.progress)) {
      return Math.min(100, Math.max(0, goal.progress))
    }

    const linkedTasks = tasks?.filter((t) => t.goal_id === goal.id) || []
    if (linkedTasks.length === 0) {
      return 0
    }

    const completed = linkedTasks.filter((t) => t.status === 'done').length
    return Math.round((completed / linkedTasks.length) * 100)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <Navbar userEmail={user.email} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-200 dark:border-zinc-800 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Goals
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Track and manage your long-term objectives
            </p>
          </div>
          <Link
            href="/goals/new"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            + New Goal
          </Link>
        </div>

        {goalsError && (
          <div className="mt-6 rounded-md bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950 dark:text-red-200 border border-red-200 dark:border-red-900">
            Error loading goals: {goalsError.message}
          </div>
        )}

        <div className="mt-6">
          {goals.length === 0 ? (
            <div className="text-center py-12 rounded-lg border-2 border-dashed border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                No goals yet
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by creating your first goal.
              </p>
              <div className="mt-6">
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
                const formattedDate = goal.target_date
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
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {goal.title}
                      </h2>
                      {goal.description && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
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

                      {/* Target Date */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-zinc-800/80 text-xs text-gray-500 dark:text-gray-400">
                        <span>Target Date:</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {formattedDate}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
