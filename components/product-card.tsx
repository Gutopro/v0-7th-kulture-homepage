"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { submitOrder } from "@/app/actions"
import type { Product } from "@/lib/db"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)

    try {
      const result = await submitOrder(formData)

      if (result.success) {
        toast({
          title: "Order Submitted",
          description: result.message,
        })
        setIsOpen(false)
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="aspect-square relative overflow-hidden">
          <Image
            src={product.image_url || `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(product.name)}`}
            alt={product.name}
            fill
            className="object-cover transition-transform hover:scale-105"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium text-lg">{product.name}</h3>
          <p className="text-muted-foreground text-sm line-clamp-2 mt-1">{product.description}</p>
          <p className="font-bold mt-2">₦{product.price.toLocaleString()}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button onClick={() => setIsOpen(true)} className="w-full">
            Order Now
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Order {product.name}</DialogTitle>
            <DialogDescription>
              Fill out the form below to place your order. We'll contact you to confirm details.
            </DialogDescription>
          </DialogHeader>
          <form action={handleSubmit} className="space-y-4">
            <input type="hidden" name="productId" value={product.id} />
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Delivery Address</Label>
              <Textarea id="address" name="address" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" name="quantity" type="number" min="1" defaultValue="1" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customRequirements">Custom Requirements (Optional)</Label>
              <Textarea
                id="customRequirements"
                name="customRequirements"
                placeholder="Specific size, color preferences, or design modifications"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Place Order"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
