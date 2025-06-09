"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bug, Clock, CheckCircle, AlertCircle, Timer, Activity } from "lucide-react"
import type { DashboardStats } from "@/types"
import { cn } from "@/lib/utils"

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Tasks",
      value: stats.totalTasks,
      icon: Bug,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
      change: "+5% from last week",
      trend: "up",
    },
    {
      title: "Open Tasks",
      value: stats.openTasks,
      icon: AlertCircle,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
      change: "-2% from last week",
      trend: "down",
    },
    {
      title: "In Progress",
      value: stats.inProgressTasks,
      icon: Activity,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
      change: "+3% from last week",
      trend: "up",
    },
    {
      title: "Pending Approval",
      value: stats.pendingApprovalTasks,
      icon: Timer,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      change: "No change",
      trend: "neutral",
    },
    {
      title: "Completed",
      value: stats.closedTasks,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      change: "+8% from last week",
      trend: "up",
    },
    {
      title: "Time Logged",
      value: `${stats.totalTimeLogged}h`,
      icon: Clock,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
      change: "+12% from last week",
      trend: "up",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={cn("p-2 rounded-full", card.bgColor)}>
              <card.icon className={cn("h-4 w-4", card.color)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              {card.trend === "up" && <span className="text-green-500 mr-1">↑</span>}
              {card.trend === "down" && <span className="text-red-500 mr-1">↓</span>}
              {card.change}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
