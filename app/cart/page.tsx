"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import Link from "next/link"

export default function CartPage() {
  const { state, updateQuantity, removeFromCart } = useCart()

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-lg text-gray-600 mb-8">Add some beautiful handloom products to get started!</p>
            <Button className="bg-yellow-500 hover:bg-yellow-600" asChild>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Shopping Cart</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {state.items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-yellow-100 to-green-100 rounded-lg overflow-hidden">
                      <img
                        src={item.image_url || "/placeholder.svg?height=80&width=80"}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.product_name}</h3>
                      <p className="text-gray-600">Traditional handloom</p>
                      <p className="text-lg font-bold text-yellow-600">₹{item.product_price}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({state.itemCount} items)</span>
                  <span>₹{state.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>₹100</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{state.total + 100}</span>
                  </div>
                </div>
                <Button className="w-full bg-yellow-500 hover:bg-yellow-600 hover-lift" asChild>
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
