"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Tag, AlertCircle, CheckCircle, RotateCcw } from "lucide-react"
import type { Task, TaskPriority, TaskStatus } from "@/types"
import { EditTaskDialog } from "./edit-task-dialog"
import { TimeTrackingDialog } from "./time-tracking-dialog"
import { TaskComments } from "./task-comments"
import { format, formatDistanceToNow } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { getAllUsers } from "@/lib/auth"

interface TaskDetailDialogProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
  onTaskDelete: (taskId: string) => void
  userRole: "developer" | "manager"
  currentUserId: string
  getPriorityColor: (priority: TaskPriority) => string
  getStatusColor: (status: TaskStatus) => string
}

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
  onTaskUpdate,
  onTaskDelete,
  userRole,
  currentUserId,
  getPriorityColor,
  getStatusColor,
}: TaskDetailDialogProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showTimeDialog, setShowTimeDialog] = useState(false)
  const { toast } = useToast()
  const { user } = useAuth()
  const users = getAllUsers()

  const totalTimeLogged = task.timeEntries.reduce((total, entry) => total + entry.hours, 0)
  const canEdit = userRole === "manager" || task.assigneeId === currentUserId
  const canClose = userRole === "developer" && task.assigneeId === currentUserId && task.status === "in-progress"
  const canApprove = userRole === "manager" && task.status === "pending-approval"

  const assignee = users.find((u) => u.id === task.assigneeId)
  const reporter = users.find((u) => u.id === task.reporterId)

  const handleStatusChange = (newStatus: TaskStatus) => {
    onTaskUpdate(task.id, { status: newStatus })

    const statusMessages = {
      "pending-approval": "Task submitted for approval",
      closed: "Task approved and closed",
      reopened: "Task reopened",
      "in-progress": "Task marked as in progress",
    }

    toast({
      title: statusMessages[newStatus] || "Status updated",
      variant: "success",
    })

    onOpenChange(false)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy")
  }

  // Mock comments for demonstration
  const [comments, setComments] = useState([
    {
      id: "1",
      taskId: task.id,
      userId: "2",
      userName: "Suraj Shikhar",
      userAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      content: "Please check the authentication service logs for any errors.",
      createdAt: "2025-05-16T15:30:00Z",
    },
    {
      id: "2",
      taskId: task.id,
      userId: "1",
      userName: "Yuvraj Singh",
      userAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      content: "Found the issue in the auth middleware. Working on a fix now.",
      createdAt: "2025-05-16T16:45:00Z",
    },
  ])

  const handleAddComment = (taskId: string, comment: any) => {
    const newComment = {
      ...comment,
      id: Date.now().toString(),
      taskId,
      createdAt: new Date().toISOString(),
    }
    setComments([...comments, newComment])

    toast({
      title: "Comment added",
      description: "Your comment has been added to the task.",
      variant: "success",
    })
  }

  const getStatusActionButton = () => {
    if (canClose) {
      return (
        <Button onClick={() => handleStatusChange("pending-approval")} className="gap-2">
          <AlertCircle className="h-4 w-4" />
          Submit for Approval
        </Button>
      )
    }

    if (canApprove) {
      return (
        <div className="flex gap-2">
          <Button onClick={() => handleStatusChange("closed")} variant="default" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            Approve & Close
          </Button>
          <Button onClick={() => handleStatusChange("reopened")} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reopen
          </Button>
        </div>
      )
    }

    return null
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
              <Badge className={getStatusColor(task.status)}>{task.status.replace("-", " ")}</Badge>
            </div>
            <DialogTitle className="text-xl">{task.title}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-wrap gap-2 mt-2 mb-4">
            {task.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>

          <Tabs defaultValue="details" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="time">Time Tracking</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                  <p className="whitespace-pre-wrap">{task.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Assignee</h3>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={assignee?.avatar || "/placeholder.svg"} alt={task.assigneeName} />
                        <AvatarFallback>
                          {task.assigneeName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span>{task.assigneeName}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Reporter</h3>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={reporter?.avatar || "/placeholder.svg"} alt={task.reporterName} />
                        <AvatarFallback>
                          {task.reporterName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span>{task.reporterName}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Created</h3>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(task.createdAt)}</span>
                    </div>
                  </div>

                  {task.dueDate && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Due Date</h3>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{formatDate(task.dueDate)}</span>
                        {new Date(task.dueDate) < new Date() && task.status !== "closed" && (
                          <Badge variant="destructive" className="ml-2">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Time Logged</h3>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{totalTimeLogged} hours</span>
                    </div>
                  </div>

                  {task.estimatedHours && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Estimated</h3>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{task.estimatedHours} hours</span>
                        {totalTimeLogged > task.estimatedHours && (
                          <Badge variant="outline" className="ml-2 text-amber-600 border-amber-600">
                            {Math.round((totalTimeLogged / task.estimatedHours - 1) * 100)}% over estimate
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex flex-wrap gap-2 justify-between">
                  <div className="flex gap-2">
                    {canEdit && (
                      <Button variant="outline" onClick={() => setShowEditDialog(true)}>
                        Edit Task
                      </Button>
                    )}
                    <Button variant="outline" onClick={() => setShowTimeDialog(true)}>
                      Log Time
                    </Button>
                  </div>

                  {getStatusActionButton()}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comments" className="pt-4">
              <TaskComments taskId={task.id} comments={comments} onAddComment={handleAddComment} />
            </TabsContent>

            <TabsContent value="time" className="pt-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Time Entries</h3>
                  <Button size="sm" onClick={() => setShowTimeDialog(true)}>
                    Log Time
                  </Button>
                </div>

                {task.timeEntries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border rounded-md">
                    No time entries logged yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {task.timeEntries
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((entry) => {
                        const entryUser = users.find((u) => u.id === entry.userId)
                        return (
                          <div key={entry.id} className="flex items-start justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={entryUser?.avatar || "/placeholder.svg"} alt={entry.userName} />
                                  <AvatarFallback>
                                    {entry.userName
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-sm">{entry.userName}</span>
                                <span className="text-muted-foreground text-xs">•</span>
                                <span className="text-muted-foreground text-xs">
                                  {formatDistanceToNow(new Date(entry.date), { addSuffix: true })}
                                </span>
                              </div>
                              {entry.description && (
                                <p className="text-sm text-muted-foreground mb-1">{entry.description}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-sm font-medium">
                              <Clock className="h-4 w-4" />
                              {entry.hours}h
                            </div>
                          </div>
                        )
                      })}

                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm text-muted-foreground">Total Time Logged</span>
                      <span className="font-medium">{totalTimeLogged} hours</span>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <EditTaskDialog task={task} open={showEditDialog} onOpenChange={setShowEditDialog} onTaskUpdate={onTaskUpdate} />

      <TimeTrackingDialog
        task={task}
        open={showTimeDialog}
        onOpenChange={setShowTimeDialog}
        currentUserId={currentUserId}
        onTimeEntryAdd={(taskId, timeEntry) => {
          const updatedTask = {
            ...task,
            timeEntries: [
              ...task.timeEntries,
              {
                ...timeEntry,
                id: Date.now().toString(),
                taskId,
                createdAt: new Date().toISOString(),
              },
            ],
          }
          onTaskUpdate(taskId, updatedTask)
        }}
      />
    </>
  )
}
