'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface TaskCheckboxProps {
  taskId: string
  initialStatus: string
  taskTitle: string
  children?: React.ReactNode
}

export default function TaskCheckbox({
  taskId,
  initialStatus,
  taskTitle,
  children,
}: TaskCheckboxProps) {
  const [status, setStatus] = useState(initialStatus || 'todo')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const isDone = status === 'done'

  const handleToggle = async () => {
    if (loading) return
    const nextStatus = isDone ? 'todo' : 'done'
    const previousStatus = status

    setStatus(nextStatus)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('tasks')
        .update({ status: nextStatus })
        .eq('id', taskId)

      if (error) {
        console.error('Error toggling status:', error)
        setStatus(previousStatus)
      } else {
        router.refresh()
      }
    } catch (err) {
      console.error('Unexpected error toggling task status:', err)
      setStatus(previousStatus)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-start gap-3 min-w-0 flex-1">
      <button
        type="button"
        role="checkbox"
        aria-checked={isDone}
        onClick={handleToggle}
        disabled={loading}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200 ease-out cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50 ${
          isDone
            ? 'bg-blue-600 border-blue-600 text-white dark:bg-blue-500 dark:border-blue-500 shadow-2xs'
            : 'border-gray-300 bg-white hover:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-blue-400'
        }`}
        title={isDone ? 'Mark as to do' : 'Mark as done'}
        aria-label={isDone ? `Mark "${taskTitle}" as to do` : `Mark "${taskTitle}" as done`}
      >
        <svg
          className={`h-3.5 w-3.5 transition-all duration-200 ease-out ${
            isDone ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </button>

      <div className="min-w-0 flex-1">
        <div className="relative inline-block max-w-full">
          <span
            className={`text-sm sm:text-base font-semibold break-words transition-colors duration-300 ease-out ${
              isDone
                ? 'text-gray-400 dark:text-zinc-500'
                : 'text-gray-900 dark:text-white'
            }`}
          >
            {taskTitle}
          </span>
          <span
            aria-hidden="true"
            className={`absolute left-0 top-1/2 h-[1.5px] bg-gray-400 dark:bg-zinc-500 transition-all duration-300 ease-out origin-left pointer-events-none ${
              isDone ? 'w-full opacity-100' : 'w-0 opacity-0'
            }`}
          />
        </div>
        {children}
      </div>
    </div>
  )
}
