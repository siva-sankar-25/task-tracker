import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import GoalEditForm from './GoalEditForm'
import { getDisplayName } from '@/lib/getDisplayName'
import { Goal } from '@/types/database'

interface EditGoalPageProps {
  params: Promise<{ id: string }>
}

export default async function EditGoalPage(props: EditGoalPageProps) {
  const { id } = await props.params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const displayName = getDisplayName(user)

  const { data: goal, error: goalError } = await supabase
    .from('goals')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (goalError || !goal) {
    redirect('/goals')
  }

  return (
    <div className="min-h-screen text-[var(--text-primary)]">
      <Navbar userName={displayName} userEmail={user.email} />

      <main className="mx-auto max-w-2xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              Edit Goal
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
              Update goal title, description, target date, and current progress.
            </p>
          </div>
          <Link
            href="/goals"
            className="text-xs sm:text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors self-start sm:self-auto"
          >
            ← Back to Goals
          </Link>
        </div>

        <GoalEditForm goal={goal as Goal} />
      </main>
    </div>
  )
}

