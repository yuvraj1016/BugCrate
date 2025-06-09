"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Plus, Download, Calendar, Clock, User, Tag, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import { useTasks } from "@/hooks/use-tasks"
import { useAuth } from "@/contexts/auth-context"
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog"
import { EditTaskDialog } from "@/components/tasks/edit-task-dialog"
import { TaskDetailDialog } from "@/components/tasks/task-detail-dialog"
import { TimeTrackingDialog } from "@/components/tasks/time-tracking-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import type { Task, TaskPriority, TaskStatus } from "@/types"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export default function TasksPage() {
  const { user } = useAuth()
  const { tasks, createTask, updateTask, deleteTask, isLoading } = useTasks()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all")
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"updated" | "priority" | "created" | "dueDate">("updated")
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showTimeDialog, setShowTimeDialog] = useState(false)

  if (!user) return null

  // Filter tasks based on user role
  const userTasks = user.role === "manager" ? tasks : tasks.filter((task) => task.assigneeId === user.id)

  // Apply filters
  const filteredTasks = userTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
    const matchesAssignee = assigneeFilter === "all" || task.assigneeId === assigneeFilter

    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee
  })

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case "updated":
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      case "created":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case "priority":
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      case "dueDate":
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      default:
        return 0
    }
  })

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
      case "open":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "pending-approval":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      case "closed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "reopened":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  // Get unique assignees for filter
  const assignees = Array.from(new Set(tasks.map((task) => task.assigneeId))).map((id) => {
    const task = tasks.find((t) => t.assigneeId === id)
    return { id, name: task?.assigneeName || "" }
  })

  const handleTaskAction = (action: string, task: Task) => {
    setSelectedTask(task)
    switch (action) {
      case "view":
        setShowDetailDialog(true)
        break
      case "edit":
        setShowEditDialog(true)
        break
      case "time":
        setShowTimeDialog(true)
        break
      case "delete":
        if (confirm("Are you sure you want to delete this task?")) {
          deleteTask(task.id)
          toast({
            title: "Task deleted",
            description: "The task has been successfully deleted.",
            variant: "success",
          })
        }
        break
    }
  }

  const exportTasks = () => {
    const csvContent = [
      ["Title", "Status", "Priority", "Assignee", "Created", "Due Date", "Time Logged"].join(","),
      ...sortedTasks.map((task) =>
        [
          `"${task.title}"`,
          task.status,
          task.priority,
          task.assigneeName,
          format(new Date(task.createdAt), "yyyy-MM-dd"),
          task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : "",
          task.timeEntries.reduce((total, entry) => total + entry.hours, 0),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tasks-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export completed",
      description: "Tasks have been exported to CSV file.",
      variant: "success",
    })
  }

  const TaskCard = ({ task }: { task: Task }) => {
    const totalTimeLogged = task.timeEntries.reduce((total, entry) => total + entry.hours, 0)
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "closed"

    return (
      <Card className="hover:shadow-md transition-all cursor-pointer" onClick={() => handleTaskAction("view", task)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-base mb-2 line-clamp-2">{task.title}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.description}</p>

              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                <Badge className={getStatusColor(task.status)}>{task.status.replace("-", " ")}</Badge>
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

              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {task.assigneeName}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {totalTimeLogged}h
                </div>
                {task.dueDate && (
                  <div className={cn("flex items-center gap-1", isOverdue && "text-red-500")}>
                    <Calendar className="w-3 h-3" />
                    {format(new Date(task.dueDate), "MMM d")}
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
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTaskAction("view", task)
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTaskAction("edit", task)
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTaskAction("time", task)
                  }}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Log Time
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTaskAction("delete", task)
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    )
  }

  const TaskRow = ({ task }: { task: Task }) => {
    const totalTimeLogged = task.timeEntries.reduce((total, entry) => total + entry.hours, 0)
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "closed"

    return (
      <div
        className="flex items-center p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors"
        onClick={() => handleTaskAction("view", task)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-medium truncate">{task.title}</h3>
            <div className="flex gap-2">
              <Badge className={getPriorityColor(task.priority)} size="sm">
                {task.priority}
              </Badge>
              <Badge className={getStatusColor(task.status)} size="sm">
                {task.status.replace("-", " ")}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{task.description}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Avatar className="h-4 w-4">
                <AvatarFallback className="text-xs">
                  {task.assigneeName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {task.assigneeName}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {totalTimeLogged}h
            </div>
            {task.dueDate && (
              <div className={cn("flex items-center gap-1", isOverdue && "text-red-500")}>
                <Calendar className="w-3 h-3" />
                {format(new Date(task.dueDate), "MMM d, yyyy")}
              </div>
            )}
            <div className="flex gap-1">
              {task.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                handleTaskAction("view", task)
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                handleTaskAction("edit", task)
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Task
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                handleTaskAction("time", task)
              }}
            >
              <Clock className="mr-2 h-4 w-4" />
              Log Time
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                handleTaskAction("delete", task)
              }}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Tasks</h1>
            <p className="text-muted-foreground">Manage and track all your tasks and bugs in one place.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportTasks}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search tasks, descriptions, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TaskStatus | "all")}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="pending-approval">Pending Approval</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="reopened">Reopened</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={priorityFilter}
                  onValueChange={(value) => setPriorityFilter(value as TaskPriority | "all")}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>

                {user.role === "manager" && (
                  <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Assignees</SelectItem>
                      {assignees.map((assignee) => (
                        <SelectItem key={assignee.id} value={assignee.id}>
                          {assignee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated">Last Updated</SelectItem>
                    <SelectItem value="created">Date Created</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="dueDate">Due Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "grid")}>
              <div className="flex items-center justify-between px-6 py-2 border-b">
                <TabsList>
                  <TabsTrigger value="list">List View</TabsTrigger>
                  <TabsTrigger value="grid">Grid View</TabsTrigger>
                </TabsList>
                <div className="text-sm text-muted-foreground">
                  {sortedTasks.length} of {userTasks.length} tasks
                </div>
              </div>

              <TabsContent value="list" className="mt-0">
                {isLoading ? (
                  <div className="space-y-1">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <div key={i} className="flex items-center p-4 border-b">
                          <div className="flex-1">
                            <Skeleton className="h-5 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-full mb-2" />
                            <div className="flex gap-2">
                              <Skeleton className="h-4 w-16" />
                              <Skeleton className="h-4 w-20" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                          </div>
                          <Skeleton className="h-8 w-8" />
                        </div>
                      ))}
                  </div>
                ) : sortedTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium mb-2">No tasks found</h3>
                    <p className="text-muted-foreground mb-6">
                      {searchTerm || statusFilter !== "all" || priorityFilter !== "all" || assigneeFilter !== "all"
                        ? "No tasks match your current filters."
                        : "Get started by creating your first task."}
                    </p>
                    {(searchTerm || statusFilter !== "all" || priorityFilter !== "all" || assigneeFilter !== "all") && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm("")
                          setStatusFilter("all")
                          setPriorityFilter("all")
                          setAssigneeFilter("all")
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                ) : (
                  <div>
                    {sortedTasks.map((task) => (
                      <TaskRow key={task.id} task={task} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="grid" className="mt-0 p-6">
                {isLoading ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array(6)
                      .fill(0)
                      .map((_, i) => (
                        <Card key={i}>
                          <CardContent className="p-4">
                            <Skeleton className="h-5 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-full mb-3" />
                            <div className="flex gap-2 mb-3">
                              <Skeleton className="h-5 w-16 rounded-full" />
                              <Skeleton className="h-5 w-20 rounded-full" />
                            </div>
                            <div className="flex gap-2">
                              <Skeleton className="h-4 w-20" />
                              <Skeleton className="h-4 w-16" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                ) : sortedTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium mb-2">No tasks found</h3>
                    <p className="text-muted-foreground mb-6">
                      {searchTerm || statusFilter !== "all" || priorityFilter !== "all" || assigneeFilter !== "all"
                        ? "No tasks match your current filters."
                        : "Get started by creating your first task."}
                    </p>
                    {(searchTerm || statusFilter !== "all" || priorityFilter !== "all" || assigneeFilter !== "all") && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm("")
                          setStatusFilter("all")
                          setPriorityFilter("all")
                          setAssigneeFilter("all")
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sortedTasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
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
