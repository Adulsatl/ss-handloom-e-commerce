export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "customer"
}

// Export the users array so it can be imported by other modules
export const users: User[] = [
  {
    id: "1",
    email: "admin@ssbalaramapuram.com",
    name: "Admin User",
    role: "admin",
  },
  {
    id: "2",
    email: "customer@example.com",
    name: "Customer User",
    role: "customer",
  },
  {
    id: "3",
    email: "john@example.com",
    name: "John Doe",
    role: "customer",
  },
  {
    id: "4",
    email: "jane@example.com",
    name: "Jane Smith",
    role: "customer",
  },
]

export function authenticateUser(email: string, password: string): User | null {
  // Only allow predefined registered users
  const user = users.find((u) => u.email === email)

  if (!user) {
    return null // User not found in registered users
  }

  // Check against default admin password
  if (email === "admin@ssbalaramapuram.com" && password === "admin123") {
    return user
  }

  // For demo purposes, allow any password with 6+ characters for registered users
  if (password.length >= 6) {
    return user
  }

  return null // Invalid credentials
}

// Add a function to check if user is registered
export function isUserRegistered(email: string): boolean {
  return users.some((u) => u.email === email)
}

// Add a function to get user by email
export function getUserByEmail(email: string): User | null {
  return users.find((u) => u.email === email) || null
}
