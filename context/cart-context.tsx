"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Product } from "@/lib/db"
import { useToast } from "@/components/ui/use-toast"

export type CartItem = {
  product: Product
  quantity: number
  customRequirements?: string
}

type CartContextType = {
  items: CartItem[]
  addItem: (product: Product, quantity?: number, customRequirements?: string) => void
  updateItem: (productId: number, quantity: number, customRequirements?: string) => void
  removeItem: (productId: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const { toast } = useToast()

  // Load cart from localStorage on client side
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        setItems(JSON.parse(savedCart))
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error)
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(items))
    } catch (error) {
      console.error("Failed to save cart to localStorage:", error)
    }
  }, [items])

  const addItem = (product: Product, quantity = 1, customRequirements = "") => {
    setItems((prevItems) => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex((item) => item.product.id === product.id)

      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
          customRequirements: customRequirements || updatedItems[existingItemIndex].customRequirements,
        }

        toast({
          title: "Cart updated",
          description: `${product.name} quantity increased to ${updatedItems[existingItemIndex].quantity}`,
        })

        return updatedItems
      } else {
        // Add new item
        toast({
          title: "Added to cart",
          description: `${product.name} added to your cart`,
        })

        return [...prevItems, { product, quantity, customRequirements }]
      }
    })
  }

  const updateItem = (productId: number, quantity: number, customRequirements?: string) => {
    setItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.product.id === productId) {
          return {
            ...item,
            quantity,
            customRequirements: customRequirements !== undefined ? customRequirements : item.customRequirements,
          }
        }
        return item
      })
    })
  }

  const removeItem = (productId: number) => {
    setItems((prevItems) => {
      const itemToRemove = prevItems.find((item) => item.product.id === productId)

      if (itemToRemove) {
        toast({
          title: "Removed from cart",
          description: `${itemToRemove.product.name} removed from your cart`,
        })
      }

      return prevItems.filter((item) => item.product.id !== productId)
    })
  }

  const clearCart = () => {
    setItems([])
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    })
  }

  const totalItems = items.reduce((total, item) => total + item.quantity, 0)

  const totalPrice = items.reduce((total, item) => total + item.product.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
