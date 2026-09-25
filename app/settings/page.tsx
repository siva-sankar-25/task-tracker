import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import ProfileSettingsForm from '@/components/ProfileSettingsForm'
import PasswordSettingsForm from '@/components/PasswordSettingsForm'
import { getDisplayName } from '@/lib/getDisplayName'

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const displayName = getDisplayName(user)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100">
      <Navbar userName={displayName} userEmail={user.email} />

      <main className="mx-auto max-w-4xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="pb-4 border-b border-gray-200 dark:border-zinc-800">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Manage your personal profile, display preferences, and account security.
          </p>
        </div>

        <div className="space-y-6">
          {/* Section 1: Profile */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-all duration-200 ease-out">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1">
              Profile
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-5">
              Customize how your name appears across the workspace.
            </p>

            <ProfileSettingsForm
              initialFullName={user.user_metadata?.full_name || ''}
            />
          </div>

          {/* Section 2: Account Security */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-all duration-200 ease-out">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1">
              Account & Security
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-5">
              Manage your login credentials and authentication.
            </p>

            {/* Read-only Email display */}
            <div className="mb-6 rounded-lg border border-gray-100 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                Account Email (Read-only)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.email}
                </span>
                <span className="rounded bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-700 dark:bg-zinc-700 dark:text-gray-300">
                  Verified
                </span>
              </div>
            </div>

            {/* Change Password */}
            <div className="pt-2 border-t border-gray-100 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                Change Password
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Update your account password (minimum 6 characters).
              </p>
              <PasswordSettingsForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
