import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import GoalDeleteButton from '@/components/GoalDeleteButton'
import { getDisplayName } from '@/lib/getDisplayName'
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

  const displayName = getDisplayName(user)

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
    <div className="min-h-screen text-[var(--text-primary)]">
      <Navbar userName={displayName} userEmail={user.email} />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 sm:pb-6 border-b border-[var(--border-color)] gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Goals
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
              Track and manage your long-term milestones and objectives.
            </p>
          </div>
          <Link
            href="/goals/new"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-sm self-start sm:self-auto cursor-pointer"
          >
            + New Goal
          </Link>
        </div>

        {goalsError && (
          <div className="rounded-md bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-300 border border-red-500/20">
            Error loading goals: {goalsError.message}
          </div>
        )}

        <div>
          {goals.length === 0 ? (
            <div className="text-center py-12 rounded-xl border-2 border-dashed border-[var(--border-color)] bg-[var(--card-bg)] backdrop-blur-md p-6 sm:p-8 transition-colors">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                No goals yet
              </h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Get started by creating your first goal.
              </p>
              <div className="mt-6">
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
                    className="flex flex-col justify-between rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] backdrop-blur-md p-5 sm:p-6 shadow-xs transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] break-words flex-1">
                          {goal.title}
                        </h2>
                        <div className="flex items-center gap-1 shrink-0 -mt-1 -mr-1">
                          <Link
                            href={`/goals/${goal.id}/edit`}
                            className="inline-flex items-center justify-center rounded-md p-1.5 text-[var(--text-secondary)] hover:text-blue-600 hover:bg-blue-500/10 transition-all duration-200 ease-out hover:-translate-y-0.5"
                            title="Edit goal"
                            aria-label={`Edit goal ${goal.title}`}
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
                          <GoalDeleteButton
                            goalId={goal.id}
                            goalTitle={goal.title}
                          />
                        </div>
                      </div>

                      {goal.description && (
                        <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-3 break-words">
                          {goal.description}
                        </p>
                      )}
                    </div>

                    <div className="mt-6 space-y-4">
                      {/* Progress Bar */}
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

                      {/* Target Date */}
                      <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
                        <span>Target Date:</span>
                        <span className="font-medium text-[var(--text-primary)]">
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

