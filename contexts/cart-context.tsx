"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"

interface CartItem {
  id: string
  product_id: string
  product_name: string
  product_price: number
  quantity: number
  image_url?: string
}

interface CartState {
  items: CartItem[]
  total: number
  itemCount: number
}

type CartAction =
  | { type: "SET_CART"; payload: CartItem[] }
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "CLEAR_CART" }

const CartContext = createContext<{
  state: CartState
  addToCart: (product: any) => void
  updateQuantity: (id: string, quantity: number) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
} | null>(null)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "SET_CART":
      const total = action.payload.reduce((sum, item) => sum + item.product_price * item.quantity, 0)
      const itemCount = action.payload.reduce((sum, item) => sum + item.quantity, 0)
      return { items: action.payload, total, itemCount }

    case "ADD_ITEM":
      const existingItem = state.items.find((item) => item.product_id === action.payload.product_id)
      let newItems

      if (existingItem) {
        newItems = state.items.map((item) =>
          item.product_id === action.payload.product_id
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item,
        )
      } else {
        newItems = [...state.items, action.payload]
      }

      return {
        items: newItems,
        total: newItems.reduce((sum, item) => sum + item.product_price * item.quantity, 0),
        itemCount: newItems.reduce((sum, item) => sum + item.quantity, 0),
      }

    case "UPDATE_QUANTITY":
      const updatedItems = state.items.map((item) =>
        item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item,
      )
      return {
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => sum + item.product_price * item.quantity, 0),
        itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
      }

    case "REMOVE_ITEM":
      const filteredItems = state.items.filter((item) => item.id !== action.payload)
      return {
        items: filteredItems,
        total: filteredItems.reduce((sum, item) => sum + item.product_price * item.quantity, 0),
        itemCount: filteredItems.reduce((sum, item) => sum + item.quantity, 0),
      }

    case "CLEAR_CART":
      return { items: [], total: 0, itemCount: 0 }

    default:
      return state
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0, itemCount: 0 })

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart)
        dispatch({ type: "SET_CART", payload: cartData })
      } catch (error) {
        console.error("Error loading cart from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state.items))
  }, [state.items])

  const addToCart = (product: any) => {
    const cartItem = {
      id: `${product.id}-${Date.now()}`,
      product_id: product.id,
      product_name: product.name,
      product_price: product.price,
      quantity: 1,
      image_url: product.image_url,
    }
    dispatch({ type: "ADD_ITEM", payload: cartItem })
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } })
  }

  const removeFromCart = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  return (
    <CartContext.Provider
      value={{
        state,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}
