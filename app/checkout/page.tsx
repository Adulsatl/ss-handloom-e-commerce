"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useApp } from "@/contexts/app-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, MapPin, Shield, AlertCircle } from "lucide-react"
import Link from "next/link"
import { ShippingCostCalculator } from "@/components/shipping-cost-calculator"

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function CheckoutPage() {
  const { state, clearCart } = useCart()
  const { user } = useAuth()
  const { addOrder } = useApp()
  const router = useRouter()
  const { toast } = useToast()

  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("prepaid")
  const [shippingMethod, setShippingMethod] = useState("delhivery")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  })

  // Load Razorpay script on component mount
  useEffect(() => {
    const loadRazorpayScript = async () => {
      if (window.Razorpay) {
        setRazorpayLoaded(true)
        return
      }

      try {
        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.async = true

        script.onload = () => {
          setRazorpayLoaded(true)
        }

        script.onerror = () => {
          console.error("Failed to load Razorpay SDK")
          toast({
            title: "Payment Gateway Error",
            description: "Failed to load payment gateway. Please try again later.",
            variant: "destructive",
          })
        }

        document.body.appendChild(script)
      } catch (error) {
        console.error("Error loading Razorpay script:", error)
        toast({
          title: "Payment Gateway Error",
          description: "Failed to initialize payment system. Please try again later.",
          variant: "destructive",
        })
      }

      // Clean up script on unmount
      return () => {
        const script = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
        if (script && script.parentNode) {
          script.parentNode.removeChild(script)
        }
      }
    }

    loadRazorpayScript()
  }, [toast])

  const [dynamicShippingCost, setDynamicShippingCost] = useState(100)
  const [selectedCourier, setSelectedCourier] = useState("delhivery")

  const shippingCost = shippingMethod === "delhivery" ? 100 : 80
  const total = state.total + dynamicShippingCost

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Required field validation
    const requiredFields = [
      { name: "firstName", label: "First Name" },
      { name: "lastName", label: "Last Name" },
      { name: "email", label: "Email" },
      { name: "phone", label: "Phone" },
      { name: "address", label: "Address" },
      { name: "city", label: "City" },
      { name: "state", label: "State" },
      { name: "pincode", label: "Pincode" },
    ]

    requiredFields.forEach((field) => {
      if (!formData[field.name as keyof typeof formData]?.trim()) {
        newErrors[field.name] = `${field.label} is required`
      }
    })

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Phone validation
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number"
    }

    // Pincode validation
    if (formData.pincode && !/^[1-9][0-9]{5}$/.test(formData.pincode)) {
      newErrors.pincode = "Please enter a valid 6-digit pincode"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const createOrder = (paymentId?: string) => {
    const orderData = {
      customer_id: user?.id || "guest",
      customer_name: `${formData.firstName} ${formData.lastName}`,
      customer_email: formData.email,
      items: state.items.map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.product_price,
      })),
      total,
      status: "pending" as const,
      payment_method: paymentMethod as "prepaid" | "cod",
      payment_id: paymentId,
      shipping_address: formData,
    }

    addOrder(orderData)
    return `ORD-${Date.now()}`
  }

  const handleRazorpayPayment = () => {
    if (!razorpayLoaded || !window.Razorpay) {
      toast({
        title: "Payment Gateway Error",
        description: "Payment gateway is not available. Please try again later.",
        variant: "destructive",
      })
      setIsProcessing(false)
      return
    }

    try {
      // Create order first to ensure it's in the system before payment
      const orderNumber = `ORD-${Date.now()}`

      const options = {
        key: "rzp_test_9999999999", // Demo key
        amount: total * 100,
        currency: "INR",
        name: "SS Balaramapuram Handlooms",
        description: "Handloom Products Purchase",
        order_id: "", // Leave blank for test mode
        handler: (response: any) => {
          try {
            // Create the order with payment details
            const orderData = {
              customer_id: user?.id || "guest",
              customer_name: `${formData.firstName} ${formData.lastName}`,
              customer_email: formData.email,
              items: state.items.map((item) => ({
                product_id: item.product_id,
                product_name: item.product_name,
                quantity: item.quantity,
                price: item.product_price,
              })),
              total,
              status: "pending" as const,
              payment_method: "prepaid" as const,
              payment_id: response.razorpay_payment_id,
              shipping_address: formData,
            }

            addOrder(orderData)
            clearCart()

            toast({
              title: "Payment Successful!",
              description: `Order placed successfully!`,
            })

            router.push(`/order-confirmation?order=${orderNumber}&payment=${response.razorpay_payment_id}`)
          } catch (error) {
            console.error("Error processing successful payment:", error)
            toast({
              title: "Order Processing Error",
              description: "Your payment was successful, but we couldn't process your order. Please contact support.",
              variant: "destructive",
            })
            setIsProcessing(false)
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#FFC107",
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false)
            toast({
              title: "Payment Cancelled",
              description: "You can continue shopping or try again.",
            })
          },
        },
      }

      const paymentObject = new window.Razorpay(options)

      paymentObject.on("payment.failed", (response: any) => {
        console.error("Payment failed:", response.error)
        toast({
          title: "Payment Failed",
          description: response.error.description || "Your payment couldn't be processed. Please try again.",
          variant: "destructive",
        })
        setIsProcessing(false)
      })

      paymentObject.open()
    } catch (error) {
      console.error("Razorpay initialization error:", error)
      toast({
        title: "Payment Error",
        description: "There was an error initializing the payment gateway. Please try again.",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  const handleCODOrder = async () => {
    try {
      // Create the order first
      const orderData = {
        customer_id: user?.id || "guest",
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email,
        items: state.items.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.product_price,
        })),
        total,
        status: "pending" as const,
        payment_method: "cod" as const,
        shipping_address: formData,
      }

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Add the order to the system
      addOrder(orderData)
      const orderNumber = `ORD-${Date.now()}`

      clearCart()
      toast({
        title: "Order Placed Successfully!",
        description: `Your COD order has been confirmed.`,
      })

      router.push(`/order-confirmation?order=${orderNumber}&payment=cod`)
    } catch (error) {
      console.error("COD order error:", error)
      toast({
        title: "Order Failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Please fix the errors",
        description: "Check the form for validation errors and try again.",
        variant: "destructive",
      })
      // Scroll to the first error
      const firstErrorField = Object.keys(errors)[0]
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
          element.focus()
        }
      }
      return
    }

    setIsProcessing(true)

    try {
      if (paymentMethod === "prepaid") {
        handleRazorpayPayment()
      } else {
        await handleCODOrder()
      }
    } catch (error) {
      console.error("Checkout error:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Your Cart is Empty</h1>
            <p className="text-base md:text-lg text-gray-600 mb-8">Add some products to proceed with checkout.</p>
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-4 md:py-8">
        <div className="mb-6 md:mb-8 animate-fade-in-up">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order details below</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Information */}
              <Card className="animate-fade-in-left">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <MapPin className="w-5 h-5" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="flex items-center gap-1">
                        First Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`mt-1 ${errors.firstName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        placeholder="Enter your first name"
                        aria-invalid={!!errors.firstName}
                        aria-describedby={errors.firstName ? "firstName-error" : undefined}
                      />
                      {errors.firstName && (
                        <p id="firstName-error" className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="flex items-center gap-1">
                        Last Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`mt-1 ${errors.lastName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        placeholder="Enter your last name"
                        aria-invalid={!!errors.lastName}
                        aria-describedby={errors.lastName ? "lastName-error" : undefined}
                      />
                      {errors.lastName && (
                        <p id="lastName-error" className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="flex items-center gap-1">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`mt-1 ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        placeholder="your@email.com"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                      />
                      {errors.email && (
                        <p id="email-error" className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone" className="flex items-center gap-1">
                        Phone <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`mt-1 ${errors.phone ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        placeholder="10-digit mobile number"
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? "phone-error" : undefined}
                      />
                      {errors.phone && (
                        <p id="phone-error" className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address" className="flex items-center gap-1">
                      Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`mt-1 ${errors.address ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      placeholder="House number, street name, area"
                      aria-invalid={!!errors.address}
                      aria-describedby={errors.address ? "address-error" : undefined}
                    />
                    {errors.address && (
                      <p id="address-error" className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.address}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city" className="flex items-center gap-1">
                        City <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`mt-1 ${errors.city ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        placeholder="City name"
                        aria-invalid={!!errors.city}
                        aria-describedby={errors.city ? "city-error" : undefined}
                      />
                      {errors.city && (
                        <p id="city-error" className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.city}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="state" className="flex items-center gap-1">
                        State <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className={`mt-1 ${errors.state ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        placeholder="State name"
                        aria-invalid={!!errors.state}
                        aria-describedby={errors.state ? "state-error" : undefined}
                      />
                      {errors.state && (
                        <p id="state-error" className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.state}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="pincode" className="flex items-center gap-1">
                        Pincode <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        className={`mt-1 ${errors.pincode ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                        placeholder="6-digit pincode"
                        aria-invalid={!!errors.pincode}
                        aria-describedby={errors.pincode ? "pincode-error" : undefined}
                      />
                      {errors.pincode && (
                        <p id="pincode-error" className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.pincode}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Method */}
              <ShippingCostCalculator
                weight={1000} // Calculate based on cart items
                paymentMode={paymentMethod as "cod" | "prepaid"}
                codAmount={paymentMethod === "cod" ? total : undefined}
                onCostCalculated={(courier, cost, estimatedDays) => {
                  setDynamicShippingCost(cost)
                  setSelectedCourier(courier)
                  setShippingMethod(courier)
                }}
              />

              {/* Payment Method */}
              <Card className="animate-fade-in-left" style={{ animationDelay: "200ms" }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                    <CreditCard className="w-5 h-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 p-3 md:p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="prepaid" id="prepaid" />
                      <Label htmlFor="prepaid" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              <Shield className="w-4 h-4 text-green-600" />
                              Prepaid (Razorpay)
                            </p>
                            <p className="text-sm text-gray-600">Pay online with cards, UPI, wallets</p>
                          </div>
                          <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Secure</div>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 md:p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div>
                          <p className="font-medium">Cash on Delivery</p>
                          <p className="text-sm text-gray-600">Pay when you receive the order</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="space-y-6">
              <Card className="animate-fade-in-right sticky top-4">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {state.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={item.image_url || "/placeholder.svg?height=48&width=48"}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.product_name}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <span className="font-medium text-sm">₹{item.product_price * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Pricing */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal ({state.itemCount} items)</span>
                      <span>₹{state.total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>₹{dynamicShippingCost}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>₹{total}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-yellow-500 hover:bg-yellow-600 hover-lift"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : paymentMethod === "prepaid" ? (
                      `Pay ₹${total} with Razorpay`
                    ) : (
                      `Place COD Order - ₹${total}`
                    )}
                  </Button>

                  <p className="text-xs text-gray-600 text-center">
                    By placing your order, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  )
}
