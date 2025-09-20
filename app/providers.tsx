"use client"

import type React from "react"
import { Toaster } from "@/components/ui/toaster"
import { CartProvider } from "@/contexts/cart-context"
import { AuthProvider } from "@/contexts/auth-context"
import { AppProvider } from "@/contexts/app-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppProvider>
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </AppProvider>
    </AuthProvider>
  )
}
