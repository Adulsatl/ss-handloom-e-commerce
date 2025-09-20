"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type User, authenticateUser, users } from "@/lib/auth-simple"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string, phone: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const authenticatedUser = authenticateUser(email, password)
      if (authenticatedUser) {
        setUser(authenticatedUser)
        localStorage.setItem("user", JSON.stringify(authenticatedUser))
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const register = async (email: string, password: string, name: string, phone: string): Promise<boolean> => {
    try {
      // Check if user already exists
      const existingUser = users.find((u) => u.email === email)
      if (existingUser) {
        return false
      }

      // Create new user
      const newUser: User = {
        id: `user_${Date.now()}`,
        email,
        name,
        role: "customer",
      }

      // Add to users array (in a real app, this would be an API call)
      users.push(newUser)

      // Store user data (in a real app, you'd also store password securely)
      const userData = { ...newUser, phone, password }
      localStorage.setItem(`user_${email}`, JSON.stringify(userData))

      // Log the user in
      setUser(newUser)
      localStorage.setItem("user", JSON.stringify(newUser))

      return true
    } catch (error) {
      console.error("Registration error:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
