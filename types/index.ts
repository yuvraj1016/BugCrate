export type UserRole = "developer" | "manager"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
}

export type TaskStatus = "open" | "in-progress" | "pending-approval" | "closed" | "reopened"
export type TaskPriority = "low" | "medium" | "high" | "critical"

export interface Task {
  id: string
  title: string
  description: string
  priority: TaskPriority
  status: TaskStatus
  assigneeId: string
  assigneeName: string
  reporterId: string
  reporterName: string
  createdAt: string
  updatedAt: string
  dueDate?: string
  estimatedHours?: number
  tags: string[]
  timeEntries: TimeEntry[]
}

export interface TimeEntry {
  id: string
  taskId: string
  userId: string
  userName: string
  description: string
  hours: number
  date: string
  createdAt: string
}

export interface DashboardStats {
  totalTasks: number
  openTasks: number
  inProgressTasks: number
  closedTasks: number
  pendingApprovalTasks: number
  totalTimeLogged: number
}

export interface TrendData {
  date: string
  tasks: number
  timeLogged: number
}
