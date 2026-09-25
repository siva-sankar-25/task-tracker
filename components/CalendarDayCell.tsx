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
          ? 'ring-2 ring-blue-500 bg-blue-50/80 dark:bg-blue-950/60 border-blue-400 dark:border-blue-500'
          : isCurrentMonth
          ? 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800/80'
          : 'bg-gray-50/60 dark:bg-zinc-950/40 border-gray-100 dark:border-zinc-900/60 text-gray-400 dark:text-zinc-600'
      }`}
    >
      {/* Day header */}
      <div className="flex items-center justify-between mb-1">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
            isToday
              ? 'bg-blue-600 text-white font-bold'
              : isCurrentMonth
              ? 'text-gray-900 dark:text-zinc-100'
              : 'text-gray-400 dark:text-zinc-600'
          }`}
        >
          {dayNumber}
        </span>
        {tasks.length > 0 && (
          <span className="text-[10px] font-medium text-gray-400 dark:text-zinc-500">
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
