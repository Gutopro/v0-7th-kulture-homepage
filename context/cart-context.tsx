"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

export type CartItem = {
  product: {
    id: number
    name: string
    price: number
    image_url?: string
    category?: string
  }
  quantity: number
  customRequirements?: string
}

type CartContextType = {
  items: CartItem[]
  addItem: (product: any, quantity: number, customRequirements?: string) => void
  removeItem: (id: number) => void
  updateItem: (id: number, quantity: number, customRequirements?: string) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("cart")
      if (savedCart) {
        setItems(JSON.parse(savedCart))
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error)
      // If there's an error, just start with an empty cart
    }
    setMounted(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem("cart", JSON.stringify(items))
      } catch (error) {
        console.error("Failed to save cart to localStorage:", error)
      }
    }
  }, [items, mounted])

  const addItem = (product: any, quantity = 1, customRequirements?: string) => {
    setItems((prevItems) => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex((i) => i.product.id === product.id)

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += quantity
        if (customRequirements) {
          updatedItems[existingItemIndex].customRequirements = customRequirements
        }
        toast({
          title: "Cart updated",
          description: `${product.name} quantity increased to ${updatedItems[existingItemIndex].quantity}`,
        })
        return updatedItems
      } else {
        // Add new item
        const newItem: CartItem = {
          product: {
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url,
            category: product.category,
          },
          quantity,
          customRequirements,
        }
        toast({
          title: "Added to cart",
          description: `${product.name} added to your cart`,
        })
        return [...prevItems, newItem]
      }
    })
  }

  const removeItem = (id: number) => {
    setItems((prevItems) => {
      const itemToRemove = prevItems.find((item) => item.product.id === id)
      if (itemToRemove) {
        toast({
          title: "Removed from cart",
          description: `${itemToRemove.product.name} removed from your cart`,
        })
      }
      return prevItems.filter((item) => item.product.id !== id)
    })
  }

  const updateItem = (id: number, quantity: number, customRequirements?: string) => {
    if (quantity < 1) {
      removeItem(id)
      return
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === id
          ? { ...item, quantity, customRequirements: customRequirements ?? item.customRequirements }
          : item,
      ),
    )
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
        removeItem,
        updateItem,
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
