"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Tag,
  Truck,
  RotateCcw,
  Star,
  Bell,
  Bug,
  ImageIcon,
} from "lucide-react"

const sidebarItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: Tag },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Shipping", href: "/admin/shipping", icon: Truck },
  { name: "Returns", href: "/admin/returns", icon: RotateCcw },
  { name: "Reviews", href: "/admin/reviews", icon: Star },
  { name: "Media", href: "/admin/media", icon: ImageIcon },
  { name: "Notifications", href: "/admin/notifications", icon: Bell },
  { name: "Debug", href: "/admin/debug", icon: Bug },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
      </div>
      <nav className="mt-6">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-yellow-50 text-yellow-700 border-r-2 border-yellow-500"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {/* @ts-expect-error */}
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

// Also export as default for backward compatibility
export default AdminSidebar
