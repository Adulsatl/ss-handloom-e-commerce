"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import { automationService } from "@/lib/automation-service"
import { notificationService, type NotificationData } from "@/lib/notification-service"
import { realCourierAPI } from "@/lib/courier-api-real"

// Add site settings interface
interface SiteSettings {
  logos?: {
    mainLogo?: string
    footerLogo?: string
    favicon?: string
    mobileLogo?: string
  }
  banners?: Array<{
    id: string
    imageUrl: string
    title: string
    subtitle?: string
    link?: string
    active: boolean
  }>
  contactInfo?: {
    email: string
    phone: string
    address: string
  }
  socialLinks?: {
    facebook?: string
    instagram?: string
    twitter?: string
  }
}

interface Product {
  id: string
  name: string
  price: number
  category: string
  size: string[]
  stock: number
  status: "active" | "inactive"
  image_url: string
  description: string
  created_at: string
  updated_at: string
}

interface Order {
  id: string
  customer_id: string
  customer_name: string
  customer_email: string
  items: Array<{
    product_id: string
    product_name: string
    quantity: number
    price: number
  }>
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  payment_method: "prepaid" | "cod"
  payment_id?: string
  shipping_address: any
  created_at: string
  updated_at: string
  tracking_number?: string
  shipped_date?: string
  delivered_date?: string
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  orders: number
  totalSpent: number
  status: "active" | "vip" | "new" | "blocked"
  joinDate: string
  lastOrderDate?: string
}

interface Review {
  id: string
  customer_id: string
  customer_name: string
  product_id: string
  product_name: string
  rating: number
  title: string
  comment: string
  status: "pending" | "approved" | "rejected"
  date: string
  helpful_count: number
}

interface Category {
  id: string
  name: string
  slug: string
  description: string
  productCount: number
  status: "active" | "inactive"
  created_at: string
}

interface Shipment {
  id: string
  order_id: string
  tracking_number: string
  carrier: string
  status: "pending" | "in_transit" | "out_for_delivery" | "delivered" | "failed"
  shipped_date?: string
  estimated_delivery?: string
  actual_delivery?: string
  tracking_updates: Array<{
    timestamp: string
    status: string
    location: string
    description: string
  }>
}

interface ReturnRequest {
  id: string
  order_id: string
  customer_id: string
  customer_name: string
  product_id: string
  product_name: string
  reason: string
  status: "pending" | "approved" | "rejected" | "processed"
  amount: number
  request_date: string
  approved_date?: string
  processed_date?: string
  refund_id?: string
}

interface Activity {
  id: string
  type: "order" | "product" | "customer" | "review" | "shipment" | "refund" | "automation"
  action: string
  details: string
  timestamp: string
  user_id?: string
  automated?: boolean
}

interface AppState {
  products: Product[]
  orders: Order[]
  customers: Customer[]
  reviews: Review[]
  categories: Category[]
  shipments: Shipment[]
  returns: ReturnRequest[]
  activities: Activity[]
  automationEnabled: boolean
  siteSettings: SiteSettings
  notificationsEnabled: boolean
}

type AppAction =
  | { type: "ADD_PRODUCT"; payload: Product }
  | { type: "UPDATE_PRODUCT"; payload: Product }
  | { type: "DELETE_PRODUCT"; payload: string }
  | { type: "ADD_ORDER"; payload: Order }
  | { type: "UPDATE_ORDER"; payload: { id: string; updates: Partial<Order> } }
  | { type: "ADD_CUSTOMER"; payload: Customer }
  | { type: "UPDATE_CUSTOMER"; payload: Customer }
  | { type: "ADD_REVIEW"; payload: Review }
  | { type: "UPDATE_REVIEW"; payload: { id: string; updates: Partial<Review> } }
  | { type: "ADD_CATEGORY"; payload: Category }
  | { type: "UPDATE_CATEGORY"; payload: Category }
  | { type: "DELETE_CATEGORY"; payload: string }
  | { type: "ADD_SHIPMENT"; payload: Shipment }
  | { type: "UPDATE_SHIPMENT"; payload: { id: string; updates: Partial<Shipment> } }
  | { type: "ADD_RETURN"; payload: ReturnRequest }
  | { type: "UPDATE_RETURN"; payload: { id: string; updates: Partial<ReturnRequest> } }
  | { type: "ADD_ACTIVITY"; payload: Activity }
  | { type: "LOAD_DATA"; payload: AppState }
  | { type: "TOGGLE_AUTOMATION"; payload: boolean }
  | { type: "UPDATE_SITE_SETTINGS"; payload: Partial<SiteSettings> }
  | { type: "TOGGLE_NOTIFICATIONS"; payload: boolean }

const initialState: AppState = {
  products: [
    {
      id: "1",
      name: "Traditional Kasavu Saree",
      price: 2500,
      category: "sarees",
      size: ["Free Size"],
      stock: 15,
      status: "active",
      image_url: "/placeholder.svg?height=300&width=300",
      description: "Beautiful traditional Kasavu saree with golden border",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Handwoven Cotton Fabric",
      price: 800,
      category: "fabrics",
      size: ["1 Meter", "2 Meter", "5 Meter"],
      stock: 32,
      status: "active",
      image_url: "/placeholder.svg?height=300&width=300",
      description: "Premium handwoven cotton fabric",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "3",
      name: "Balaramapuram Silk Saree",
      price: 4500,
      category: "sarees",
      size: ["Free Size"],
      stock: 8,
      status: "active",
      image_url: "/placeholder.svg?height=300&width=300",
      description: "Exquisite silk saree from Balaramapuram",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "4",
      name: "Traditional Mundu",
      price: 1200,
      category: "mens-wear",
      size: ["S", "M", "L", "XL"],
      stock: 20,
      status: "active",
      image_url: "/placeholder.svg?height=300&width=300",
      description: "Traditional Kerala mundu for men",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  orders: [],
  customers: [],
  reviews: [],
  categories: [
    {
      id: "1",
      name: "Traditional Sarees",
      slug: "sarees",
      description: "Elegant handwoven sarees with intricate designs",
      productCount: 2,
      status: "active",
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Premium Fabrics",
      slug: "fabrics",
      description: "High-quality handloom fabrics for all occasions",
      productCount: 1,
      status: "active",
      created_at: new Date().toISOString(),
    },
    {
      id: "3",
      name: "Men's Collection",
      slug: "mens-wear",
      description: "Traditional mundus and men's handloom wear",
      productCount: 1,
      status: "active",
      created_at: new Date().toISOString(),
    },
  ],
  shipments: [],
  returns: [],
  activities: [],
  automationEnabled: true,
  notificationsEnabled: true,
  siteSettings: {
    logos: {
      mainLogo: "/placeholder.svg?height=60&width=200",
      footerLogo: "/placeholder.svg?height=60&width=160",
      favicon: "/placeholder.svg?height=32&width=32",
      mobileLogo: "/placeholder.svg?height=40&width=40",
    },
    banners: [],
    contactInfo: {
      email: "info@ssbalaramapuram.com",
      phone: "+91 9876543210",
      address: "Balaramapuram, Thiruvananthapuram, Kerala, India - 695501",
    },
    socialLinks: {
      facebook: "https://facebook.com/ssbalaramapuram",
      instagram: "https://instagram.com/ssbalaramapuram",
      twitter: "https://twitter.com/ssbalaramapuram",
    },
  },
}

const AppContext = createContext<{
  state: AppState
  addProduct: (product: Omit<Product, "id" | "created_at" | "updated_at">) => void
  updateProduct: (product: Product) => void
  deleteProduct: (id: string) => void
  addOrder: (order: Omit<Order, "id" | "created_at" | "updated_at">) => string
  updateOrder: (id: string, updates: Partial<Order>) => void
  addCustomer: (customer: Omit<Customer, "id">) => void
  updateCustomer: (customer: Customer) => void
  addReview: (review: Omit<Review, "id">) => void
  updateReview: (id: string, updates: Partial<Review>) => void
  addCategory: (category: Omit<Category, "id" | "created_at">) => void
  updateCategory: (category: Category) => void
  deleteCategory: (id: string) => void
  addShipment: (shipment: Omit<Shipment, "id">) => void
  updateShipment: (id: string, updates: Partial<Shipment>) => void
  addReturn: (returnReq: Omit<ReturnRequest, "id">) => void
  updateReturn: (id: string, updates: Partial<ReturnRequest>) => void
  addActivity: (activity: Omit<Activity, "id" | "timestamp">) => void
  processRefund: (returnId: string) => void
  createShipment: (orderId: string, carrier: string, manualTrackingId?: string) => void
  toggleAutomation: (enabled: boolean) => void
  toggleNotifications: (enabled: boolean) => void
  updateSiteSettings: (settings: Partial<SiteSettings>) => void
  getTrackingInfo: (trackingNumber: string, carrier: string) => Promise<any>
  testNotification: (type: string, email?: string) => Promise<boolean>
} | null>(null)

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "ADD_PRODUCT":
      return {
        ...state,
        products: [...state.products, action.payload],
      }
    case "UPDATE_PRODUCT":
      return {
        ...state,
        products: state.products.map((p) => (p.id === action.payload.id ? action.payload : p)),
      }
    case "DELETE_PRODUCT":
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.payload),
      }
    case "ADD_ORDER":
      return {
        ...state,
        orders: [...state.orders, action.payload],
      }
    case "UPDATE_ORDER":
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.payload.id ? { ...o, ...action.payload.updates, updated_at: new Date().toISOString() } : o,
        ),
      }
    case "ADD_CUSTOMER":
      return {
        ...state,
        customers: [...state.customers, action.payload],
      }
    case "UPDATE_CUSTOMER":
      return {
        ...state,
        customers: state.customers.map((c) => (c.id === action.payload.id ? action.payload : c)),
      }
    case "ADD_REVIEW":
      return {
        ...state,
        reviews: [...state.reviews, action.payload],
      }
    case "UPDATE_REVIEW":
      return {
        ...state,
        reviews: state.reviews.map((r) => (r.id === action.payload.id ? { ...r, ...action.payload.updates } : r)),
      }
    case "ADD_CATEGORY":
      return {
        ...state,
        categories: [...state.categories, action.payload],
      }
    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories.map((c) => (c.id === action.payload.id ? action.payload : c)),
      }
    case "DELETE_CATEGORY":
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.payload),
      }
    case "ADD_SHIPMENT":
      return {
        ...state,
        shipments: [...state.shipments, action.payload],
      }
    case "UPDATE_SHIPMENT":
      return {
        ...state,
        shipments: state.shipments.map((s) => (s.id === action.payload.id ? { ...s, ...action.payload.updates } : s)),
      }
    case "ADD_RETURN":
      return {
        ...state,
        returns: [...state.returns, action.payload],
      }
    case "UPDATE_RETURN":
      return {
        ...state,
        returns: state.returns.map((r) => (r.id === action.payload.id ? { ...r, ...action.payload.updates } : r)),
      }
    case "ADD_ACTIVITY":
      return {
        ...state,
        activities: [action.payload, ...state.activities].slice(0, 100), // Keep only last 100 activities
      }
    case "LOAD_DATA":
      return action.payload
    case "TOGGLE_AUTOMATION":
      return {
        ...state,
        automationEnabled: action.payload,
      }
    case "TOGGLE_NOTIFICATIONS":
      return {
        ...state,
        notificationsEnabled: action.payload,
      }
    case "UPDATE_SITE_SETTINGS":
      return {
        ...state,
        siteSettings: {
          ...state.siteSettings,
          ...action.payload,
        },
      }
    default:
      return state
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("appData")
    if (savedData) {
      try {
        const data = JSON.parse(savedData)
        dispatch({ type: "LOAD_DATA", payload: { ...initialState, ...data } })
      } catch (error) {
        console.error("Error loading app data:", error)
      }
    }
  }, [])

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("appData", JSON.stringify(state))
  }, [state])

  // Start/stop automation based on state
  useEffect(() => {
    if (state.automationEnabled) {
      automationService.startAutomation()
      addActivity({
        type: "automation",
        action: "Automation Started",
        details: "Automated order processing, shipping, and delivery tracking enabled",
        automated: true,
      })
    } else {
      automationService.stopAutomation()
      addActivity({
        type: "automation",
        action: "Automation Stopped",
        details: "Automated processes have been disabled",
        automated: true,
      })
    }

    return () => {
      automationService.stopAutomation()
    }
  }, [state.automationEnabled])

  const addActivity = (activity: Omit<Activity, "id" | "timestamp">) => {
    const newActivity = {
      ...activity,
      id: `act_${Date.now()}`,
      timestamp: new Date().toISOString(),
    }
    dispatch({ type: "ADD_ACTIVITY", payload: newActivity })
  }

  const sendOrderNotification = async (order: Order, type: string) => {
    if (!state.notificationsEnabled) return

    const notificationData: NotificationData = {
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.shipping_address?.phone,
      orderNumber: order.id,
      orderTotal: order.total,
      orderItems: order.items.map((item) => ({
        name: item.product_name,
        quantity: item.quantity,
        price: item.price,
      })),
      paymentMethod: order.payment_method === "prepaid" ? "Prepaid (Razorpay)" : "Cash on Delivery",
      paymentId: order.payment_id,
      trackingNumber: order.tracking_number,
      carrier: state.shipments.find((s) => s.order_id === order.id)?.carrier,
      estimatedDelivery: state.shipments.find((s) => s.order_id === order.id)?.estimated_delivery,
      shippingAddress: order.shipping_address,
    }

    try {
      await notificationService.sendNotification(type, notificationData, ["email", "sms"])
      addActivity({
        type: "order",
        action: "Notification Sent",
        details: `${type} notification sent to ${order.customer_email}`,
        automated: true,
      })
    } catch (error) {
      console.error("Failed to send notification:", error)
      addActivity({
        type: "order",
        action: "Notification Failed",
        details: `Failed to send ${type} notification to ${order.customer_email}`,
        automated: true,
      })
    }
  }

  const addProduct = (product: Omit<Product, "id" | "created_at" | "updated_at">) => {
    const now = new Date().toISOString()
    const newProduct = {
      ...product,
      id: `prod_${Date.now()}`,
      created_at: now,
      updated_at: now,
    }
    dispatch({ type: "ADD_PRODUCT", payload: newProduct })
    addActivity({
      type: "product",
      action: "Product Added",
      details: `New product "${product.name}" added to catalog`,
    })
  }

  const updateProduct = (product: Product) => {
    const updatedProduct = { ...product, updated_at: new Date().toISOString() }
    dispatch({ type: "UPDATE_PRODUCT", payload: updatedProduct })
    addActivity({
      type: "product",
      action: "Product Updated",
      details: `Product "${product.name}" updated`,
    })
  }

  const deleteProduct = (id: string) => {
    const product = state.products.find((p) => p.id === id)
    dispatch({ type: "DELETE_PRODUCT", payload: id })
    if (product) {
      addActivity({
        type: "product",
        action: "Product Deleted",
        details: `Product "${product.name}" removed from catalog`,
      })
    }
  }

  const addOrder = (order: Omit<Order, "id" | "created_at" | "updated_at">) => {
    const now = new Date().toISOString()
    const newOrder = {
      ...order,
      id: `ORD-${Date.now()}`,
      created_at: now,
      updated_at: now,
    }

    // Reduce stock for ordered items
    order.items.forEach((item) => {
      const product = state.products.find((p) => p.id === item.product_id)
      if (product && product.stock >= item.quantity) {
        const updatedProduct = {
          ...product,
          stock: product.stock - item.quantity,
          updated_at: now,
        }
        dispatch({ type: "UPDATE_PRODUCT", payload: updatedProduct })
      }
    })

    // Add the order to state
    dispatch({ type: "ADD_ORDER", payload: newOrder })

    // Log the order creation
    console.log("New order created:", newOrder)

    // Add activity log
    addActivity({
      type: "order",
      action: "New Order",
      details: `Order ${newOrder.id} placed by ${order.customer_name} for ₹${order.total}`,
    })

    // Send order confirmation notification
    setTimeout(() => {
      sendOrderNotification(newOrder, "order_confirmation")

      // Send payment success notification for prepaid orders
      if (order.payment_method === "prepaid" && order.payment_id) {
        setTimeout(() => {
          sendOrderNotification(newOrder, "payment_success")
        }, 1000)
      }
    }, 500)

    // Add or update customer
    const existingCustomer = state.customers.find((c) => c.email === order.customer_email)
    if (existingCustomer) {
      const updatedCustomer = {
        ...existingCustomer,
        orders: existingCustomer.orders + 1,
        totalSpent: existingCustomer.totalSpent + order.total,
        status: existingCustomer.totalSpent + order.total > 10000 ? ("vip" as const) : ("active" as const),
        lastOrderDate: now,
      }
      dispatch({ type: "UPDATE_CUSTOMER", payload: updatedCustomer })
    } else {
      const newCustomer = {
        id: `cust_${Date.now()}`,
        name: order.customer_name,
        email: order.customer_email,
        phone: order.shipping_address?.phone || "",
        orders: 1,
        totalSpent: order.total,
        status: "new" as const,
        joinDate: now.split("T")[0],
        lastOrderDate: now,
      }
      dispatch({ type: "ADD_CUSTOMER", payload: newCustomer })
      addActivity({
        type: "customer",
        action: "New Customer",
        details: `New customer ${order.customer_name} registered`,
      })
    }

    // Force save to localStorage
    setTimeout(() => {
      localStorage.setItem(
        "appData",
        JSON.stringify({
          ...state,
          orders: [...state.orders, newOrder],
        }),
      )
    }, 100)

    return newOrder.id
  }

  const updateOrder = (id: string, updates: Partial<Order>) => {
    const order = state.orders.find((o) => o.id === id)
    dispatch({ type: "UPDATE_ORDER", payload: { id, updates } })

    if (order && updates.status) {
      addActivity({
        type: "order",
        action: "Order Updated",
        details: `Order ${id} status changed to ${updates.status}`,
        automated: updates.status === "processing" || updates.status === "shipped",
      })

      // Send notifications for status changes
      const updatedOrder = { ...order, ...updates }

      if (updates.status === "shipped") {
        setTimeout(() => {
          sendOrderNotification(updatedOrder, "order_shipped")
        }, 500)
      } else if (updates.status === "delivered") {
        setTimeout(() => {
          sendOrderNotification(updatedOrder, "order_delivered")
        }, 500)
      }
    }
  }

  const addCustomer = (customer: Omit<Customer, "id">) => {
    const newCustomer = { ...customer, id: `cust_${Date.now()}` }
    dispatch({ type: "ADD_CUSTOMER", payload: newCustomer })
  }

  const updateCustomer = (customer: Customer) => {
    dispatch({ type: "UPDATE_CUSTOMER", payload: customer })
  }

  const addReview = (review: Omit<Review, "id">) => {
    const newReview = { ...review, id: `rev_${Date.now()}` }
    dispatch({ type: "ADD_REVIEW", payload: newReview })
    addActivity({
      type: "review",
      action: "New Review",
      details: `${review.customer_name} reviewed "${review.product_name}" - ${review.rating} stars`,
    })
  }

  const updateReview = (id: string, updates: Partial<Review>) => {
    dispatch({ type: "UPDATE_REVIEW", payload: { id, updates } })
    const review = state.reviews.find((r) => r.id === id)
    if (review && updates.status) {
      addActivity({
        type: "review",
        action: "Review Updated",
        details: `Review for "${review.product_name}" ${updates.status}`,
      })
    }
  }

  const addCategory = (category: Omit<Category, "id" | "created_at">) => {
    const newCategory = {
      ...category,
      id: `cat_${Date.now()}`,
      created_at: new Date().toISOString(),
    }
    dispatch({ type: "ADD_CATEGORY", payload: newCategory })
    addActivity({
      type: "product",
      action: "Category Added",
      details: `New category "${category.name}" created`,
    })
  }

  const updateCategory = (category: Category) => {
    dispatch({ type: "UPDATE_CATEGORY", payload: category })
  }

  const deleteCategory = (id: string) => {
    const category = state.categories.find((c) => c.id === id)
    dispatch({ type: "DELETE_CATEGORY", payload: id })
    if (category) {
      addActivity({
        type: "product",
        action: "Category Deleted",
        details: `Category "${category.name}" removed`,
      })
    }
  }

  const createShipment = async (orderId: string, carrier: string, manualTrackingId?: string) => {
    const order = state.orders.find((o) => o.id === orderId)
    if (order) {
      let trackingNumber = manualTrackingId || ""

      if (!manualTrackingId && realCourierAPI.hasCredentials(carrier)) {
        try {
          const shipmentDetails = {
            orderId: order.id,
            customerName: order.customer_name,
            customerPhone: order.shipping_address?.phone || "",
            customerEmail: order.customer_email,
            pickupAddress: {
              name: "SS Balaramapuram Handlooms",
              address: "Main Street, Balaramapuram",
              city: "Thiruvananthapuram",
              state: "Kerala",
              pincode: "695501",
              phone: "+919876543210",
            },
            deliveryAddress: {
              name: order.shipping_address?.name || order.customer_name,
              address: order.shipping_address?.address || "",
              city: order.shipping_address?.city || "",
              state: order.shipping_address?.state || "",
              pincode: order.shipping_address?.pincode || "",
              phone: order.shipping_address?.phone || "",
            },
            packageDetails: {
              weight: 1,
              items: order.items.map((item) => ({
                name: item.product_name,
                quantity: item.quantity,
                price: item.price,
              })),
            },
            paymentMode: order.payment_method === "cod" ? "cod" : "prepaid",
            codAmount: order.payment_method === "cod" ? order.total : 0,
          }

          trackingNumber = await realCourierAPI.createShipment(carrier, shipmentDetails)
        } catch (error) {
          console.error("Failed to create shipment via API:", error)
          // Fallback to manual tracking
          trackingNumber = `${carrier.toUpperCase()}${Date.now()}`
        }
      } else if (!manualTrackingId) {
        trackingNumber = `${carrier.toUpperCase()}${Date.now()}`
      }

      const shipment = {
        order_id: orderId,
        tracking_number: trackingNumber,
        carrier,
        status: "pending" as const,
        shipped_date: new Date().toISOString(),
        estimated_delivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        tracking_updates: [
          {
            timestamp: new Date().toISOString(),
            status: "pending",
            location: "Warehouse",
            description: "Package prepared for shipment",
          },
        ],
      }
      addShipment(shipment)
      updateOrder(orderId, {
        status: "shipped",
        tracking_number: trackingNumber,
        shipped_date: new Date().toISOString(),
      })
    }
  }

  const addShipment = (shipment: Omit<Shipment, "id">) => {
    const newShipment = {
      ...shipment,
      id: `ship_${Date.now()}`,
      tracking_updates: [],
    }
    dispatch({ type: "ADD_SHIPMENT", payload: newShipment })
    addActivity({
      type: "shipment",
      action: "Shipment Created",
      details: `Shipment ${newShipment.tracking_number} created for order ${shipment.order_id}`,
      automated: true,
    })
  }

  const updateShipment = (id: string, updates: Partial<Shipment>) => {
    dispatch({ type: "UPDATE_SHIPMENT", payload: { id, updates } })

    if (updates.status) {
      const shipment = state.shipments.find((s) => s.id === id)
      if (shipment) {
        addActivity({
          type: "shipment",
          action: "Tracking Updated",
          details: `Shipment ${shipment.tracking_number} status: ${updates.status}`,
          automated: true,
        })
      }
    }
  }

  const addReturn = (returnReq: Omit<ReturnRequest, "id">) => {
    const newReturn = { ...returnReq, id: `ret_${Date.now()}` }
    dispatch({ type: "ADD_RETURN", payload: newReturn })
    addActivity({
      type: "refund",
      action: "Return Request",
      details: `Return request for order ${returnReq.order_id} - ₹${returnReq.amount}`,
    })
  }

  const updateReturn = (id: string, updates: Partial<ReturnRequest>) => {
    dispatch({ type: "UPDATE_RETURN", payload: { id, updates } })
    const returnReq = state.returns.find((r) => r.id === id)
    if (returnReq && updates.status) {
      addActivity({
        type: "refund",
        action: "Return Updated",
        details: `Return request ${id} ${updates.status}`,
        automated: updates.status === "approved" || updates.status === "processed",
      })
    }
  }

  const processRefund = (returnId: string) => {
    const returnReq = state.returns.find((r) => r.id === returnId)
    if (returnReq) {
      const refundId = `REF-${Date.now()}`
      updateReturn(returnId, {
        status: "processed",
        processed_date: new Date().toISOString(),
        refund_id: refundId,
      })
      addActivity({
        type: "refund",
        action: "Refund Processed",
        details: `Refund ₹${returnReq.amount} processed for ${returnReq.customer_name}`,
        automated: true,
      })
    }
  }

  const toggleAutomation = (enabled: boolean) => {
    dispatch({ type: "TOGGLE_AUTOMATION", payload: enabled })
  }

  const toggleNotifications = (enabled: boolean) => {
    dispatch({ type: "TOGGLE_NOTIFICATIONS", payload: enabled })
    addActivity({
      type: "automation",
      action: enabled ? "Notifications Enabled" : "Notifications Disabled",
      details: `Email and SMS notifications ${enabled ? "enabled" : "disabled"}`,
    })
  }

  const getTrackingInfo = async (trackingNumber: string, carrier: string) => {
    // Simulate API call to get tracking information
    const shipment = state.shipments.find((s) => s.tracking_number === trackingNumber)

    if (!shipment) {
      throw new Error("Shipment not found")
    }

    // Simulate tracking updates
    const updates = [
      {
        timestamp: shipment.shipped_date || new Date().toISOString(),
        status: "pending",
        location: "Warehouse",
        description: "Package prepared for shipment",
      },
      {
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        status: "in_transit",
        location: "Sorting Facility",
        description: "Package in transit",
      },
      {
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        status: "out_for_delivery",
        location: "Local Delivery Hub",
        description: "Out for delivery",
      },
    ]

    if (shipment.status === "delivered") {
      updates.push({
        timestamp: shipment.actual_delivery || new Date().toISOString(),
        status: "delivered",
        location: "Customer Address",
        description: "Package delivered successfully",
      })
    }

    return {
      trackingNumber,
      carrier,
      status: shipment.status,
      updates,
      estimatedDelivery: shipment.estimated_delivery,
      actualDelivery: shipment.actual_delivery,
    }
  }

  const testNotification = async (type: string, email?: string) => {
    const testData = {
      customerName: "Test Customer",
      customerEmail: email || "test@example.com",
      customerPhone: "+919876543210",
      orderNumber: `TEST-${Date.now()}`,
      orderTotal: 2500,
      orderItems: [{ name: "Traditional Kasavu Saree", quantity: 1, price: 2500 }],
      paymentMethod: "Prepaid (Razorpay)",
      paymentId: "pay_test_123456",
      trackingNumber: "TRK123456789",
      carrier: "Delhivery",
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      shippingAddress: {
        name: "Test Customer",
        street: "123 Test Street",
        city: "Thiruvananthapuram",
        state: "Kerala",
        pincode: "695001",
        phone: "+919876543210",
      },
    }

    try {
      const result = await notificationService.sendNotification(type, testData, ["email"])
      addActivity({
        type: "automation",
        action: "Test Notification",
        details: `Test ${type} notification sent to ${email || "test@example.com"}`,
        automated: true,
      })
      return result
    } catch (error) {
      console.error("Test notification failed:", error)
      return false
    }
  }

  // Add this function to the AppProvider component
  const forceRefreshData = () => {
    const savedData = localStorage.getItem("appData")
    if (savedData) {
      try {
        const data = JSON.parse(savedData)
        dispatch({ type: "LOAD_DATA", payload: { ...initialState, ...data } })
      } catch (error) {
        console.error("Error loading app data:", error)
      }
    }
  }

  // Add this effect to ensure data is refreshed when needed
  useEffect(() => {
    // Refresh data every 30 seconds to ensure consistency
    const interval = setInterval(forceRefreshData, 30000)
    return () => clearInterval(interval)
  }, [])

  const updateSiteSettings = (settings: Partial<SiteSettings>) => {
    dispatch({ type: "UPDATE_SITE_SETTINGS", payload: settings })
    addActivity({
      type: "automation",
      action: "Settings Updated",
      details: "Site settings have been updated",
    })
  }

  return (
    <AppContext.Provider
      value={{
        state,
        addProduct,
        updateProduct,
        deleteProduct,
        addOrder,
        updateOrder,
        addCustomer,
        updateCustomer,
        addReview,
        updateReview,
        addCategory,
        updateCategory,
        deleteCategory,
        addShipment,
        updateShipment,
        addReturn,
        updateReturn,
        addActivity,
        processRefund,
        createShipment,
        toggleAutomation,
        toggleNotifications,
        getTrackingInfo,
        testNotification,
        updateSiteSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within AppProvider")
  }
  return context
}
