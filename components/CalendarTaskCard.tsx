'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { Task } from '@/types/database'

interface CalendarTaskCardProps {
  task: Task
  isOverlay?: boolean
}

export default function CalendarTaskCard({
  task,
  isOverlay = false,
}: CalendarTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: { task },
      disabled: isOverlay,
    })

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined

  const p = (task.priority || '').toLowerCase()
  const isDone = task.status === 'done'

  // Priority color tags matching tasks page: low = gray, medium = yellow, high = red
  const getPriorityClasses = () => {
    if (p === 'high') {
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/70 dark:text-red-300 dark:border-red-900/80 hover:border-red-400'
    }
    if (p === 'medium') {
      return 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/70 dark:text-yellow-300 dark:border-yellow-900/80 hover:border-yellow-400'
    }
    return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-700 hover:border-gray-400'
  }

  const priorityDotColor =
    p === 'high' ? 'bg-red-500' : p === 'medium' ? 'bg-amber-500' : 'bg-gray-400'

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative flex items-center justify-between gap-1.5 rounded-md border px-2 py-1 text-xs shadow-2xs select-none transition-all duration-200 ease-out ${
        isOverlay
          ? 'cursor-grabbing shadow-lg scale-105 z-50 ring-2 ring-blue-500 opacity-95'
          : 'cursor-grab active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-xs'
      } ${isDragging ? 'opacity-30' : ''} ${getPriorityClasses()} ${
        isDone ? 'opacity-60' : ''
      }`}
      title={`${task.title} (${task.priority || 'low'} priority) - Drag to reschedule`}
    >
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${priorityDotColor}`}
        />
        <span
          className={`truncate font-medium ${
            isDone ? 'line-through text-gray-500 dark:text-gray-400' : ''
          }`}
        >
          {task.title}
        </span>
      </div>
      {isDone && <span className="text-[10px] text-emerald-600 font-bold shrink-0">✓</span>}
    </div>
  )
}
