"use client"

import { useState, useEffect } from "react"
import type { Task, TaskStatus } from "@/types"
import { getTasks, saveTasks } from "@/lib/data"

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTasks = () => {
      const loadedTasks = getTasks()
      setTasks(loadedTasks)
      setIsLoading(false)
    }

    loadTasks()
  }, [])

  const createTask = (taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "timeEntries">) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeEntries: [],
    }

    const updatedTasks = [...tasks, newTask]
    setTasks(updatedTasks)
    saveTasks(updatedTasks)
    return newTask
  }

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task,
    )
    setTasks(updatedTasks)
    saveTasks(updatedTasks)
  }

  const deleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId)
    setTasks(updatedTasks)
    saveTasks(updatedTasks)
  }

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    updateTask(taskId, { status })
  }

  const addTimeEntry = (
    taskId: string,
    timeEntry: Omit<import("@/types").TimeEntry, "id" | "taskId" | "createdAt">,
  ) => {
    const newTimeEntry = {
      ...timeEntry,
      id: Date.now().toString(),
      taskId,
      createdAt: new Date().toISOString(),
    }

    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, timeEntries: [...task.timeEntries, newTimeEntry] } : task,
    )

    setTasks(updatedTasks)
    saveTasks(updatedTasks)
  }

  return {
    tasks,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    addTimeEntry,
  }
}
