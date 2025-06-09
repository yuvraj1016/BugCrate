"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, User } from "lucide-react"
import type { Task, TimeEntry } from "@/types"
import { useAuth } from "@/contexts/auth-context"

interface TimeTrackingDialogProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
  currentUserId: string
  onTimeEntryAdd: (taskId: string, timeEntry: Omit<TimeEntry, "id" | "taskId" | "createdAt">) => void
}

export function TimeTrackingDialog({
  task,
  open,
  onOpenChange,
  currentUserId,
  onTimeEntryAdd,
}: TimeTrackingDialogProps) {
  const [formData, setFormData] = useState({
    description: "",
    hours: "",
    date: new Date().toISOString().split("T")[0],
  })

  const { user } = useAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !formData.hours || Number.parseFloat(formData.hours) <= 0) return

    const timeEntry = {
      userId: currentUserId,
      userName: user.name,
      description: formData.description,
      hours: Number.parseFloat(formData.hours),
      date: formData.date,
    }

    onTimeEntryAdd(task.id, timeEntry)

    // Reset form
    setFormData({
      description: "",
      hours: "",
      date: new Date().toISOString().split("T")[0],
    })

    onOpenChange(false)
  }

  const totalTimeLogged = task.timeEntries.reduce((total, entry) => total + entry.hours, 0)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Time Tracking - {task.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Log New Time */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Log Time</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hours">Hours *</Label>
                    <Input
                      id="hours"
                      type="number"
                      min="0.25"
                      step="0.25"
                      value={formData.hours}
                      onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                      placeholder="2.5"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What did you work on?"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Log Time</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Time Entries History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Time Entries ({totalTimeLogged}h total)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {task.timeEntries.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No time entries logged yet.</p>
              ) : (
                <div className="space-y-3">
                  {task.timeEntries
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((entry) => (
                      <div key={entry.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-sm">{entry.userName}</span>
                            <span className="text-gray-500 text-sm">•</span>
                            <span className="text-gray-500 text-sm">{formatDate(entry.date)}</span>
                          </div>
                          {entry.description && <p className="text-sm text-gray-600 mb-1">{entry.description}</p>}
                        </div>
                        <div className="flex items-center gap-1 text-sm font-medium">
                          <Clock className="w-4 h-4" />
                          {entry.hours}h
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
