"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Truck, Clock, CreditCard } from "lucide-react"
import { calculateShippingRates, checkPincodeServiceability, type ShippingRate } from "@/lib/shipping-calculator"
import { LoadingSpinner } from "./loading-spinner"

interface ShippingCostCalculatorProps {
  cartWeight: number
  cartValue: number
  onShippingSelect?: (rate: ShippingRate) => void
  selectedCourier?: string
}

export function ShippingCostCalculator({
  cartWeight,
  cartValue,
  onShippingSelect,
  selectedCourier,
}: ShippingCostCalculatorProps) {
  const [pincode, setPincode] = useState("")
  const [paymentMode, setPaymentMode] = useState<"COD" | "Prepaid">("Prepaid")
  const [rates, setRates] = useState<ShippingRate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isServiceable, setIsServiceable] = useState<boolean | null>(null)

  const calculateRates = async () => {
    if (!pincode || pincode.length !== 6) {
      setError("Please enter a valid 6-digit pincode")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Check serviceability first
      const serviceable = await checkPincodeServiceability(pincode)
      setIsServiceable(serviceable)

      if (!serviceable) {
        setError("Sorry, we don't deliver to this pincode yet")
        setRates([])
        return
      }

      // Calculate shipping rates
      const shippingRates = await calculateShippingRates({
        originPin: "695612", // SS Balaramapuram pincode
        destinationPin: pincode,
        weight: cartWeight,
        paymentMode,
        declaredValue: cartValue,
      })

      setRates(shippingRates)
    } catch (err) {
      setError("Failed to calculate shipping rates. Please try again.")
      console.error("Shipping calculation error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (pincode.length === 6) {
      calculateRates()
    } else {
      setRates([])
      setIsServiceable(null)
    }
  }, [pincode, paymentMode])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Shipping Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pincode">Delivery Pincode</Label>
            <Input
              id="pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Enter 6-digit pincode"
              maxLength={6}
            />
          </div>
          <div>
            <Label>Payment Mode</Label>
            <div className="flex gap-2 mt-1">
              <Button
                variant={paymentMode === "Prepaid" ? "default" : "outline"}
                size="sm"
                onClick={() => setPaymentMode("Prepaid")}
              >
                Prepaid
              </Button>
              <Button
                variant={paymentMode === "COD" ? "default" : "outline"}
                size="sm"
                onClick={() => setPaymentMode("COD")}
              >
                COD
              </Button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-4">
            <LoadingSpinner />
            <span className="ml-2">Calculating shipping rates...</span>
          </div>
        )}

        {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}

        {isServiceable === false && (
          <div className="text-orange-600 text-sm bg-orange-50 p-3 rounded-lg">
            This pincode is not serviceable. Please contact us for special delivery arrangements.
          </div>
        )}

        {rates.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Available Shipping Options:</h4>
            {rates.map((rate, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedCourier === rate.courier
                    ? "border-yellow-500 bg-yellow-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => onShippingSelect?.(rate)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-medium">{rate.courier}</h5>
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {rate.estimatedDays}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Base Charges:</span>
                        <span>₹{rate.cost.toFixed(2)}</span>
                      </div>
                      {rate.codCharges && rate.codCharges > 0 && (
                        <div className="flex justify-between">
                          <span>COD Charges:</span>
                          <span>₹{rate.codCharges.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>GST (18%):</span>
                        <span>₹{rate.gst.toFixed(2)}</span>
                      </div>
                      <hr className="my-1" />
                      <div className="flex justify-between font-medium">
                        <span>Total:</span>
                        <span>₹{rate.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  {paymentMode === "COD" && <CreditCard className="h-4 w-4 text-orange-500 ml-2" />}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p>• Shipping charges are calculated based on weight and distance</p>
          <p>• Delivery time may vary based on location and courier availability</p>
          <p>• COD charges apply for Cash on Delivery orders</p>
        </div>
      </CardContent>
    </Card>
  )
}
