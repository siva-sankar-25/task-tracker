'use client'

import { useDroppable } from '@dnd-kit/core'
import CalendarTaskCard from '@/components/CalendarTaskCard'
import { Task } from '@/types/database'

interface CalendarDayCellProps {
  dateKey: string
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
  tasks: Task[]
}

export default function CalendarDayCell({
  dateKey,
  dayNumber,
  isCurrentMonth,
  isToday,
  tasks,
}: CalendarDayCellProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: dateKey,
  })

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[105px] sm:min-h-[125px] flex flex-col rounded-lg border p-1.5 sm:p-2 transition-colors ${
        isOver
          ? 'ring-2 ring-blue-500 bg-blue-500/15 border-blue-400 dark:border-blue-500'
          : isCurrentMonth
          ? 'bg-black/5 dark:bg-white/5 border-[var(--border-color)]'
          : 'bg-black/10 dark:bg-white/10 border-[var(--border-color)]/50 text-[var(--text-secondary)] opacity-60'
      }`}
    >
      {/* Day header */}
      <div className="flex items-center justify-between mb-1">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
            isToday
              ? 'bg-blue-600 text-white font-bold'
              : isCurrentMonth
              ? 'text-[var(--text-primary)]'
              : 'text-[var(--text-secondary)]'
          }`}
        >
          {dayNumber}
        </span>
        {tasks.length > 0 && (
          <span className="text-[10px] font-medium text-[var(--text-secondary)]">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </span>
        )}
      </div>

      {/* Task list container */}
      <div className="flex flex-col gap-1 overflow-y-auto max-h-[100px] sm:max-h-[140px] pr-0.5 scrollbar-thin">
        {tasks.map((task) => (
          <CalendarTaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}

