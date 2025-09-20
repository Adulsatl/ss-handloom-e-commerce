interface CourierCredentials {
  apiKey: string
  apiSecret?: string
  username?: string
  password?: string
}

interface ShipmentDetails {
  orderId: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  pickupAddress: {
    name: string
    address: string
    city: string
    state: string
    pincode: string
    phone: string
  }
  deliveryAddress: {
    name: string
    address: string
    city: string
    state: string
    pincode: string
    phone: string
  }
  packageDetails: {
    weight: number
    dimensions?: {
      length: number
      width: number
      height: number
    }
    items: Array<{
      name: string
      quantity: number
      price: number
    }>
  }
  paymentMode: "prepaid" | "cod"
  codAmount?: number
}

interface TrackingResponse {
  trackingId: string
  courierName: string
  status: string
  statusDate: string
  estimatedDelivery?: string
  trackingUrl: string
  checkpoints?: Array<{
    date: string
    status: string
    location: string
    description: string
  }>
}

interface DelhiveryCredentials {
  apiKey: string
  clientName: string
  isProduction: boolean
}

interface DelhiveryShipmentPayload {
  shipments: Array<{
    name: string
    add: string
    pin: string
    city: string
    state: string
    country: string
    phone: string
    order: string
    payment_mode: string
    return_pin: string
    return_city: string
    return_phone: string
    return_add: string
    return_state: string
    return_country: string
    products_desc: string
    hsn_code: string
    cod_amount: number
    order_date: string
    total_amount: number
    seller_add: string
    seller_name: string
    seller_inv: string
    quantity: number
    waybill: string
    shipment_width: number
    shipment_height: number
    weight: number
    seller_gst_tin: string
    shipping_mode: string
    address_type: string
  }>
}

// Update the RealCourierAPI class with proper Delhivery implementation
export class RealCourierAPI {
  private static instance: RealCourierAPI
  private credentials: Record<string, any> = {}

  static getInstance(): RealCourierAPI {
    if (!RealCourierAPI.instance) {
      RealCourierAPI.instance = new RealCourierAPI()
    }
    return RealCourierAPI.instance
  }

  setCredentials(courier: string, credentials: any): void {
    this.credentials[courier] = credentials
  }

  hasCredentials(courier: string): boolean {
    return !!this.credentials[courier]?.apiKey
  }

  private getDelhiveryBaseUrl(isProduction = false): string {
    return isProduction ? "https://track.delhivery.com" : "https://staging-express.delhivery.com"
  }

  // Fetch Waybill from Delhivery
  async fetchDelhiveryWaybill(count = 1): Promise<string[]> {
    const credentials = this.credentials.delhivery as DelhiveryCredentials
    if (!credentials) throw new Error("Delhivery credentials not set")

    const baseUrl = this.getDelhiveryBaseUrl(credentials.isProduction)
    const url = `${baseUrl}/waybill/api/bulk/json/?cl=${credentials.clientName}&count=${count}`

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Token ${credentials.apiKey}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Delhivery Waybill API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success && data.waybills) {
        return data.waybills
      } else {
        throw new Error(data.rmk || "Failed to fetch waybills")
      }
    } catch (error) {
      console.error("Delhivery Waybill Error:", error)
      throw error
    }
  }

  // Create Delhivery Shipment with proper payload structure
  async createDelhiveryShipment(shipmentDetails: ShipmentDetails): Promise<string> {
    const credentials = this.credentials.delhivery as DelhiveryCredentials
    if (!credentials) throw new Error("Delhivery credentials not set")

    try {
      // First, fetch a waybill
      const waybills = await this.fetchDelhiveryWaybill(1)
      const waybill = waybills[0]

      const baseUrl = this.getDelhiveryBaseUrl(credentials.isProduction)
      const url = `${baseUrl}/api/cmu/create.json`

      const payload: DelhiveryShipmentPayload = {
        shipments: [
          {
            name: shipmentDetails.customerName,
            add: shipmentDetails.deliveryAddress.address,
            pin: shipmentDetails.deliveryAddress.pincode,
            city: shipmentDetails.deliveryAddress.city,
            state: shipmentDetails.deliveryAddress.state,
            country: "India",
            phone: shipmentDetails.customerPhone,
            order: shipmentDetails.orderId,
            payment_mode: shipmentDetails.paymentMode === "cod" ? "COD" : "Prepaid",
            return_pin: shipmentDetails.pickupAddress.pincode,
            return_city: shipmentDetails.pickupAddress.city,
            return_phone: shipmentDetails.pickupAddress.phone,
            return_add: shipmentDetails.pickupAddress.address,
            return_state: shipmentDetails.pickupAddress.state,
            return_country: "India",
            products_desc: shipmentDetails.packageDetails.items.map((item) => item.name).join(", "),
            hsn_code: "6302", // Default HSN code for textiles
            cod_amount: shipmentDetails.codAmount || 0,
            order_date: new Date().toISOString().split("T")[0],
            total_amount: shipmentDetails.packageDetails.items.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0,
            ),
            seller_add: shipmentDetails.pickupAddress.address,
            seller_name: shipmentDetails.pickupAddress.name,
            seller_inv: "",
            quantity: shipmentDetails.packageDetails.items.reduce((sum, item) => sum + item.quantity, 0),
            waybill: waybill,
            shipment_width: shipmentDetails.packageDetails.dimensions?.width || 10,
            shipment_height: shipmentDetails.packageDetails.dimensions?.height || 10,
            weight: shipmentDetails.packageDetails.weight,
            seller_gst_tin: "",
            shipping_mode: "Surface",
            address_type: "home",
          },
        ],
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Token ${credentials.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Delhivery Create Shipment API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success && data.packages && data.packages.length > 0) {
        return data.packages[0].waybill
      } else {
        throw new Error(data.rmk || "Failed to create Delhivery shipment")
      }
    } catch (error) {
      console.error("Delhivery Create Shipment Error:", error)
      throw error
    }
  }

  // Calculate Delhivery shipping cost
  async calculateDelhiveryShippingCost(
    fromPincode: string,
    toPincode: string,
    weight: number,
    paymentMode: "cod" | "prepaid",
    codAmount?: number,
  ): Promise<any> {
    const credentials = this.credentials.delhivery as DelhiveryCredentials
    if (!credentials) throw new Error("Delhivery credentials not set")

    const baseUrl = this.getDelhiveryBaseUrl(credentials.isProduction)
    const params = new URLSearchParams({
      md: paymentMode === "cod" ? "S" : "P",
      ss: "Delivered",
      d_pin: toPincode,
      o_pin: fromPincode,
      cgm: weight.toString(),
      pt: paymentMode === "cod" ? "COD" : "Pre-paid",
      cod: codAmount?.toString() || "0",
    })

    const url = `${baseUrl}/api/kinko/v1/invoice/charges/.json?${params.toString()}`

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Token ${credentials.apiKey}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Delhivery Charges API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Delhivery Charges Error:", error)
      throw error
    }
  }

  // Generate Delhivery shipping label
  async generateDelhiveryShippingLabel(waybill: string): Promise<string> {
    const credentials = this.credentials.delhivery as DelhiveryCredentials
    if (!credentials) throw new Error("Delhivery credentials not set")

    const baseUrl = this.getDelhiveryBaseUrl(credentials.isProduction)
    const url = `${baseUrl}/api/p/packing_slip?wbns=${waybill}&pdf=true`

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Token ${credentials.apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Delhivery Label API Error: ${response.status} ${response.statusText}`)
      }

      // Return the PDF URL or blob
      return url
    } catch (error) {
      console.error("Delhivery Label Error:", error)
      throw error
    }
  }

  // Track Delhivery shipment with enhanced error handling
  private async trackDelhiveryShipment(trackingId: string): Promise<TrackingResponse> {
    const credentials = this.credentials.delhivery as DelhiveryCredentials
    if (!credentials) throw new Error("Delhivery credentials not set")

    const baseUrl = this.getDelhiveryBaseUrl(credentials.isProduction)
    const url = `${baseUrl}/api/v1/packages/json/?waybill=${trackingId}`

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Token ${credentials.apiKey}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Delhivery Tracking API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.ShipmentData && data.ShipmentData.length > 0) {
        const shipment = data.ShipmentData[0].Shipment
        const scans = shipment.Scans || []

        return {
          trackingId,
          courierName: "delhivery",
          status: this.mapDelhiveryStatus(shipment.Status.Status),
          statusDate: shipment.Status.StatusDateTime,
          estimatedDelivery: shipment.ExpectedDeliveryDate,
          trackingUrl: `https://www.delhivery.com/track/package/${trackingId}`,
          checkpoints: scans.map((scan: any) => ({
            date: scan.ScanDateTime,
            status: scan.ScanType,
            location: scan.ScannedLocation,
            description: scan.Instructions,
          })),
        }
      } else {
        throw new Error("Shipment not found in Delhivery system")
      }
    } catch (error) {
      console.error("Delhivery Tracking Error:", error)
      throw error
    }
  }

  // Create pickup request
  async createDelhiveryPickupRequest(pickupDetails: any): Promise<string> {
    const credentials = this.credentials.delhivery as DelhiveryCredentials
    if (!credentials) throw new Error("Delhivery credentials not set")

    const baseUrl = this.getDelhiveryBaseUrl(credentials.isProduction)
    const url = `${baseUrl}/fm/request/new/`

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Token ${credentials.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pickupDetails),
      })

      if (!response.ok) {
        throw new Error(`Delhivery Pickup API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data.pickup_id || data.id
    } catch (error) {
      console.error("Delhivery Pickup Error:", error)
      throw error
    }
  }

  // Blue Dart API Integration
  async createBlueDartShipment(shipmentDetails: ShipmentDetails): Promise<string> {
    const credentials = this.credentials.bluedart
    if (!credentials) throw new Error("Blue Dart credentials not set")

    // Blue Dart API implementation would go here
    // For now, return a simulated tracking number
    return `BD${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  }

  // DTDC API Integration
  async createDTDCShipment(shipmentDetails: ShipmentDetails): Promise<string> {
    const credentials = this.credentials.dtdc
    if (!credentials) throw new Error("DTDC credentials not set")

    // DTDC API implementation would go here
    // For now, return a simulated tracking number
    return `DTDC${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  }

  // India Post API Integration
  async createIndiaPostShipment(shipmentDetails: ShipmentDetails): Promise<string> {
    const credentials = this.credentials.indiapost
    if (!credentials) throw new Error("India Post credentials not set")

    // India Post API implementation would go here
    // For now, return a simulated tracking number
    return `IP${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  }

  async createShipment(courier: string, shipmentDetails: ShipmentDetails): Promise<string> {
    switch (courier) {
      case "delhivery":
        return await this.createDelhiveryShipment(shipmentDetails)
      case "bluedart":
        return await this.createBlueDartShipment(shipmentDetails)
      case "dtdc":
        return await this.createDTDCShipment(shipmentDetails)
      case "indiapost":
        return await this.createIndiaPostShipment(shipmentDetails)
      default:
        throw new Error(`Unsupported courier: ${courier}`)
    }
  }

  // Track shipment with real API calls
  async trackShipment(courier: string, trackingId: string): Promise<TrackingResponse> {
    const credentials = this.credentials[courier]
    if (!credentials) throw new Error(`${courier} credentials not set`)

    switch (courier) {
      case "delhivery":
        return await this.trackDelhiveryShipment(trackingId)
      case "bluedart":
        return await this.trackBlueDartShipment(trackingId)
      case "dtdc":
        return await this.trackDTDCShipment(trackingId)
      case "indiapost":
        return await this.trackIndiaPostShipment(trackingId)
      default:
        throw new Error(`Unsupported courier: ${courier}`)
    }
  }

  private async trackBlueDartShipment(trackingId: string): Promise<TrackingResponse> {
    // Blue Dart tracking implementation
    // For now, return simulated data
    return {
      trackingId,
      courierName: "bluedart",
      status: "in_transit",
      statusDate: new Date().toISOString(),
      trackingUrl: `https://www.bluedart.com/tracking?trackingId=${trackingId}`,
      checkpoints: [],
    }
  }

  private async trackDTDCShipment(trackingId: string): Promise<TrackingResponse> {
    // DTDC tracking implementation
    // For now, return simulated data
    return {
      trackingId,
      courierName: "dtdc",
      status: "in_transit",
      statusDate: new Date().toISOString(),
      trackingUrl: `https://www.dtdc.in/tracking/tracking_results.asp?Ttype=awb_no&strCnno=${trackingId}`,
      checkpoints: [],
    }
  }

  private async trackIndiaPostShipment(trackingId: string): Promise<TrackingResponse> {
    // India Post tracking implementation
    // For now, return simulated data
    return {
      trackingId,
      courierName: "indiapost",
      status: "in_transit",
      statusDate: new Date().toISOString(),
      trackingUrl: `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?consignmentnumber=${trackingId}`,
      checkpoints: [],
    }
  }

  private mapDelhiveryStatus(status: string): string {
    const statusMap: Record<string, string> = {
      Shipped: "pending",
      "In Transit": "in_transit",
      "Out for Delivery": "out_for_delivery",
      Delivered: "delivered",
      RTO: "failed",
      Lost: "failed",
    }
    return statusMap[status] || "pending"
  }

  getTrackingUrl(courier: string, trackingId: string): string {
    const courierUrls: Record<string, string> = {
      delhivery: "https://www.delhivery.com/track/package/",
      bluedart: "https://www.bluedart.com/tracking?trackingId=",
      dtdc: "https://www.dtdc.in/tracking/tracking_results.asp?Ttype=awb_no&strCnno=",
      indiapost:
        "https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?consignmentnumber=",
    }

    return `${courierUrls[courier] || ""}${trackingId}`
  }
}

export const realCourierAPI = RealCourierAPI.getInstance()
