"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Clock, User, Calendar, Tag, CheckCircle, AlertCircle } from "lucide-react"
import type { Task, TaskPriority, TaskStatus } from "@/types"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface TaskCardProps {
  task: Task
  onUpdate: (taskId: string, updates: Partial<Task>) => void
  onDelete: (taskId: string) => void
  userRole: "developer" | "manager"
  currentUserId: string
  getPriorityColor: (priority: TaskPriority) => string
  getStatusColor: (status: TaskStatus) => string
  onClick?: () => void
}

export function TaskCard({
  task,
  onUpdate,
  onDelete,
  userRole,
  currentUserId,
  getPriorityColor,
  getStatusColor,
  onClick,
}: TaskCardProps) {
  const totalTimeLogged = task.timeEntries.reduce((total, entry) => total + entry.hours, 0)
  const canEdit = userRole === "manager" || task.assigneeId === currentUserId
  const canClose = userRole === "developer" && task.assigneeId === currentUserId && task.status === "in-progress"
  const canApprove = userRole === "manager" && task.status === "pending-approval"

  const handleStatusChange = (newStatus: TaskStatus) => {
    onUpdate(task.id, { status: newStatus })
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy")
  }

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "closed":
        return <CheckCircle className="h-3 w-3 mr-1" />
      case "pending-approval":
        return <AlertCircle className="h-3 w-3 mr-1" />
      default:
        return null
    }
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "closed"

  return (
    <Card
      className={cn(
        "hover:shadow-md transition-all border-l-4",
        onClick && "cursor-pointer",
        task.status === "closed"
          ? "border-l-green-500"
          : task.status === "pending-approval"
            ? "border-l-purple-500"
            : task.status === "in-progress"
              ? "border-l-yellow-500"
              : task.status === "reopened"
                ? "border-l-orange-500"
                : "border-l-blue-500",
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">{task.title}</h3>
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{task.description}</p>

            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
              <Badge className={getStatusColor(task.status)}>
                <span className="flex items-center">
                  {getStatusIcon(task.status)}
                  {task.status.replace("-", " ")}
                </span>
              </Badge>
              {task.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{task.tags.length - 2}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {task.assigneeName}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {totalTimeLogged}h logged
              </div>
              {task.dueDate && (
                <div className={cn("flex items-center gap-1", isOverdue && "text-red-500")}>
                  <Calendar className="w-3.5 h-3.5" />
                  Due {formatDate(task.dueDate)}
                </div>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canClose && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStatusChange("pending-approval")
                  }}
                >
                  Submit for Approval
                </DropdownMenuItem>
              )}
              {canApprove && (
                <>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStatusChange("closed")
                    }}
                  >
                    Approve Closure
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      handleStatusChange("reopened")
                    }}
                  >
                    Reopen Task
                  </DropdownMenuItem>
                </>
              )}
              {canEdit && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(task.id)
                  }}
                  className="text-red-600"
                >
                  Delete Task
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
