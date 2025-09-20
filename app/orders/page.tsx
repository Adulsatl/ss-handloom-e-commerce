"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useApp } from "@/contexts/app-context"
import { Package, Eye, Star } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import Link from "next/link"

export default function OrdersPage() {
  const { user } = useAuth()
  const { state } = useApp()

  const userOrders = state.orders.filter((order) => order.customer_email === user?.email)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
            <p className="text-gray-600">Track and manage your orders</p>
          </div>

          {userOrders.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
                <p className="text-gray-600 mb-6">
                  You haven't placed any orders yet. Start shopping to see your orders here!
                </p>
                <Button className="bg-yellow-500 hover:bg-yellow-600" asChild>
                  <Link href="/products">Start Shopping</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {userOrders.map((order) => (
                <Card key={order.id} className="hover-lift">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-semibold">{order.id}</h3>
                          <Badge className={getStatusColor(order.status)}>{order.status.toUpperCase()}</Badge>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-600">Order Date</p>
                            <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="font-medium">₹{order.total}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Payment Method</p>
                            <p className="font-medium">{order.payment_method.toUpperCase()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Items</p>
                            <p className="font-medium">{order.items.length} item(s)</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Items:</p>
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <span>
                                {item.product_name} x {item.quantity}
                              </span>
                              <span className="font-medium">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/orders/${order.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Link>
                        </Button>
                        {order.status === "delivered" && (
                          <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600">
                            <Star className="w-4 h-4 mr-2" />
                            Write Review
                          </Button>
                        )}
                        {order.status === "shipped" && order.tracking_number && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/orders/${order.id}`}>Track Package</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
