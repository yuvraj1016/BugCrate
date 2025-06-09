"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CheckCircle, XCircle, Clock, Calendar, AlertTriangle } from "lucide-react"
import { useTasks } from "@/hooks/use-tasks"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"
import { TaskDetailDialog } from "@/components/tasks/task-detail-dialog"
import type { Task, TaskPriority, TaskStatus } from "@/types"
import { format, formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

export default function ApprovalsPage() {
  const { user } = useAuth()
  const { tasks, updateTask, deleteTask } = useTasks()
  const { toast } = useToast()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  if (!user || user.role !== "manager") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">Only managers can access the approvals page.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const pendingTasks = tasks.filter((task) => task.status === "pending-approval")

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

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "pending-approval":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  const handleApproval = (taskId: string, approved: boolean) => {
    const newStatus: TaskStatus = approved ? "closed" : "reopened"
    updateTask(taskId, { status: newStatus })

    toast({
      title: approved ? "Task approved" : "Task reopened",
      description: approved
        ? "The task has been approved and closed successfully."
        : "The task has been reopened for further work.",
      variant: "success",
    })
  }

  const handleViewTask = (task: Task) => {
    setSelectedTask(task)
    setShowDetailDialog(true)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Task Approvals</h1>
            <p className="text-muted-foreground">Review and approve tasks submitted by your team members.</p>
          </div>
          <Badge variant="outline" className="text-lg px-3 py-1">
            {pendingTasks.length} Pending
          </Badge>
        </div>

        {pendingTasks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">All caught up!</h3>
              <p className="text-muted-foreground text-center">There are no tasks pending approval at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingTasks
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .map((task) => {
                const totalTimeLogged = task.timeEntries.reduce((total, entry) => total + entry.hours, 0)
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()

                return (
                  <Card key={task.id} className="hover:shadow-md transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle
                              className="text-lg cursor-pointer hover:text-primary"
                              onClick={() => handleViewTask(task)}
                            >
                              {task.title}
                            </CardTitle>
                            <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                            <Badge className={getStatusColor(task.status)}>Pending Approval</Badge>
                            {isOverdue && <Badge variant="destructive">Overdue</Badge>}
                          </div>
                          <p className="text-muted-foreground mb-3 line-clamp-2">{task.description}</p>

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-xs">
                                  {task.assigneeName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span>Completed by {task.assigneeName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{totalTimeLogged}h logged</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                Submitted {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
                              </span>
                            </div>
                            {task.dueDate && (
                              <div className={cn("flex items-center gap-1", isOverdue && "text-red-500")}>
                                <Calendar className="w-4 h-4" />
                                <span>Due {format(new Date(task.dueDate), "MMM d, yyyy")}</span>
                              </div>
                            )}
                          </div>

                          {task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {task.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <Button variant="outline" onClick={() => handleViewTask(task)} className="text-sm">
                          View Details
                        </Button>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            onClick={() => handleApproval(task.id, false)}
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reopen
                          </Button>
                          <Button
                            onClick={() => handleApproval(task.id, true)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve & Close
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskDetailDialog
          task={selectedTask}
          open={showDetailDialog}
          onOpenChange={setShowDetailDialog}
          onTaskUpdate={updateTask}
          onTaskDelete={deleteTask}
          userRole={user.role}
          currentUserId={user.id}
          getPriorityColor={getPriorityColor}
          getStatusColor={getStatusColor}
        />
      )}
    </DashboardLayout>
  )
}
