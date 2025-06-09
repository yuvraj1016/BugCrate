"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { TrendData } from "@/types"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TrendChartProps {
  data: TrendData[]
}

export function TrendChart({ data }: TrendChartProps) {
  const [activeView, setActiveView] = useState<"week" | "month">("week")

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Task Trends</CardTitle>
          <CardDescription>Daily task activity and time logged</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className={cn(activeView === "week" && "bg-primary text-primary-foreground")}
            onClick={() => setActiveView("week")}
          >
            Week
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={cn(activeView === "month" && "bg-primary text-primary-foreground")}
            onClick={() => setActiveView("month")}
          >
            Month
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#888" opacity={0.2} />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              stroke="#888"
              fontSize={12}
            />
            <YAxis yAxisId="left" stroke="#888" fontSize={12} />
            <YAxis yAxisId="right" orientation="right" stroke="#888" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
                borderRadius: "0.5rem",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
              }}
              labelFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="tasks"
              stroke="#8884d8"
              strokeWidth={2}
              name="Tasks Worked"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="timeLogged"
              stroke="#82ca9d"
              strokeWidth={2}
              name="Hours Logged"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
