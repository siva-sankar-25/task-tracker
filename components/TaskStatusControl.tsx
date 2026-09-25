'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface TaskStatusControlProps {
  taskId: string
  initialStatus: string
}

export default function TaskStatusControl({
  taskId,
  initialStatus,
}: TaskStatusControlProps) {
  const [status, setStatus] = useState(initialStatus || 'todo')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = async (newStatus: string) => {
    if (newStatus === status || loading) return

    const previousStatus = status
    setStatus(newStatus)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId)

      if (error) {
        console.error('Failed to update task status:', error)
        setStatus(previousStatus)
      } else {
        router.refresh()
      }
    } catch (err) {
      console.error('Unexpected error updating task status:', err)
      setStatus(previousStatus)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeStyle = (s: string) => {
    switch (s) {
      case 'done':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800'
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700'
    }
  }

  return (
    <div className="relative inline-flex items-center">
      <select
        value={status}
        disabled={loading}
        onChange={(e) => handleChange(e.target.value)}
        className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors pr-6 ${getStatusBadgeStyle(
          status
        )}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='2.5' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.35rem center',
          backgroundSize: '0.65rem',
        }}
        title="Change status"
      >
        <option value="todo" className="bg-white text-gray-900 dark:bg-zinc-900 dark:text-white">
          To Do
        </option>
        <option value="in_progress" className="bg-white text-gray-900 dark:bg-zinc-900 dark:text-white">
          In Progress
        </option>
        <option value="done" className="bg-white text-gray-900 dark:bg-zinc-900 dark:text-white">
          Done
        </option>
      </select>
    </div>
  )
}
