"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, X, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useCart } from "@/context/cart-context"
import { formatCurrency } from "@/lib/utils"

export function Cart() {
  const { items, updateItem, removeItem, totalItems, totalPrice } = useCart()
  const [isOpen, setIsOpen] = useState(false)

  const handleQuantityChange = (productId: number, quantity: number) => {
    if (quantity < 1) return
    updateItem(productId, quantity)
  }

  const handleCustomRequirementsChange = (productId: number, customRequirements: string) => {
    const item = items.find((item) => item.product.id === productId)
    if (item) {
      updateItem(productId, item.quantity, customRequirements)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {totalItems}
            </span>
          )}
          <span className="sr-only">Open cart</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Your Cart</SheetTitle>
        </SheetHeader>

        {items.length > 0 ? (
          <>
            <div className="flex-1 overflow-auto py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4 pb-4 border-b">
                    <div className="w-20 h-20 relative rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={
                          item.product.image_url ||
                          `/placeholder.svg?height=80&width=80&text=${encodeURIComponent(item.product.name)}`
                        }
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">{item.product.name}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground"
                          onClick={() => removeItem(item.product.id)}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">{item.product.category}</p>
                      <p className="text-sm font-medium mt-1">₦{formatCurrency(item.product.price)}</p>

                      <div className="flex items-center mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                          <span className="sr-only">Decrease quantity</span>
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.product.id, Number.parseInt(e.target.value) || 1)}
                          className="h-7 w-12 mx-1 text-center"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                          <span className="sr-only">Increase quantity</span>
                        </Button>
                      </div>

                      <div className="mt-2">
                        <Textarea
                          placeholder="Custom requirements (optional)"
                          value={item.customRequirements || ""}
                          onChange={(e) => handleCustomRequirementsChange(item.product.id, e.target.value)}
                          className="text-xs h-16 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₦{formatCurrency(totalPrice)}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">Calculated at checkout</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="font-bold">Total</span>
                <span className="font-bold">₦{formatCurrency(totalPrice)}</span>
              </div>

              <div className="space-y-2">
                <Button asChild className="w-full" onClick={() => setIsOpen(false)}>
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
                  Continue Shopping
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-8">
            <div className="rounded-full bg-muted p-6">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="font-medium">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground mt-1">Add items to your cart to proceed to checkout</p>
            </div>
            <Button asChild onClick={() => setIsOpen(false)}>
              <Link href="/#products">Browse Products</Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
