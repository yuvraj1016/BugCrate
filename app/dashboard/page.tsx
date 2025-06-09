"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { TrendChart } from "@/components/dashboard/trend-chart"
import { TaskList } from "@/components/tasks/task-list"
import { useTasks } from "@/hooks/use-tasks"
import { getDashboardStats, getTrendData } from "@/lib/data"
import { useAuth } from "@/contexts/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TaskDetailDialog } from "@/components/tasks/task-detail-dialog"
import type { Task, TaskPriority, TaskStatus } from "@/types"

export default function DashboardPage() {
  const { user } = useAuth()
  const { tasks, createTask, updateTask, deleteTask, isLoading } = useTasks()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showTaskDetail, setShowTaskDetail] = useState(false)

  if (!user) return null

  const stats = getDashboardStats(user.id, user.role)
  const trendData = getTrendData()

  // Filter tasks based on user role
  const userTasks = user.role === "manager" ? tasks : tasks.filter((task) => task.assigneeId === user.id)

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground">
            {user.role === "manager" ? "Overview of all team tasks and progress" : "Your assigned tasks and progress"}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array(6)
                .fill(0)
                .map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <Skeleton className="h-5 w-20" />
                      <Skeleton className="h-4 w-4 rounded-full" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-8 w-16" />
                    </CardContent>
                  </Card>
                ))}
            </div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-60" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            <StatsCards stats={stats} />

            <div className="grid gap-6 lg:grid-cols-7">
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Task Trends</CardTitle>
                  <CardDescription>Daily task activity and time logged over the past week</CardDescription>
                </CardHeader>
                <CardContent>
                  <TrendChart data={trendData} />
                </CardContent>
              </Card>

              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Task Status</CardTitle>
                  <CardDescription>Distribution of tasks by current status</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="open">Open</TabsTrigger>
                      <TabsTrigger value="closed">Closed</TabsTrigger>
                    </TabsList>
                    <TabsContent value="all" className="pt-4">
                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {userTasks.length === 0 ? (
                          <p className="text-center py-8 text-muted-foreground">No tasks found.</p>
                        ) : (
                          userTasks
                            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                            .slice(0, 5)
                            .map((task) => (
                              <div
                                key={task.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                                onClick={() => {
                                  setSelectedTask(task)
                                  setShowTaskDetail(true)
                                }}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium truncate">{task.title}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}
                                    >
                                      {task.priority}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
                                      {task.status.replace("-", " ")}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="open" className="pt-4">
                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {userTasks.filter((t) => t.status !== "closed").length === 0 ? (
                          <p className="text-center py-8 text-muted-foreground">No open tasks found.</p>
                        ) : (
                          userTasks
                            .filter((t) => t.status !== "closed")
                            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                            .slice(0, 5)
                            .map((task) => (
                              <div
                                key={task.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                                onClick={() => {
                                  setSelectedTask(task)
                                  setShowTaskDetail(true)
                                }}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium truncate">{task.title}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}
                                    >
                                      {task.priority}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
                                      {task.status.replace("-", " ")}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="closed" className="pt-4">
                      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        {userTasks.filter((t) => t.status === "closed").length === 0 ? (
                          <p className="text-center py-8 text-muted-foreground">No closed tasks found.</p>
                        ) : (
                          userTasks
                            .filter((t) => t.status === "closed")
                            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                            .slice(0, 5)
                            .map((task) => (
                              <div
                                key={task.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                                onClick={() => {
                                  setSelectedTask(task)
                                  setShowTaskDetail(true)
                                }}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium truncate">{task.title}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    <span
                                      className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}
                                    >
                                      {task.priority}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
                                      {task.status.replace("-", " ")}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <TaskList
              tasks={userTasks}
              onTaskUpdate={updateTask}
              onTaskDelete={deleteTask}
              onTaskCreate={createTask}
              userRole={user.role}
              currentUserId={user.id}
              onTaskSelect={(task) => {
                setSelectedTask(task)
                setShowTaskDetail(true)
              }}
            />

            {selectedTask && (
              <TaskDetailDialog
                task={selectedTask}
                open={showTaskDetail}
                onOpenChange={setShowTaskDetail}
                onTaskUpdate={updateTask}
                onTaskDelete={deleteTask}
                userRole={user.role}
                currentUserId={user.id}
                getPriorityColor={getPriorityColor}
                getStatusColor={getStatusColor}
              />
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
