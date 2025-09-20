"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Package, Truck, Mail, Phone } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const orderNumber = searchParams.get("order") || "ORD-123456"
  const paymentId = searchParams.get("payment")

  // Redirect to home if user logs out
  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  if (!user) {
    return null // Will redirect to home
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <Card className="text-center mb-8 animate-scale-in">
            <CardContent className="p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
              <p className="text-lg text-gray-600 mb-4">
                Thank you for your purchase. Your order has been successfully placed.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">Order Number</p>
                <p className="text-xl font-bold text-gray-900">{orderNumber}</p>
                {paymentId && paymentId !== "cod" && (
                  <>
                    <p className="text-sm text-gray-600 mt-2">Payment ID</p>
                    <p className="text-sm font-mono text-gray-900">{paymentId}</p>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600">
                You will receive an email confirmation shortly with your order details and tracking information.
              </p>
            </CardContent>
          </Card>

          {/* What's Next */}
          <Card className="mb-8 animate-fade-in-up">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">What happens next?</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Email Confirmation</h3>
                    <p className="text-sm text-gray-600">
                      You'll receive an order confirmation email within 5 minutes.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Order Processing</h3>
                    <p className="text-sm text-gray-600">
                      We'll prepare your handloom products with care (1-2 business days).
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Truck className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Shipping & Delivery</h3>
                    <p className="text-sm text-gray-600">
                      Your order will be shipped and delivered within 3-7 business days.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up">
            <Button className="flex-1 bg-yellow-500 hover:bg-yellow-600" asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/orders">View My Orders</Link>
            </Button>
          </div>

          {/* Contact Info */}
          <Card className="mt-8 animate-fade-in-up">
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                If you have any questions about your order, feel free to contact us.
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/contact">
                    <Mail className="w-4 h-4 mr-2" />
                    Email Us
                  </Link>
                </Button>
                <Button variant="outline" size="sm">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Us
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
