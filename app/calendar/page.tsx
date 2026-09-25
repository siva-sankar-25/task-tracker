'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import CalendarDayCell from '@/components/CalendarDayCell'
import CalendarTaskCard from '@/components/CalendarTaskCard'
import { Task } from '@/types/database'

function formatDateKey(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${year}-${m}-${d}`
}

function formatDateDisplay(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function CalendarPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(() => new Date())
  const [tasks, setTasks] = useState<Task[]>([])
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4, // Prevents accidental drag when simply clicking
      },
    })
  )

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' = 'success') => {
      setToast({ message, type })
      const timer = setTimeout(() => {
        setToast((current) => (current?.message === message ? null : current))
      }, 3500)
      return () => clearTimeout(timer)
    },
    []
  )

  // Fetch logged in user & tasks with due_date
  useEffect(() => {
    async function fetchTasks() {
      try {
        const supabase = createClient()
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError || !user) {
          router.push('/login')
          return
        }

        setUserEmail(user.email ?? null)

        const { data: rawTasks, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .not('due_date', 'is', null)

        if (tasksError) {
          console.error('Error loading calendar tasks:', tasksError)
          showToast('Failed to load tasks', 'error')
        } else if (rawTasks) {
          setTasks(rawTasks as Task[])
        }
      } catch (err) {
        console.error('Unexpected error loading calendar:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [router, showToast])

  // Calendar calculations
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const todayKey = useMemo(() => {
    const now = new Date()
    return formatDateKey(now.getFullYear(), now.getMonth(), now.getDate())
  }, [])

  const monthLabel = useMemo(() => {
    return currentDate.toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric',
    })
  }, [currentDate])

  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay() // 0 = Sun, 1 = Mon, ...
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const days = []

    // 1. Previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i
      const prevMonthDate = new Date(year, month - 1, d)
      const dateKey = formatDateKey(
        prevMonthDate.getFullYear(),
        prevMonthDate.getMonth(),
        d
      )
      days.push({
        dateKey,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: dateKey === todayKey,
      })
    }

    // 2. Current month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateKey = formatDateKey(year, month, d)
      days.push({
        dateKey,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateKey === todayKey,
      })
    }

    // 3. Next month leading days (to complete rows of 7, up to 35 or 42 cells)
    const remainingCells = (7 - (days.length % 7)) % 7
    const targetTotal = days.length + remainingCells < 35 ? 35 : days.length + remainingCells

    let nextDay = 1
    while (days.length < targetTotal) {
      const nextMonthDate = new Date(year, month + 1, nextDay)
      const dateKey = formatDateKey(
        nextMonthDate.getFullYear(),
        nextMonthDate.getMonth(),
        nextDay
      )
      days.push({
        dateKey,
        dayNumber: nextDay,
        isCurrentMonth: false,
        isToday: dateKey === todayKey,
      })
      nextDay++
    }

    return days
  }, [year, month, todayKey])

  // Group tasks by due_date
  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>()
    tasks.forEach((t) => {
      if (!t.due_date) return
      const existing = map.get(t.due_date) || []
      existing.push(t)
      map.set(t.due_date, existing)
    })
    return map
  }, [tasks])

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  // Drag and drop event handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task =
      (active.data.current?.task as Task) ||
      tasks.find((t) => t.id === active.id) ||
      null
    setActiveTask(task)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    const newDateKey = over.id as string

    const targetTask = tasks.find((t) => t.id === taskId)
    if (!targetTask || targetTask.due_date === newDateKey) return

    const previousDueDate = targetTask.due_date

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, due_date: newDateKey } : t))
    )

    showToast(
      `✓ Rescheduled "${targetTask.title}" to ${formatDateDisplay(newDateKey)}`,
      'success'
    )

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('tasks')
        .update({ due_date: newDateKey })
        .eq('id', taskId)

      if (error) {
        // Revert on error
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, due_date: previousDueDate } : t))
        )
        showToast(`Failed to reschedule: ${error.message}`, 'error')
      }
    } catch (err) {
      console.error('Error updating task date in Supabase:', err)
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, due_date: previousDueDate } : t))
      )
      showToast('An unexpected error occurred while rescheduling.', 'error')
    }
  }

  const weekDayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100">
      <Navbar userEmail={userEmail} />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div
            className={`flex items-center gap-2 rounded-lg px-4 py-3 text-xs sm:text-sm font-medium shadow-lg border ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-700 dark:bg-emerald-700 dark:border-emerald-600'
                : 'bg-red-600 text-white border-red-700 dark:bg-red-700 dark:border-red-600'
            }`}
          >
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-2 rounded p-0.5 hover:bg-black/10 focus:outline-none"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Calendar Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-gray-200 dark:border-zinc-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Calendar
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Drag and drop task cards between days to reschedule deadlines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleToday}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            >
              Today
            </button>

            <div className="inline-flex rounded-md shadow-2xs">
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="rounded-l-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                ← Prev
              </button>
              <span className="flex items-center border-y border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white min-w-[130px] justify-center">
                {monthLabel}
              </span>
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next month"
                className="rounded-r-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                Next →
              </button>
            </div>

            <Link
              href="/tasks/new"
              className="inline-flex items-center rounded-md bg-blue-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-2xs hover:bg-blue-700 transition-colors"
            >
              + New Task
            </Link>
          </div>
        </div>

        {/* Calendar Grid Container (Horizontal scrollable on mobile viewport) */}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
            {loading ? (
              <div className="flex h-96 items-center justify-center">
                <span className="text-sm text-gray-400 dark:text-zinc-500 animate-pulse">
                  Loading calendar tasks...
                </span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[700px]">
                  {/* Weekday column headers */}
                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2">
                    {weekDayHeaders.map((dayName) => (
                      <div
                        key={dayName}
                        className="py-1 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        {dayName}
                      </div>
                    ))}
                  </div>

                  {/* Days grid */}
                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {calendarDays.map((day) => {
                      const dayTasks = tasksByDate.get(day.dateKey) || []
                      return (
                        <CalendarDayCell
                          key={day.dateKey}
                          dateKey={day.dateKey}
                          dayNumber={day.dayNumber}
                          isCurrentMonth={day.isCurrentMonth}
                          isToday={day.isToday}
                          tasks={dayTasks}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Active dragging overlay card */}
          <DragOverlay>
            {activeTask ? <CalendarTaskCard task={activeTask} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  )
}
