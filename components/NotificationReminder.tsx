'use client'

import { useEffect, useState } from 'react'

interface NotificationReminderProps {
  dueTasksCount: number
  overdueCount: number
  dueTodayCount: number
}

export default function NotificationReminder({
  dueTasksCount,
  overdueCount,
  dueTodayCount,
}: NotificationReminderProps) {
  const [permission, setPermission] = useState<
    'default' | 'granted' | 'denied' | 'unsupported'
  >('unsupported')
  const [requesting, setRequesting] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermission('unsupported')
      return
    }

    const currentPermission = Notification.permission
    setPermission(currentPermission)

    // If permission is already granted and there are tasks needing attention,
    // fire a one-time summary notification on dashboard load
    if (currentPermission === 'granted' && dueTasksCount > 0) {
      try {
        const sessionKey = 'notif_sent_session'
        if (!sessionStorage.getItem(sessionKey)) {
          new Notification('Task Tracker Reminder', {
            body: `${dueTasksCount} task${
              dueTasksCount === 1 ? ' needs' : 's need'
            } attention (${overdueCount} overdue, ${dueTodayCount} due today).`,
            icon: '/favicon.ico',
          })
          sessionStorage.setItem(sessionKey, 'true')
        }
      } catch (err) {
        console.warn('Notification execution failed:', err)
      }
    }
  }, [dueTasksCount, overdueCount, dueTodayCount])

  const handleEnableReminders = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) return

    setRequesting(true)
    try {
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === 'granted' && dueTasksCount > 0) {
        new Notification('Task Tracker Reminder', {
          body: `${dueTasksCount} task${
            dueTasksCount === 1 ? ' needs' : 's need'
          } attention (${overdueCount} overdue, ${dueTodayCount} due today).`,
          icon: '/favicon.ico',
        })
      }
    } catch (err) {
      console.warn('Error requesting notification permission:', err)
    } finally {
      setRequesting(false)
    }
  }

  // If permission is default (not yet granted or denied) and notifications are supported
  if (permission !== 'default') {
    return null
  }

  return (
    <button
      type="button"
      onClick={handleEnableReminders}
      disabled={requesting}
      className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-amber-900 shadow-xs ring-1 ring-amber-900/10 hover:bg-white dark:bg-zinc-900/90 dark:text-amber-300 dark:ring-amber-500/20 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
      title="Enable browser push reminders for due tasks"
    >
      <span>🔔</span>
      <span>{requesting ? 'Enabling...' : 'Enable reminders'}</span>
    </button>
  )
}
