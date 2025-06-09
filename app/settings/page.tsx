"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { useTheme } from "@/lib/theme"
import { useToast } from "@/components/ui/use-toast"
import { User, Bell, Shield, Palette, Download, Trash2, Save } from "lucide-react"

export default function SettingsPage() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  // User Preferences State
  const [userSettings, setUserSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    taskReminders: true,
    weeklyDigest: true,
    autoAssignTasks: false,
    defaultPriority: "medium",
    timeZone: "UTC",
    dateFormat: "MM/dd/yyyy",
    workingHours: {
      start: "09:00",
      end: "17:00",
    },
  })

  // System Settings State (Manager only)
  const [systemSettings, setSystemSettings] = useState({
    allowSelfAssignment: true,
    requireApproval: true,
    autoCloseInactive: false,
    inactiveDays: 30,
  })

  const handleSaveUserSettings = () => {
    // In a real app, this would save to backend
    localStorage.setItem("userSettings", JSON.stringify(userSettings))
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
      variant: "success",
    })
  }

  const handleSaveSystemSettings = () => {
    // In a real app, this would save to backend
    localStorage.setItem("systemSettings", JSON.stringify(systemSettings))
    toast({
      title: "System settings updated",
      description: "System configuration has been saved successfully.",
      variant: "success",
    })
  }

  const handleExportData = () => {
    // Mock export functionality
    const data = {
      tasks: JSON.parse(localStorage.getItem("tasks") || "[]"),
      userSettings,
      exportDate: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bug-tracker-export-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Data exported",
      description: "Your data has been exported successfully.",
      variant: "success",
    })
  }

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      localStorage.removeItem("tasks")
      localStorage.removeItem("userSettings")
      localStorage.removeItem("systemSettings")

      toast({
        title: "Data cleared",
        description: "All application data has been cleared.",
        variant: "success",
      })

      // Reload page to reset state
      window.location.reload()
    }
  }

  if (!user) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and system configuration.</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
            {user.role === "manager" && (
              <TabsTrigger value="system" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                System
              </TabsTrigger>
            )}
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal information and preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" defaultValue={user.name} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" defaultValue={user.email} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Time Zone</Label>
                      <Select
                        value={userSettings.timeZone}
                        onValueChange={(value) => setUserSettings({ ...userSettings, timeZone: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="EST">Eastern Time</SelectItem>
                          <SelectItem value="PST">Pacific Time</SelectItem>
                          <SelectItem value="GMT">Greenwich Mean Time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <Select
                        value={userSettings.dateFormat}
                        onValueChange={(value) => setUserSettings({ ...userSettings, dateFormat: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                          <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                          <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Working Hours</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={userSettings.workingHours.start}
                          onChange={(e) =>
                            setUserSettings({
                              ...userSettings,
                              workingHours: { ...userSettings.workingHours, start: e.target.value },
                            })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endTime">End Time</Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={userSettings.workingHours.end}
                          onChange={(e) =>
                            setUserSettings({
                              ...userSettings,
                              workingHours: { ...userSettings.workingHours, end: e.target.value },
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleSaveUserSettings}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified about updates.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive email updates about task changes</p>
                    </div>
                    <Switch
                      checked={userSettings.emailNotifications}
                      onCheckedChange={(checked) => setUserSettings({ ...userSettings, emailNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Get browser notifications for urgent tasks</p>
                    </div>
                    <Switch
                      checked={userSettings.pushNotifications}
                      onCheckedChange={(checked) => setUserSettings({ ...userSettings, pushNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Task Reminders</Label>
                      <p className="text-sm text-muted-foreground">Remind me about upcoming due dates</p>
                    </div>
                    <Switch
                      checked={userSettings.taskReminders}
                      onCheckedChange={(checked) => setUserSettings({ ...userSettings, taskReminders: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Digest</Label>
                      <p className="text-sm text-muted-foreground">Get a weekly summary of your tasks</p>
                    </div>
                    <Switch
                      checked={userSettings.weeklyDigest}
                      onCheckedChange={(checked) => setUserSettings({ ...userSettings, weeklyDigest: checked })}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveUserSettings}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the application.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">Choose your preferred theme or use system setting</p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Default Task Priority</Label>
                    <Select
                      value={userSettings.defaultPriority}
                      onValueChange={(value) => setUserSettings({ ...userSettings, defaultPriority: value })}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">Default priority when creating new tasks</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveUserSettings}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Appearance
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings (Manager Only) */}
          {user.role === "manager" && (
            <TabsContent value="system">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Configuration</CardTitle>
                    <CardDescription>Manage system-wide settings and policies.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Allow Self-Assignment</Label>
                          <p className="text-sm text-muted-foreground">Let developers assign tasks to themselves</p>
                        </div>
                        <Switch
                          checked={systemSettings.allowSelfAssignment}
                          onCheckedChange={(checked) =>
                            setSystemSettings({ ...systemSettings, allowSelfAssignment: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Require Approval</Label>
                          <p className="text-sm text-muted-foreground">Tasks must be approved before closing</p>
                        </div>
                        <Switch
                          checked={systemSettings.requireApproval}
                          onCheckedChange={(checked) =>
                            setSystemSettings({ ...systemSettings, requireApproval: checked })
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Auto-close Inactive Tasks</Label>
                          <p className="text-sm text-muted-foreground">Automatically close tasks after inactivity</p>
                        </div>
                        <Switch
                          checked={systemSettings.autoCloseInactive}
                          onCheckedChange={(checked) =>
                            setSystemSettings({ ...systemSettings, autoCloseInactive: checked })
                          }
                        />
                      </div>

                      {systemSettings.autoCloseInactive && (
                        <div className="ml-6 space-y-2">
                          <Label htmlFor="inactiveDays">Days of inactivity</Label>
                          <Input
                            id="inactiveDays"
                            type="number"
                            min="1"
                            max="365"
                            value={systemSettings.inactiveDays}
                            onChange={(e) =>
                              setSystemSettings({
                                ...systemSettings,
                                inactiveDays: Number.parseInt(e.target.value) || 30,
                              })
                            }
                            className="w-[100px]"
                          />
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="flex justify-end">
                      <Button onClick={handleSaveSystemSettings}>
                        <Save className="mr-2 h-4 w-4" />
                        Save System Settings
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                    <CardDescription>Export, import, or clear application data.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label>Export Data</Label>
                          <p className="text-sm text-muted-foreground">Download all tasks and settings as JSON</p>
                        </div>
                        <Button variant="outline" onClick={handleExportData}>
                          <Download className="mr-2 h-4 w-4" />
                          Export
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label>Clear All Data</Label>
                          <p className="text-sm text-muted-foreground text-red-600">
                            Permanently delete all tasks and settings
                          </p>
                        </div>
                        <Button variant="destructive" onClick={handleClearData}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Clear Data
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
