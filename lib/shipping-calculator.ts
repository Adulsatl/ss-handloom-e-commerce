export interface ShippingRate {
  courier: string
  cost: number
  estimatedDays: string
  codCharges?: number
  gst: number
  total: number
}

export interface ShippingCalculatorParams {
  originPin: string
  destinationPin: string
  weight: number // in grams
  paymentMode: "COD" | "Prepaid"
  declaredValue: number
}

// Delhivery API integration
export async function calculateDelhiveryShipping(params: ShippingCalculatorParams): Promise<ShippingRate | null> {
  try {
    // In production, use actual Delhivery API
    // const response = await fetch(`https://track.delhivery.com/api/kinko/v1/invoice/charges/.json?md=S&ss=Delivered&d_pin=${params.destinationPin}&o_pin=${params.originPin}&cgm=${params.weight}`, {
    //   headers: {
    //     'Authorization': 'Token YOUR_DELHIVERY_TOKEN'
    //   }
    // });

    // For demo purposes, calculate based on distance and weight
    const baseRate = calculateBaseRate(params.originPin, params.destinationPin, params.weight)
    const codCharges = params.paymentMode === "COD" ? Math.max(25, baseRate * 0.02) : 0
    const gst = (baseRate + codCharges) * 0.18

    return {
      courier: "Delhivery",
      cost: baseRate,
      estimatedDays: "3-5 business days",
      codCharges,
      gst,
      total: baseRate + codCharges + gst,
    }
  } catch (error) {
    console.error("Delhivery API error:", error)
    return null
  }
}

export async function calculateShippingRates(params: ShippingCalculatorParams): Promise<ShippingRate[]> {
  const rates: ShippingRate[] = []

  // Delhivery
  const delhiveryRate = await calculateDelhiveryShipping(params)
  if (delhiveryRate) rates.push(delhiveryRate)

  // Blue Dart (mock calculation)
  const blueDartBase = calculateBaseRate(params.originPin, params.destinationPin, params.weight) * 1.2
  const blueDartCod = params.paymentMode === "COD" ? Math.max(30, blueDartBase * 0.025) : 0
  const blueDartGst = (blueDartBase + blueDartCod) * 0.18

  rates.push({
    courier: "Blue Dart",
    cost: blueDartBase,
    estimatedDays: "1-2 business days",
    codCharges: blueDartCod,
    gst: blueDartGst,
    total: blueDartBase + blueDartCod + blueDartGst,
  })

  // DTDC (mock calculation)
  const dtdcBase = calculateBaseRate(params.originPin, params.destinationPin, params.weight) * 0.9
  const dtdcCod = params.paymentMode === "COD" ? Math.max(20, dtdcBase * 0.015) : 0
  const dtdcGst = (dtdcBase + dtdcCod) * 0.18

  rates.push({
    courier: "DTDC",
    cost: dtdcBase,
    estimatedDays: "4-6 business days",
    codCharges: dtdcCod,
    gst: dtdcGst,
    total: dtdcBase + dtdcCod + dtdcGst,
  })

  return rates.sort((a, b) => a.total - b.total)
}

function calculateBaseRate(originPin: string, destinationPin: string, weight: number): number {
  // Simple distance-based calculation (in production, use actual API)
  const distance = Math.abs(
    Number.parseInt(originPin.substring(0, 3)) - Number.parseInt(destinationPin.substring(0, 3)),
  )
  const weightKg = weight / 1000

  let baseRate = 50 // Base rate

  // Distance factor
  if (distance > 100) baseRate += 30
  if (distance > 200) baseRate += 50
  if (distance > 500) baseRate += 100

  // Weight factor
  if (weightKg > 0.5) baseRate += (weightKg - 0.5) * 20

  return Math.round(baseRate)
}

export async function checkPincodeServiceability(pincode: string): Promise<boolean> {
  // In production, use actual API
  // For demo, assume all 6-digit pincodes are serviceable
  return /^\d{6}$/.test(pincode)
}
