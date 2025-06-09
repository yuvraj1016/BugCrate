"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bug,
  ChevronsLeft,
  ChevronsRight,
  ClipboardList,
  LayoutDashboard,
  Kanban,
  CheckCircle,
  LogOut,
} from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  disabled?: boolean
  external?: boolean
  managerOnly?: boolean
}

interface SidebarProps {
  mobile?: boolean
  onNavItemClick?: () => void
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Tasks",
    href: "/tasks",
    icon: ClipboardList,
  },
  {
    title: "Kanban Board",
    href: "/kanban",
    icon: Kanban,
  },
  {
    title: "Approvals",
    href: "/approvals",
    icon: CheckCircle,
    managerOnly: true,
  },
]

export function Sidebar({ mobile = false, onNavItemClick }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  if (!user) return null

  const filteredNavItems = navItems.filter((item) => !item.managerOnly || user.role === "manager")

  return (
    <div
      className={cn(
        "relative h-screen border-r bg-background p-4 pt-0",
        mobile ? "w-full" : isCollapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-16 items-center justify-between">
        <Link
          href="/dashboard"
          className={cn("flex items-center gap-2", isCollapsed && !mobile && "justify-center")}
          onClick={onNavItemClick}
        >
          <Bug className="h-6 w-6 text-primary" />
          {(!isCollapsed || mobile) && <span className="text-lg font-bold">BugCrate</span>}
        </Link>
        {!mobile && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            <span className="sr-only">Toggle Sidebar</span>
          </Button>
        )}
      </div>

      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="space-y-1 py-4">
          {filteredNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavItemClick}
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                pathname === item.href ? "bg-accent text-accent-foreground" : "transparent",
                isCollapsed && !mobile ? "justify-center" : "justify-start",
              )}
            >
              <item.icon className={cn("h-5 w-5", isCollapsed && !mobile ? "mr-0" : "mr-3")} />
              {(!isCollapsed || mobile) && <span>{item.title}</span>}
            </Link>
          ))}
        </div>
      </ScrollArea>

      {/* User Profile Section */}
      {(!isCollapsed || mobile) && (
        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <Link href="/profile" onClick={onNavItemClick}>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <div className="flex items-center gap-2">
                  <Badge variant={user.role === "manager" ? "default" : "secondary"} className="text-xs">
                    {user.role}
                  </Badge>
                </div>
              </div>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout()
              window.location.href = "/login"
            }}
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      )}
    </div>
  )
}
