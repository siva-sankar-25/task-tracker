import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Fetch metrics
  const [{ count: goalsCount }, { data: tasks }] = await Promise.all([
    supabase
      .from('goals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('tasks')
      .select('id, status')
      .eq('user_id', user.id),
  ])

  const totalTasks = tasks?.length ?? 0
  const completedTasks = tasks?.filter((t) => t.status === 'done').length ?? 0
  const pendingTasks = totalTasks - completedTasks

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <Navbar userEmail={user.email} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white p-6 shadow-xs border border-gray-200 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Welcome, {user.email}
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Here is an overview of your goals and tasks.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/goals/new"
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-200 dark:hover:bg-zinc-700 transition-colors"
              >
                + New Goal
              </Link>
              <Link
                href="/tasks/new"
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                + New Task
              </Link>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {/* Goals Metric */}
            <Link
              href="/goals"
              className="relative overflow-hidden rounded-lg border border-gray-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                Active Goals
              </dt>
              <dd className="mt-2 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                {goalsCount ?? 0}
              </dd>
              <p className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                View all goals →
              </p>
            </Link>

            {/* Total Tasks Metric */}
            <Link
              href="/tasks"
              className="relative overflow-hidden rounded-lg border border-gray-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                Pending Tasks
              </dt>
              <dd className="mt-2 text-3xl font-semibold tracking-tight text-amber-600 dark:text-amber-400">
                {pendingTasks}
              </dd>
              <p className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                Manage tasks →
              </p>
            </Link>

            {/* Completed Tasks Metric */}
            <Link
              href="/tasks"
              className="relative overflow-hidden rounded-lg border border-gray-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                Completed Tasks
              </dt>
              <dd className="mt-2 text-3xl font-semibold tracking-tight text-emerald-600 dark:text-emerald-400">
                {completedTasks}
              </dd>
              <p className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                {totalTasks > 0
                  ? `${Math.round((completedTasks / totalTasks) * 100)}% completed`
                  : 'No tasks yet'}
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
