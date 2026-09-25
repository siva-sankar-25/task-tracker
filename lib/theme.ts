/**
 * Helper to visually force clean-white theme on the DOM without touching
 * localStorage, Supabase user metadata, or calling React state's setTheme().
 *
 * This provides a clean, neutral view on public auth pages (/login, /signup)
 * and during logout transitions while keeping the user's actual saved theme preference intact.
 */
export function forceCleanWhiteView(): void {
  if (typeof document === 'undefined') return

  document.documentElement.dataset.theme = 'clean-white'

  // Maintain the user's mode preference (light/dark)
  const savedMode =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('app-mode')
      : null

  const effectiveMode = savedMode === 'dark' ? 'dark' : 'light'
  document.documentElement.dataset.mode = effectiveMode

  if (effectiveMode === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}
