import type { Task, DashboardStats, TrendData } from "@/types"

const MOCK_TASKS: Task[] = [
  {
    id: "1",
    title: "Fix login authentication bug",
    description:
      "Users are unable to login with valid credentials. The authentication service is returning 500 errors intermittently.",
    priority: "critical",
    status: "in-progress",
    assigneeId: "1",
    assigneeName: "Yuvraj Singh",
    reporterId: "2",
    reporterName: "Suraj Shikhar",
    createdAt: "2025-05-15T10:00:00Z",
    updatedAt: "2024-05-16T14:30:00Z",
    dueDate: "2024-05-20T23:59:59Z",
    estimatedHours: 8,
    tags: ["authentication", "backend", "urgent"],
    timeEntries: [
      {
        id: "1",
        taskId: "1",
        userId: "1",
        userName: "Yuvraj Singh",
        description: "Investigating authentication service logs",
        hours: 2.5,
        date: "2025-05-16",
        createdAt: "2025-06-16T14:30:00Z",
      },
    ],
  },
  {
    id: "2",
    title: "Implement dark mode toggle",
    description:
      "Add a dark mode toggle to the application header. Should persist user preference and apply theme across all pages.",
    priority: "medium",
    status: "open",
    assigneeId: "3",
    assigneeName: "Aman Kumar",
    reporterId: "1",
    reporterName: "Yuvraj Singh",
    createdAt: "2025-05-14T09:15:00Z",
    updatedAt: "2024-05-14T09:15:00Z",
    dueDate: "2025-06-25T23:59:59Z",
    estimatedHours: 4,
    tags: ["frontend", "ui", "enhancement"],
    timeEntries: [],
  },
]

export const getTasks = (): Task[] => {
  if (typeof window === "undefined") return MOCK_TASKS

  const stored = localStorage.getItem("tasks")
  return stored ? JSON.parse(stored) : MOCK_TASKS
}

export const saveTasks = (tasks: Task[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem("tasks", JSON.stringify(tasks))
}

export const getDashboardStats = (userId?: string, role?: string): DashboardStats => {
  const tasks = getTasks()
  const userTasks = role === "manager" ? tasks : tasks.filter((t) => t.assigneeId === userId)

  const totalTasks = userTasks.length
  const openTasks = userTasks.filter((t) => t.status === "open").length
  const inProgressTasks = userTasks.filter((t) => t.status === "in-progress").length
  const closedTasks = userTasks.filter((t) => t.status === "closed").length
  const pendingApprovalTasks = userTasks.filter((t) => t.status === "pending-approval").length

  const totalTimeLogged = userTasks.reduce(
    (total, task) => total + task.timeEntries.reduce((taskTotal, entry) => taskTotal + entry.hours, 0),
    0,
  )

  return {
    totalTasks,
    openTasks,
    inProgressTasks,
    closedTasks,
    pendingApprovalTasks,
    totalTimeLogged,
  }
}

export const getTrendData = (): TrendData[] => {
  const days = 7
  const data: TrendData[] = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    data.push({
      date: date.toISOString().split("T")[0],
      tasks: Math.floor(Math.random() * 10) + 5,
      timeLogged: Math.floor(Math.random() * 8) + 2,
    })
  }

  return data
}
