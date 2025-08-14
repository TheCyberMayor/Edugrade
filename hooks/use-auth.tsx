"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

export type UserRole = "admin" | "lecturer" | "student"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role: UserRole) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for demo purposes
const mockUsers: Record<string, { password: string; user: User }> = {
  "admin@school.edu": {
    password: "admin123",
    user: { id: "1", name: "Admin User", email: "admin@school.edu", role: "admin" },
  },
  "lecturer@school.edu": {
    password: "lecturer123",
    user: { id: "2", name: "Dr. Smith", email: "lecturer@school.edu", role: "lecturer" },
  },
  "student@school.edu": {
    password: "student123",
    user: { id: "3", name: "John Doe", email: "student@school.edu", role: "student" },
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = async (email: string, password: string, role: UserRole) => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const mockUser = mockUsers[email]
    if (!mockUser || mockUser.password !== password || mockUser.user.role !== role) {
      setIsLoading(false)
      throw new Error("Invalid credentials")
    }

    setUser(mockUser.user)
    localStorage.setItem("user", JSON.stringify(mockUser.user))
    setIsLoading(false)

    // Redirect based on role
    switch (role) {
      case "admin":
        router.push("/admin")
        break
      case "lecturer":
        router.push("/lecturer")
        break
      case "student":
        router.push("/student")
        break
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    router.push("/")
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
