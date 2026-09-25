export interface Goal {
  id: string
  user_id: string
  title: string
  description?: string | null
  target_date?: string | null
  progress?: number | null
  created_at?: string
}

export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string | null
  due_date?: string | null
  priority: TaskPriority | string
  status: TaskStatus | string
  goal_id?: string | null
  goal?: {
    id: string
    title: string
  } | null
  goals?: {
    id: string
    title: string
  } | null
  created_at?: string
}
