"use client"

import Link from "next/link"
import { useState } from "react"
import { ShoppingCart, User, Menu, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useApp } from "@/contexts/app-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Header() {
  const { user, logout } = useAuth()
  const { state: cartState } = useCart()
  const { state: appState } = useApp()
  const [isOpen, setIsOpen] = useState(false)

  const mainLogo = appState.siteSettings?.logos?.mainLogo || "/placeholder.svg?height=40&width=120"
  const mobileLogo = appState.siteSettings?.logos?.mobileLogo || "/placeholder.svg?height=32&width=32"

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img
              src={mobileLogo || "/placeholder.svg"}
              alt="SS Balaramapuram"
              className="h-8 w-8 rounded-full sm:hidden"
            />
            <img
              src={mainLogo || "/placeholder.svg"}
              alt="SS Balaramapuram Handlooms"
              className="hidden sm:block h-8 max-w-[200px] object-contain"
            />
            <span className="text-lg md:text-xl font-bold text-gray-900 sm:hidden">SS</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/products" className="text-gray-700 hover:text-yellow-600 transition-colors">
              Products
            </Link>
            <Link href="/categories" className="text-gray-700 hover:text-yellow-600 transition-colors">
              Categories
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-yellow-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-yellow-600 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>

            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartState.itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs bg-yellow-500 hover:bg-yellow-600">
                    {cartState.itemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders">My Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin Panel</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={logout}>Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button className="bg-yellow-500 hover:bg-yellow-600" asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex items-center space-x-2 mb-8">
                  <img src={mobileLogo || "/placeholder.svg"} alt="SS Balaramapuram" className="h-8 w-8 rounded-full" />
                  <span className="text-xl font-bold text-gray-900">SS Balaramapuram</span>
                </div>
                <nav className="flex flex-col space-y-6">
                  <Link href="/products" className="text-lg font-medium py-2" onClick={() => setIsOpen(false)}>
                    Products
                  </Link>
                  <Link href="/categories" className="text-lg font-medium py-2" onClick={() => setIsOpen(false)}>
                    Categories
                  </Link>
                  <Link href="/about" className="text-lg font-medium py-2" onClick={() => setIsOpen(false)}>
                    About
                  </Link>
                  <Link href="/contact" className="text-lg font-medium py-2" onClick={() => setIsOpen(false)}>
                    Contact
                  </Link>
                  {user && (
                    <>
                      <hr className="my-4" />
                      <Link href="/dashboard" className="text-lg font-medium py-2" onClick={() => setIsOpen(false)}>
                        Dashboard
                      </Link>
                      <Link href="/orders" className="text-lg font-medium py-2" onClick={() => setIsOpen(false)}>
                        My Orders
                      </Link>
                      {user.role === "admin" && (
                        <Link href="/admin" className="text-lg font-medium py-2" onClick={() => setIsOpen(false)}>
                          Admin Panel
                        </Link>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => {
                          logout()
                          setIsOpen(false)
                        }}
                        className="mt-4"
                      >
                        Sign Out
                      </Button>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
