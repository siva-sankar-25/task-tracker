'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface TaskStatusToggleProps {
  taskId: string
  initialStatus: string
}

export default function TaskStatusToggle({
  taskId,
  initialStatus,
}: TaskStatusToggleProps) {
  const [status, setStatus] = useState(initialStatus)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const isDone = status === 'done'

  const handleToggle = async () => {
    if (loading) return

    const nextStatus = isDone ? 'todo' : 'done'
    setStatus(nextStatus)
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('tasks')
        .update({ status: nextStatus })
        .eq('id', taskId)

      if (error) {
        console.error('Failed to update task status:', error)
        setStatus(initialStatus) // Revert on failure
      } else {
        router.refresh()
      }
    } catch (err) {
      console.error('Unexpected error toggling task status:', err)
      setStatus(initialStatus)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        isDone
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
          : 'bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700'
      }`}
      title={isDone ? 'Mark as todo' : 'Mark as done'}
    >
      <span
        className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[10px] ${
          isDone
            ? 'bg-emerald-600 border-emerald-600 text-white'
            : 'border-zinc-400 dark:border-zinc-500'
        }`}
      >
        {isDone ? '✓' : ''}
      </span>
      <span>{isDone ? 'Done' : 'Mark Done'}</span>
    </button>
  )
}
