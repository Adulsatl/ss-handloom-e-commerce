"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useApp } from "@/contexts/app-context"

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function TestRazorpayPage() {
  const { toast } = useToast()
  const { addOrder, addActivity } = useApp()
  const [amount, setAmount] = useState(1000)
  const [name, setName] = useState("Test Customer")
  const [email, setEmail] = useState("test@example.com")
  const [phone, setPhone] = useState("9876543210")
  const [loading, setLoading] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [testResults, setTestResults] = useState<Array<{ step: string; status: "success" | "error"; message: string }>>(
    [],
  )

  useEffect(() => {
    const loadRazorpayScript = () => {
      return new Promise<void>((resolve, reject) => {
        // Check if script already exists
        const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
        if (existingScript) {
          setScriptLoaded(true)
          addTestResult("Script Loading", "success", "Razorpay script already loaded")
          resolve()
          return
        }

        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.async = true
        script.onload = () => {
          setScriptLoaded(true)
          addTestResult("Script Loading", "success", "Razorpay script loaded successfully")
          resolve()
        }
        script.onerror = () => {
          addTestResult("Script Loading", "error", "Failed to load Razorpay script - Check internet connection")
          reject(new Error("Failed to load Razorpay script"))
        }
        document.head.appendChild(script)
      })
    }

    loadRazorpayScript().catch((error) => {
      console.error("Error loading Razorpay script:", error)
      toast({
        title: "Script Loading Error",
        description: "Failed to load Razorpay script. Please check your internet connection and try again.",
        variant: "destructive",
      })
    })

    // Cleanup function
    return () => {
      // Don't remove script as it might be needed elsewhere
    }
  }, [toast])

  const addTestResult = (step: string, status: "success" | "error", message: string) => {
    setTestResults((prev) => [...prev, { step, status, message }])
  }

  const clearTestResults = () => {
    setTestResults([])
  }

  const handlePayment = async () => {
    setLoading(true)
    clearTestResults()

    try {
      // Validate inputs
      if (!name.trim() || !email.trim() || !phone.trim() || amount < 1) {
        addTestResult("Validation", "error", "Please fill all fields with valid data")
        throw new Error("Invalid input data")
      }

      if (!scriptLoaded || typeof window.Razorpay === "undefined") {
        addTestResult("Script Check", "error", "Razorpay script is not loaded properly")
        throw new Error("Razorpay script is not loaded")
      }

      addTestResult("Script Check", "success", "Razorpay script is loaded and ready")

      // Create a test order
      const orderId = `TEST_${Date.now()}`
      addTestResult("Order Creation", "success", `Test order created with ID: ${orderId}`)

      // Configure Razorpay options
      const options = {
        key: "rzp_test_1DP5mmOlF5G5ag", // Test key - replace with your actual test key
        amount: amount * 100, // Amount in paisa
        currency: "INR",
        name: "SS Balaramapuram Handlooms",
        description: "Test Payment for Handloom Products",
        order_id: orderId,
        handler: (response: any) => {
          handlePaymentSuccess(response)
        },
        prefill: {
          name: name.trim(),
          email: email.trim(),
          contact: `+91${phone.trim()}`,
        },
        notes: {
          address: "SS Balaramapuram Handlooms, Kerala",
          test_mode: "true",
        },
        theme: {
          color: "#4f46e5",
        },
        modal: {
          ondismiss: () => {
            addTestResult("Payment", "error", "Payment cancelled by user")
            setLoading(false)
          },
        },
      }

      addTestResult("Configuration", "success", "Razorpay configuration created successfully")

      // Initialize Razorpay
      const razorpay = new window.Razorpay(options)
      addTestResult("Initialization", "success", "Razorpay instance created successfully")

      // Add event listeners
      razorpay.on("payment.failed", (response: any) => {
        addTestResult("Payment", "error", `Payment failed: ${response.error.code} - ${response.error.description}`)
        toast({
          title: "Payment Failed",
          description: `${response.error.code}: ${response.error.description}`,
          variant: "destructive",
        })
        setLoading(false)
      })

      // Open Razorpay checkout
      razorpay.open()
      addTestResult("Checkout", "success", "Razorpay checkout opened successfully")
    } catch (error) {
      console.error("Error during payment:", error)
      addTestResult("Error", "error", `Error: ${error instanceof Error ? error.message : "Unknown error"}`)
      toast({
        title: "Payment Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const handlePaymentSuccess = (response: any) => {
    try {
      addTestResult("Payment", "success", `Payment successful with ID: ${response.razorpay_payment_id}`)

      // Create a test order in the system
      const orderItems = [
        {
          product_id: "1",
          product_name: "Test Traditional Kasavu Saree",
          quantity: 1,
          price: amount,
        },
      ]

      const orderData = {
        customer_id: "test_customer",
        customer_name: name,
        customer_email: email,
        items: orderItems,
        total: amount,
        status: "processing" as const,
        payment_method: "prepaid" as const,
        payment_id: response.razorpay_payment_id,
        shipping_address: {
          name: name,
          street: "Test Street, Test Area",
          city: "Thiruvananthapuram",
          state: "Kerala",
          pincode: "695001",
          phone: `+91${phone}`,
        },
      }

      const newOrderId = addOrder(orderData)
      addTestResult("Order Creation", "success", `Order created in system with ID: ${newOrderId}`)

      addActivity({
        type: "order",
        action: "Test Order Created",
        details: `Test order ${newOrderId} created with payment ID ${response.razorpay_payment_id}`,
      })

      toast({
        title: "Payment Successful!",
        description: `Payment ID: ${response.razorpay_payment_id}. Order created: ${newOrderId}`,
      })

      addTestResult("Integration", "success", "Payment successfully integrated with order system")
    } catch (error) {
      console.error("Error handling payment success:", error)
      addTestResult(
        "Order Creation",
        "error",
        `Failed to create order: ${error instanceof Error ? error.message : "Unknown error"}`,
      )
      toast({
        title: "Integration Error",
        description: "Payment was successful but failed to create order in system.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Razorpay Payment Test</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
            <CardDescription>Configure your test payment details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min={1}
                max={100000}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (without +91)</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))} />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handlePayment} disabled={loading || !scriptLoaded} className="w-full">
              {loading ? <LoadingSpinner className="mr-2" /> : null}
              {loading ? "Processing..." : "Test Razorpay Payment"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Real-time payment test results</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px] overflow-y-auto">
            {testResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No test results yet. Click "Test Razorpay Payment" to begin.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-md ${
                      result.status === "success"
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                    }`}
                  >
                    <div className="flex items-start">
                      <div
                        className={`w-2 h-2 rounded-full mt-1.5 ${
                          result.status === "success" ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></div>
                      <div className="ml-2">
                        <p className="font-medium">{result.step}</p>
                        <p className="text-sm text-gray-600">{result.message}</p>
                        <p className="text-xs text-gray-500">{new Date().toLocaleTimeString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col items-start">
            <div className="text-sm text-gray-500 mb-2">
              <p>
                <strong>Test Card:</strong> 4111 1111 1111 1111
              </p>
              <p>
                <strong>Expiry:</strong> Any future date | <strong>CVV:</strong> Any 3 digits
              </p>
            </div>
            <div className="text-xs text-gray-500">
              <p>
                Note: This is a test environment. No actual charges will be made. Orders created here will appear in
                your admin panel for testing purposes.
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
