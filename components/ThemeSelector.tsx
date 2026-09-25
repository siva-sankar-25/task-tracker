'use client'

import { useTheme, THEMES, ThemeType } from '@/components/ThemeProvider'

export default function ThemeSelector() {
  const { theme: activeTheme, setTheme } = useTheme()

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
      {THEMES.map((t) => {
        const isSelected = activeTheme === t.id

        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTheme(t.id)}
            className={`group relative flex flex-col justify-between rounded-xl border p-4 text-left transition-all duration-200 ease-out hover:-translate-y-0.5 cursor-pointer ${
              isSelected
                ? 'border-blue-500 ring-2 ring-blue-500/50 bg-blue-500/10 shadow-md'
                : 'border-[var(--border-color)] bg-black/5 dark:bg-white/5 hover:border-blue-500/40 hover:bg-black/10 dark:hover:bg-white/10'
            }`}

          >
            <div>
              {/* Swatch Preview Box */}
              <div
                className="relative mb-3.5 h-16 w-full overflow-hidden rounded-lg border border-white/15 shadow-inner flex items-center justify-between px-3"
                style={{
                  backgroundColor: t.previewBg,
                  backgroundImage:
                    t.previewGradient !== 'none' ? t.previewGradient : undefined,
                }}
              >
                {/* Mini card mockup inside swatch */}
                <div className="flex items-center gap-2 rounded-md bg-white/10 px-2.5 py-1 backdrop-blur-xs border border-white/10">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: t.accentColor }}
                  />
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: t.textColor }}
                  >
                    Aa
                  </span>
                </div>

                {isSelected && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-xs">
                    ✓
                  </span>
                )}
              </div>

              {/* Theme Name & Badge */}
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  {t.name}
                </h3>
                {isSelected && (
                  <span className="rounded-full bg-blue-600/10 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    Active
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                {t.description}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
