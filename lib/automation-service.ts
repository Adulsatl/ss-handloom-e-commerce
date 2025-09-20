export interface AutomationConfig {
  orderProcessing: {
    autoConfirmAfterMinutes: number
    autoProcessAfterMinutes: number
  }
  shipping: {
    autoCreateShipmentAfterMinutes: number
    carriers: {
      [key: string]: {
        apiEndpoint: string
        trackingUrlTemplate: string
        estimatedDays: number
      }
    }
  }
  delivery: {
    autoMarkDeliveredAfterDays: number
    deliveryWindowHours: number
  }
  returns: {
    autoApproveAfterHours: number
    autoProcessRefundAfterHours: number
    returnWindowDays: number
  }
  notifications: {
    emailEnabled: boolean
    smsEnabled: boolean
  }
}

export const defaultAutomationConfig: AutomationConfig = {
  orderProcessing: {
    autoConfirmAfterMinutes: 5,
    autoProcessAfterMinutes: 30,
  },
  shipping: {
    autoCreateShipmentAfterMinutes: 60,
    carriers: {
      delhivery: {
        apiEndpoint: "https://track.delhivery.com/api/v1/packages/json/",
        trackingUrlTemplate: "https://www.delhivery.com/track/package/{trackingNumber}",
        estimatedDays: 4,
      },
      bluedart: {
        apiEndpoint: "https://www.bluedart.com/servlet/RoutingServlet",
        trackingUrlTemplate: "https://www.bluedart.com/web/guest/trackdartresult?trackFor=0&trackNo={trackingNumber}",
        estimatedDays: 3,
      },
      dtdc: {
        apiEndpoint: "https://www.dtdc.in/dtdcTrack/Tracking/consignInfo",
        trackingUrlTemplate: "https://www.dtdc.in/tracking/tracking_results.asp?Ttype=awb_no&strCnno={trackingNumber}",
        estimatedDays: 5,
      },
      indiapost: {
        apiEndpoint: "https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx",
        trackingUrlTemplate:
          "https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?consignmentnumber={trackingNumber}",
        estimatedDays: 7,
      },
    },
  },
  delivery: {
    autoMarkDeliveredAfterDays: 7,
    deliveryWindowHours: 24,
  },
  returns: {
    autoApproveAfterHours: 24,
    autoProcessRefundAfterHours: 48,
    returnWindowDays: 7,
  },
  notifications: {
    emailEnabled: true,
    smsEnabled: true,
  },
}

export class AutomationService {
  private config: AutomationConfig
  private intervals: Map<string, NodeJS.Timeout> = new Map()

  constructor(config: AutomationConfig = defaultAutomationConfig) {
    this.config = config
  }

  startAutomation() {
    // Order processing automation
    this.startOrderProcessingAutomation()

    // Shipping automation
    this.startShippingAutomation()

    // Delivery tracking automation
    this.startDeliveryTrackingAutomation()

    // Returns automation
    this.startReturnsAutomation()

    // Package tracking automation
    this.startPackageTrackingAutomation()
  }

  stopAutomation() {
    this.intervals.forEach((interval) => clearInterval(interval))
    this.intervals.clear()
  }

  private startOrderProcessingAutomation() {
    const interval = setInterval(() => {
      this.processOrders()
    }, 60000) // Check every minute

    this.intervals.set("orderProcessing", interval)
  }

  private startShippingAutomation() {
    const interval = setInterval(() => {
      this.processShipping()
    }, 300000) // Check every 5 minutes

    this.intervals.set("shipping", interval)
  }

  private startDeliveryTrackingAutomation() {
    const interval = setInterval(() => {
      this.trackDeliveries()
    }, 600000) // Check every 10 minutes

    this.intervals.set("deliveryTracking", interval)
  }

  private startReturnsAutomation() {
    const interval = setInterval(() => {
      this.processReturns()
    }, 3600000) // Check every hour

    this.intervals.set("returns", interval)
  }

  private startPackageTrackingAutomation() {
    const interval = setInterval(() => {
      this.updatePackageTracking()
    }, 1800000) // Check every 30 minutes

    this.intervals.set("packageTracking", interval)
  }

  private async processOrders() {
    const orders = this.getOrdersFromStorage()
    const now = new Date()

    for (const order of orders) {
      const orderTime = new Date(order.created_at)
      const minutesSinceOrder = (now.getTime() - orderTime.getTime()) / (1000 * 60)

      // Auto-confirm pending orders
      if (order.status === "pending" && minutesSinceOrder >= this.config.orderProcessing.autoConfirmAfterMinutes) {
        this.updateOrderStatus(order.id, "processing", "Order automatically confirmed")
      }

      // Auto-process confirmed orders
      if (order.status === "processing" && minutesSinceOrder >= this.config.orderProcessing.autoProcessAfterMinutes) {
        this.createAutomaticShipment(order)
      }
    }
  }

  private async processShipping() {
    const orders = this.getOrdersFromStorage()
    const shipments = this.getShipmentsFromStorage()
    const now = new Date()

    for (const order of orders) {
      if (order.status === "processing") {
        const orderTime = new Date(order.created_at)
        const minutesSinceOrder = (now.getTime() - orderTime.getTime()) / (1000 * 60)

        // Check if shipment already exists
        const existingShipment = shipments.find((s) => s.order_id === order.id)

        if (!existingShipment && minutesSinceOrder >= this.config.shipping.autoCreateShipmentAfterMinutes) {
          this.createAutomaticShipment(order)
        }
      }
    }
  }

  private async trackDeliveries() {
    const shipments = this.getShipmentsFromStorage()
    const now = new Date()

    for (const shipment of shipments) {
      if (shipment.status === "in_transit") {
        // Simulate tracking update
        const trackingInfo = await this.getTrackingInfo(shipment.carrier, shipment.tracking_number)

        if (trackingInfo.status === "delivered") {
          this.updateShipmentStatus(shipment.id, "delivered")
          this.updateOrderStatus(shipment.order_id, "delivered", "Package delivered successfully")
        }
      }

      // Auto-mark as delivered after estimated delivery time
      if (shipment.status === "in_transit" && shipment.estimated_delivery) {
        const estimatedDelivery = new Date(shipment.estimated_delivery)
        const hoursOverdue = (now.getTime() - estimatedDelivery.getTime()) / (1000 * 60 * 60)

        if (hoursOverdue >= this.config.delivery.deliveryWindowHours) {
          this.updateShipmentStatus(shipment.id, "delivered")
          this.updateOrderStatus(shipment.order_id, "delivered", "Package marked as delivered (estimated)")
        }
      }
    }
  }

  private async processReturns() {
    const returns = this.getReturnsFromStorage()
    const now = new Date()

    for (const returnRequest of returns) {
      const requestTime = new Date(returnRequest.request_date)
      const hoursSinceRequest = (now.getTime() - requestTime.getTime()) / (1000 * 60 * 60)

      // Auto-approve return requests
      if (returnRequest.status === "pending" && hoursSinceRequest >= this.config.returns.autoApproveAfterHours) {
        this.updateReturnStatus(returnRequest.id, "approved", "Return automatically approved")
      }

      // Auto-process refunds
      if (returnRequest.status === "approved" && hoursSinceRequest >= this.config.returns.autoProcessRefundAfterHours) {
        this.processAutomaticRefund(returnRequest.id)
      }
    }
  }

  private async updatePackageTracking() {
    const shipments = this.getShipmentsFromStorage()

    for (const shipment of shipments) {
      if (shipment.status === "in_transit") {
        try {
          const trackingInfo = await this.getTrackingInfo(shipment.carrier, shipment.tracking_number)

          if (trackingInfo.status !== shipment.status) {
            this.updateShipmentStatus(shipment.id, trackingInfo.status)

            if (trackingInfo.status === "delivered") {
              this.updateOrderStatus(shipment.order_id, "delivered", "Package delivered")
            }
          }
        } catch (error) {
          console.error(`Failed to track package ${shipment.tracking_number}:`, error)
        }
      }
    }
  }

  private createAutomaticShipment(order: any) {
    // Select best carrier based on location and order value
    const carrier = this.selectOptimalCarrier(order)
    const trackingNumber = this.generateTrackingNumber(carrier)

    const shipment = {
      id: `ship_${Date.now()}`,
      order_id: order.id,
      tracking_number: trackingNumber,
      carrier,
      status: "pending" as const,
      shipped_date: new Date().toISOString(),
      estimated_delivery: this.calculateEstimatedDelivery(carrier),
    }

    this.saveShipment(shipment)
    this.updateOrderStatus(order.id, "shipped", `Shipment created with ${carrier}`)

    // Send notification
    this.sendShipmentNotification(order, shipment)
  }

  private selectOptimalCarrier(order: any): string {
    const pincode = order.shipping_address?.pincode
    const orderValue = order.total

    // Logic to select carrier based on location and order value
    if (orderValue > 5000) {
      return "delhivery" // Premium service for high-value orders
    } else if (pincode && pincode.startsWith("6")) {
      return "dtdc" // Better coverage in South India
    } else {
      return "bluedart" // Default choice
    }
  }

  private generateTrackingNumber(carrier: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 6).toUpperCase()

    switch (carrier) {
      case "delhivery":
        return `DL${timestamp}${random}`
      case "bluedart":
        return `BD${timestamp}${random}`
      case "dtdc":
        return `DT${timestamp}${random}`
      case "indiapost":
        return `IP${timestamp}${random}`
      default:
        return `TK${timestamp}${random}`
    }
  }

  private calculateEstimatedDelivery(carrier: string): string {
    const carrierInfo = this.config.shipping.carriers[carrier]
    const estimatedDays = carrierInfo?.estimatedDays || 5

    const deliveryDate = new Date()
    deliveryDate.setDate(deliveryDate.getDate() + estimatedDays)

    return deliveryDate.toISOString()
  }

  private async getTrackingInfo(carrier: string, trackingNumber: string) {
    // Simulate API call to carrier's tracking service
    // In a real implementation, this would make actual API calls

    const random = Math.random()

    // Simulate different tracking statuses
    if (random < 0.1) {
      return { status: "delivered", location: "Delivered to customer" }
    } else if (random < 0.3) {
      return { status: "out_for_delivery", location: "Out for delivery" }
    } else if (random < 0.7) {
      return { status: "in_transit", location: "In transit" }
    } else {
      return { status: "pending", location: "Package picked up" }
    }
  }

  private sendShipmentNotification(order: any, shipment: any) {
    if (this.config.notifications.emailEnabled) {
      this.sendEmailNotification(order.customer_email, "shipment_created", {
        orderNumber: order.id,
        trackingNumber: shipment.tracking_number,
        carrier: shipment.carrier,
        estimatedDelivery: shipment.estimated_delivery,
      })
    }
  }

  private sendEmailNotification(email: string, type: string, data: any) {
    // Simulate email sending
    console.log(`Sending ${type} email to ${email}:`, data)
  }

  // Storage methods (these would interact with your actual data store)
  private getOrdersFromStorage() {
    const data = localStorage.getItem("appData")
    return data ? JSON.parse(data).orders || [] : []
  }

  private getShipmentsFromStorage() {
    const data = localStorage.getItem("appData")
    return data ? JSON.parse(data).shipments || [] : []
  }

  private getReturnsFromStorage() {
    const data = localStorage.getItem("appData")
    return data ? JSON.parse(data).returns || [] : []
  }

  private updateOrderStatus(orderId: string, status: string, note: string) {
    const data = JSON.parse(localStorage.getItem("appData") || "{}")
    const orders = data.orders || []

    const orderIndex = orders.findIndex((o: any) => o.id === orderId)
    if (orderIndex !== -1) {
      orders[orderIndex].status = status
      orders[orderIndex].updated_at = new Date().toISOString()

      if (status === "shipped") {
        orders[orderIndex].shipped_date = new Date().toISOString()
      } else if (status === "delivered") {
        orders[orderIndex].delivered_date = new Date().toISOString()
      }

      data.orders = orders
      localStorage.setItem("appData", JSON.stringify(data))

      // Add activity log
      this.addActivity("order", "Status Updated", `${note} for order ${orderId}`)
    }
  }

  private updateShipmentStatus(shipmentId: string, status: string) {
    const data = JSON.parse(localStorage.getItem("appData") || "{}")
    const shipments = data.shipments || []

    const shipmentIndex = shipments.findIndex((s: any) => s.id === shipmentId)
    if (shipmentIndex !== -1) {
      shipments[shipmentIndex].status = status

      if (status === "delivered") {
        shipments[shipmentIndex].actual_delivery = new Date().toISOString()
      }

      data.shipments = shipments
      localStorage.setItem("appData", JSON.stringify(data))
    }
  }

  private saveShipment(shipment: any) {
    const data = JSON.parse(localStorage.getItem("appData") || "{}")
    const shipments = data.shipments || []

    shipments.push(shipment)
    data.shipments = shipments
    localStorage.setItem("appData", JSON.stringify(data))
  }

  private updateReturnStatus(returnId: string, status: string, note: string) {
    const data = JSON.parse(localStorage.getItem("appData") || "{}")
    const returns = data.returns || []

    const returnIndex = returns.findIndex((r: any) => r.id === returnId)
    if (returnIndex !== -1) {
      returns[returnIndex].status = status

      if (status === "approved") {
        returns[returnIndex].approved_date = new Date().toISOString()
      }

      data.returns = returns
      localStorage.setItem("appData", JSON.stringify(data))

      this.addActivity("refund", "Return Updated", `${note} for return ${returnId}`)
    }
  }

  private processAutomaticRefund(returnId: string) {
    const data = JSON.parse(localStorage.getItem("appData") || "{}")
    const returns = data.returns || []

    const returnIndex = returns.findIndex((r: any) => r.id === returnId)
    if (returnIndex !== -1) {
      const refundId = `REF-${Date.now()}`

      returns[returnIndex].status = "processed"
      returns[returnIndex].processed_date = new Date().toISOString()
      returns[returnIndex].refund_id = refundId

      data.returns = returns
      localStorage.setItem("appData", JSON.stringify(data))

      this.addActivity("refund", "Refund Processed", `Automatic refund ${refundId} processed for return ${returnId}`)
    }
  }

  private addActivity(type: string, action: string, details: string) {
    const data = JSON.parse(localStorage.getItem("appData") || "{}")
    const activities = data.activities || []

    const activity = {
      id: `act_${Date.now()}`,
      type,
      action,
      details,
      timestamp: new Date().toISOString(),
    }

    activities.unshift(activity)
    data.activities = activities.slice(0, 50) // Keep only last 50 activities
    localStorage.setItem("appData", JSON.stringify(data))
  }
}

// Global automation service instance
export const automationService = new AutomationService()
