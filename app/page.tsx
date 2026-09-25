import Link from "next/link";
import AntigravityCanvas from "@/components/AntigravityCanvas";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 text-[var(--text-primary)]">
      <AntigravityCanvas />

      <div className="relative z-10 w-full max-w-md space-y-6 sm:space-y-8 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] backdrop-blur-md p-6 sm:p-8 text-center shadow-lg transition-all duration-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Task Tracker
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)]">
            Organize goals, manage tasks, and stay on top of daily milestones.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center pt-2">
          <Link
            href="/login"
            className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 shadow-xs transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="inline-flex justify-center rounded-md border border-[var(--border-color)] bg-black/5 dark:bg-white/5 px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            Sign Up
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex justify-center rounded-md border border-[var(--border-color)] bg-black/10 dark:bg-white/10 px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-black/15 dark:hover:bg-white/15 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

