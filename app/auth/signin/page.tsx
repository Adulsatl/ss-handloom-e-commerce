"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const success = await login(email, password)

      if (success) {
        // Check if admin user
        if (email === "admin@ssbalaramapuram.com") {
          router.push("/admin")
        } else {
          router.push("/")
        }
      } else {
        setError("Invalid credentials")
      }
    } catch (error) {
      setError("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600"></div>
            <span className="text-xl font-bold text-gray-900">SS Balaramapuram</span>
          </div>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p className="font-semibold mb-2">Demo credentials (Registered Users Only):</p>
            <div className="bg-gray-50 p-3 rounded-lg text-left space-y-2">
              <div>
                <p>
                  <strong>Admin:</strong> admin@ssbalaramapuram.com
                </p>
                <p>
                  <strong>Password:</strong> admin123
                </p>
              </div>
              <hr className="my-2" />
              <div>
                <p>
                  <strong>Customer 1:</strong> customer@example.com
                </p>
                <p>
                  <strong>Customer 2:</strong> john@example.com
                </p>
                <p>
                  <strong>Customer 3:</strong> jane@example.com
                </p>
                <p>
                  <strong>Password:</strong> any password (6+ chars)
                </p>
              </div>
              <div className="text-xs text-red-600 mt-2">
                <p>⚠️ Only registered users can sign in</p>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-yellow-600 hover:text-yellow-700">
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
