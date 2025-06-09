import type { User } from "@/types"

const MOCK_USERS: User[] = [
  {
    id: "1",
    email: "yuvi@company.com",
    name: "Yuvraj Singh",
    role: "developer",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "2",
    email: "suraj@company.com",
    name: "Suraj Shikhar",
    role: "manager",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
  },
  {
    id: "3",
    email: "aman@company.com",
    name: "Aman Kumar",
    role: "developer",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  },
]

export const authenticateUser = async (email: string, password: string): Promise<User | null> => {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const user = MOCK_USERS.find((u) => u.email === email)
  if (user && password === "password") {
    return user
  }
  return null
}

export const getCurrentUser = (): User | null => {
  if (typeof window === "undefined") return null

  const userData = localStorage.getItem("currentUser")
  return userData ? JSON.parse(userData) : null
}

export const setCurrentUser = (user: User | null) => {
  if (typeof window === "undefined") return

  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user))
  } else {
    localStorage.removeItem("currentUser")
  }
}

export const getAllUsers = (): User[] => {
  return MOCK_USERS
}
