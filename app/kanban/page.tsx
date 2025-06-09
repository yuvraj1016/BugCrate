"use client"

import type React from "react"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, MoreHorizontal, Clock } from "lucide-react"
import { useTasks } from "@/hooks/use-tasks"
import { useAuth } from "@/contexts/auth-context"
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog"
import { EditTaskDialog } from "@/components/tasks/edit-task-dialog"
import { TimeTrackingDialog } from "@/components/tasks/time-tracking-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Task, TaskPriority, TaskStatus } from "@/types"

export default function KanbanPage() {
  const { user } = useAuth()
  const { tasks, createTask, updateTask, deleteTask } = useTasks()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showTimeDialog, setShowTimeDialog] = useState(false)

  if (!user) return null

  const userTasks = user.role === "manager" ? tasks : tasks.filter((task) => task.assigneeId === user.id)

  const columns: { title: string; status: TaskStatus | "reopened" }[] = [
    { title: "Open", status: "open" },
    { title: "In Progress", status: "in-progress" },
    { title: "Pending Approval", status: "pending-approval" },
    { title: "Closed", status: "closed" },
  ]

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData("taskId", task.id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData("taskId")
    updateTask(taskId, { status })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kanban Board</h1>
            <p className="text-muted-foreground">Visualize and manage your tasks with drag and drop.</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <div key={column.status} className="flex flex-col h-full">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-lg">{column.title}</h3>
                <Badge variant="outline">{userTasks.filter((task) => task.status === column.status).length}</Badge>
              </div>
              <div
                className="flex-1 rounded-lg bg-muted/50 p-3 min-h-[500px]"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.status as TaskStatus)}
              >
                <div className="space-y-3">
                  {userTasks
                    .filter((task) => task.status === column.status)
                    .map((task) => (
                      <Card
                        key={task.id}
                        className="cursor-grab active:cursor-grabbing"
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedTask(task)
                                    setShowEditDialog(true)
                                  }}
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedTask(task)
                                    setShowTimeDialog(true)
                                  }}
                                >
                                  Log Time
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-red-600">
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <h4 className="font-medium mb-2">{task.title}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{task.description}</p>
                          <div className="flex items-center justify-between">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src="/placeholder.svg" alt={task.assigneeName} />
                              <AvatarFallback className="text-xs">
                                {task.assigneeName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {task.timeEntries.reduce((total, entry) => total + entry.hours, 0)}h
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreateTaskDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onTaskCreate={createTask}
        currentUserId={user.id}
      />

      {selectedTask && (
        <>
          <EditTaskDialog
            task={selectedTask}
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            onTaskUpdate={updateTask}
          />

          <TimeTrackingDialog
            task={selectedTask}
            open={showTimeDialog}
            onOpenChange={setShowTimeDialog}
            currentUserId={user.id}
            onTimeEntryAdd={(taskId, timeEntry) => {
              const updatedTask = {
                ...selectedTask,
                timeEntries: [
                  ...selectedTask.timeEntries,
                  {
                    ...timeEntry,
                    id: Date.now().toString(),
                    taskId,
                    createdAt: new Date().toISOString(),
                  },
                ],
              }
              updateTask(taskId, updatedTask)
            }}
          />
        </>
      )}
    </DashboardLayout>
  )
}
