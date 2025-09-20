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
    weight: number // in kg
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

export class CourierAPI {
  private static instance: CourierAPI
  private credentials: Record<string, CourierCredentials> = {}

  // Supported couriers
  private supportedCouriers = [
    "delhivery",
    "bluedart",
    "dtdc",
    "indiapost",
    "fedex",
    "ecom",
    "dhl",
    "professional",
    "xpressbees",
  ]

  static getInstance(): CourierAPI {
    if (!CourierAPI.instance) {
      CourierAPI.instance = new CourierAPI()
    }
    return CourierAPI.instance
  }

  // Set credentials for a courier
  setCredentials(courier: string, credentials: CourierCredentials): void {
    if (!this.supportedCouriers.includes(courier)) {
      throw new Error(`Unsupported courier: ${courier}`)
    }
    this.credentials[courier] = credentials
  }

  // Check if credentials are set for a courier
  hasCredentials(courier: string): boolean {
    return !!this.credentials[courier]?.apiKey
  }

  // Create shipment with courier
  async createShipment(courier: string, shipmentDetails: ShipmentDetails): Promise<string> {
    if (!this.hasCredentials(courier)) {
      throw new Error(`No credentials set for ${courier}`)
    }

    // In a real implementation, this would make an API call to the courier's API
    // For now, we'll simulate a successful response
    console.log(`Creating shipment with ${courier}`, shipmentDetails)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Generate a fake tracking ID based on courier and timestamp
    const trackingId = `${courier.toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    return trackingId
  }

  // Track shipment
  async trackShipment(courier: string, trackingId: string): Promise<TrackingResponse> {
    // In a real implementation, this would make an API call to the courier's API
    console.log(`Tracking shipment with ${courier}`, trackingId)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Generate fake tracking data
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)

    const twoDaysAgo = new Date(now)
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

    const estimatedDelivery = new Date(now)
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 3)

    // Simulate different statuses based on tracking ID
    const statusOptions = ["pending", "in_transit", "out_for_delivery", "delivered", "exception"]
    const statusIndex = Number.parseInt(trackingId.slice(-1), 10) % statusOptions.length
    const status = statusOptions[statusIndex]

    return {
      trackingId,
      courierName: courier,
      status,
      statusDate: now.toISOString(),
      estimatedDelivery: estimatedDelivery.toISOString(),
      trackingUrl: `https://track.${courier}.com/${trackingId}`,
      checkpoints: [
        {
          date: twoDaysAgo.toISOString(),
          status: "picked_up",
          location: "Origin Facility",
          description: "Shipment picked up",
        },
        {
          date: yesterday.toISOString(),
          status: "in_transit",
          location: "Transit Hub",
          description: "Shipment in transit",
        },
        {
          date: now.toISOString(),
          status,
          location: status === "delivered" ? "Destination" : "Local Facility",
          description: this.getStatusDescription(status),
        },
      ],
    }
  }

  // Get tracking URL for a courier
  getTrackingUrl(courier: string, trackingId: string): string {
    const courierUrls: Record<string, string> = {
      delhivery: "https://www.delhivery.com/track/package/",
      bluedart: "https://www.bluedart.com/tracking?trackingId=",
      dtdc: "https://www.dtdc.in/tracking/tracking_results.asp?Ttype=awb_no&strCnno=",
      indiapost:
        "https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?consignmentnumber=",
      fedex: "https://www.fedex.com/apps/fedextrack/?tracknumbers=",
      ecom: "https://ecomexpress.in/tracking/?awb_field=",
      dhl: "https://www.dhl.com/in-en/home/tracking/tracking-express.html?submit=1&tracking-id=",
      professional: "https://www.professionalcourier.in/tracking-details/?tid=",
      xpressbees: "https://www.xpressbees.com/track?trackingId=",
    }

    return `${courierUrls[courier] || ""}${trackingId}`
  }

  // Helper method to get status description
  private getStatusDescription(status: string): string {
    const descriptions: Record<string, string> = {
      pending: "Shipment information received",
      in_transit: "Shipment in transit to destination",
      out_for_delivery: "Out for delivery today",
      delivered: "Shipment delivered",
      exception: "Delivery exception - contact courier",
    }

    return descriptions[status] || "Status unknown"
  }
}

export const courierAPI = CourierAPI.getInstance()
