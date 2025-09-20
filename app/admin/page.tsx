"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, Activity, Settings } from "lucide-react"
import { useApp } from "@/contexts/app-context"

export default function AdminDashboard() {
  const { state } = useApp()

  // Calculate basic metrics
  const totalRevenue = state.orders.reduce((sum, order) => sum + order.total, 0)
  const totalOrders = state.orders.length
  const totalCustomers = state.customers.length
  const totalProducts = state.products.length

  // Recent orders (last 5)
  const recentOrders = state.orders
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  // Low stock products
  const lowStockProducts = state.products.filter((product) => product.stock < 5)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Welcome to your admin dashboard</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              Total earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {lowStockProducts.length > 0 && <span className="text-red-600">{lowStockProducts.length} low stock</span>}
              {lowStockProducts.length === 0 && "All in stock"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-600">
                      {order.items.length} items • ₹{order.total.toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      order.status === "delivered"
                        ? "bg-green-100 text-green-800"
                        : order.status === "shipped"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "processing"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              ))}
              {recentOrders.length === 0 && <p className="text-gray-500 text-center py-4">No orders yet</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Inventory Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">SKU: {product.id.slice(0, 8)}</p>
                  </div>
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">{product.stock} left</span>
                </div>
              ))}
              {lowStockProducts.length === 0 && (
                <p className="text-green-600 text-center py-4">All products are well stocked!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 border rounded-lg hover:bg-gray-50 text-center">
              <Package className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm">Add Product</span>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50 text-center">
              <ShoppingCart className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm">View Orders</span>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50 text-center">
              <Users className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm">Manage Customers</span>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50 text-center">
              <Settings className="h-6 w-6 mx-auto mb-2" />
              <span className="text-sm">Settings</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
