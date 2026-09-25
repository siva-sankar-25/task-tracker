'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface TaskDeleteButtonProps {
  taskId: string
  taskTitle?: string
}

export default function TaskDeleteButton({
  taskId,
  taskTitle,
}: TaskDeleteButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    const message = taskTitle
      ? `Are you sure you want to delete "${taskTitle}"?`
      : 'Are you sure you want to delete this task?'

    if (!window.confirm(message)) {
      return
    }

    setIsDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from('tasks').delete().eq('id', taskId)

      if (error) {
        alert(`Failed to delete task: ${error.message}`)
      } else {
        router.refresh()
      }
    } catch (err) {
      console.error('Error deleting task:', err)
      alert('An unexpected error occurred while deleting the task.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      aria-label={`Delete task ${taskTitle || ''}`}
      className="inline-flex items-center justify-center rounded-md p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 dark:hover:text-red-400 transition-colors cursor-pointer disabled:opacity-50"
      title="Delete task"
    >
      <svg
        className="h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
        />
      </svg>
    </button>
  )
}
