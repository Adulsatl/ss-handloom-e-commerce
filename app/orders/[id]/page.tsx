"use client"

import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { useApp } from "@/contexts/app-context"
import { Package, Truck, MapPin, Calendar, ExternalLink, ArrowLeft } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import Link from "next/link"
import { ErrorBoundary } from "@/components/error-boundary"

export default function OrderDetailsPage() {
  const params = useParams()
  const { user } = useAuth()
  const { state } = useApp()
  const orderId = params.id as string

  const order = state.orders.find((o) => o.id === orderId && o.customer_email === user?.email)
  const shipment = state.shipments.find((s) => s.order_id === orderId)

  if (!order) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-white">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h3>
                <p className="text-gray-600 mb-6">
                  The order you're looking for doesn't exist or you don't have access to it.
                </p>
                <Button className="bg-yellow-500 hover:bg-yellow-600" asChild>
                  <Link href="/orders">Back to Orders</Link>
                </Button>
              </CardContent>
            </Card>
          </main>
          <Footer />
        </div>
      </ErrorBoundary>
    )
  }

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

  const getTrackingUrl = (carrier: string, trackingNumber: string) => {
    const urls: Record<string, string> = {
      delhivery: `https://www.delhivery.com/track/package/${trackingNumber}`,
      bluedart: `https://www.bluedart.com/web/guest/trackdartresult?trackFor=0&trackNo=${trackingNumber}`,
      dtdc: `https://www.dtdc.in/tracking/tracking_results.asp?Ttype=awb_no&strCnno=${trackingNumber}`,
      indiapost: `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?consignmentnumber=${trackingNumber}`,
      fedex: `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
    }
    return urls[carrier] || "#"
  }

  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
              <Button variant="ghost" asChild className="mb-4">
                <Link href="/orders">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Orders
                </Link>
              </Button>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Order Details</h1>
                  <p className="text-gray-600">Track your order and view shipping information</p>
                </div>
                <Badge className={getStatusColor(order.status)} variant="secondary">
                  {order.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Order Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Order Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Order Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Order ID</p>
                        <p className="font-medium">{order.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Order Date</p>
                        <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="font-medium text-lg">₹{order.total}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Payment Method</p>
                        <p className="font-medium">{order.payment_method.toUpperCase()}</p>
                      </div>
                    </div>
                    {order.payment_id && (
                      <div>
                        <p className="text-sm text-gray-600">Payment ID</p>
                        <p className="font-mono text-sm">{order.payment_id}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Order Items */}
                <Card>
                  <CardHeader>
                    <CardTitle>Items Ordered</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src="/placeholder.svg?height=64&width=64"
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.product_name}</h4>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            <p className="text-sm text-gray-600">Price: ₹{item.price} each</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{item.price * item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total</span>
                      <span className="font-bold text-lg">₹{order.total}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Information */}
                {shipment && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="w-5 h-5" />
                        Shipping Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Tracking Number</p>
                          <p className="font-mono font-medium">{shipment.tracking_number}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Carrier</p>
                          <p className="font-medium capitalize">{shipment.carrier}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Shipped Date</p>
                          <p className="font-medium">
                            {shipment.shipped_date
                              ? new Date(shipment.shipped_date).toLocaleDateString()
                              : "Not shipped"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Estimated Delivery</p>
                          <p className="font-medium">
                            {shipment.estimated_delivery
                              ? new Date(shipment.estimated_delivery).toLocaleDateString()
                              : "TBD"}
                          </p>
                        </div>
                      </div>
                      {shipment.tracking_number && (
                        <Button asChild className="w-full bg-yellow-500 hover:bg-yellow-600">
                          <a
                            href={getTrackingUrl(shipment.carrier, shipment.tracking_number)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Track Package on {shipment.carrier} Website
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Delivery Address & Actions */}
              <div className="space-y-6">
                {/* Delivery Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Delivery Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-gray-600">{order.shipping_address.address}</p>
                      <p className="text-gray-600">
                        {order.shipping_address.city}, {order.shipping_address.state}
                      </p>
                      <p className="text-gray-600">{order.shipping_address.pincode}</p>
                      <p className="text-gray-600">{order.shipping_address.country}</p>
                      {order.shipping_address.phone && (
                        <p className="text-gray-600">Phone: {order.shipping_address.phone}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Order Status Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Order Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div>
                          <p className="font-medium">Order Placed</p>
                          <p className="text-sm text-gray-600">{new Date(order.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      {order.status !== "pending" && (
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">Order Confirmed</p>
                            <p className="text-sm text-gray-600">Payment verified</p>
                          </div>
                        </div>
                      )}
                      {(order.status === "shipped" || order.status === "delivered") && (
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">Order Shipped</p>
                            <p className="text-sm text-gray-600">
                              {order.shipped_date ? new Date(order.shipped_date).toLocaleString() : "In transit"}
                            </p>
                          </div>
                        </div>
                      )}
                      {order.status === "delivered" && (
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="font-medium">Order Delivered</p>
                            <p className="text-sm text-gray-600">
                              {order.delivered_date ? new Date(order.delivered_date).toLocaleString() : "Delivered"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/contact">Contact Support</Link>
                    </Button>
                    {order.status === "delivered" && (
                      <Button className="w-full bg-yellow-500 hover:bg-yellow-600">Write a Review</Button>
                    )}
                    {(order.status === "delivered" || order.status === "shipped") && (
                      <Button variant="outline" className="w-full">
                        Request Return
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    </ErrorBoundary>
  )
}
