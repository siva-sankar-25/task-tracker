import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/Navbar'
import ProfileSettingsForm from '@/components/ProfileSettingsForm'
import PasswordSettingsForm from '@/components/PasswordSettingsForm'
import ThemeSelector from '@/components/ThemeSelector'
import ThemeModeToggle from '@/components/ThemeModeToggle'
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
    <div className="min-h-screen text-[var(--text-primary)]">
      <Navbar userName={displayName} userEmail={user.email} />

      <main className="mx-auto max-w-4xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="pb-4 border-b border-[var(--border-color)]">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Settings
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">
            Manage your personal profile, theme preferences, and account security.
          </p>
        </div>

        <div className="space-y-6">
          {/* Section 1: Appearance */}
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] backdrop-blur-md p-5 sm:p-6 shadow-xs transition-all duration-200 ease-out">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-1">
                  Appearance
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                  Customize your workspace atmosphere across 5 curated aesthetic themes.
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-medium text-[var(--text-secondary)]">
                  Light / Dark:
                </span>
                <ThemeModeToggle />
              </div>
            </div>

            <ThemeSelector />
          </div>

          {/* Section 2: Profile */}
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] backdrop-blur-md p-5 sm:p-6 shadow-xs transition-all duration-200 ease-out">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-1">
              Profile
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-5">
              Customize how your name appears across the workspace.
            </p>

            <ProfileSettingsForm
              initialFullName={user.user_metadata?.full_name || ''}
            />
          </div>

          {/* Section 3: Account Security */}
          <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] backdrop-blur-md p-5 sm:p-6 shadow-xs transition-all duration-200 ease-out">
            <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] mb-1">
              Account & Security
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-5">
              Manage your login credentials and authentication.
            </p>

            {/* Read-only Email display */}
            <div className="mb-6 rounded-lg border border-[var(--border-color)] bg-black/5 dark:bg-white/5 p-4">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                Account Email (Read-only)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {user.email}
                </span>
                <span className="rounded bg-black/10 dark:bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--text-secondary)]">
                  Verified
                </span>
              </div>
            </div>

            {/* Change Password */}
            <div className="pt-2 border-t border-[var(--border-color)]">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                Change Password
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mb-4">
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
