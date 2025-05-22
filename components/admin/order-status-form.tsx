"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"

interface OrderStatusFormProps {
  orderId: number
  currentStatus: string
}

export function OrderStatusForm({ orderId, currentStatus }: OrderStatusFormProps) {
  const [status, setStatus] = useState(currentStatus)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Status updated",
          description: "The order status has been updated successfully",
        })
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: data.message || "An error occurred. Please try again.",
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <RadioGroup value={status} onValueChange={setStatus}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="pending" id="pending" />
          <Label htmlFor="pending">Pending</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="processing" id="processing" />
          <Label htmlFor="processing">Processing</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="completed" id="completed" />
          <Label htmlFor="completed">Completed</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="cancelled" id="cancelled" />
          <Label htmlFor="cancelled">Cancelled</Label>
        </div>
      </RadioGroup>

      <Button type="submit" disabled={isSubmitting || status === currentStatus}>
        {isSubmitting ? "Updating..." : "Update Status"}
      </Button>
    </form>
  )
}
