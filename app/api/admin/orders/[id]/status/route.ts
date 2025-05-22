import { type NextRequest, NextResponse } from "next/server"
import { updateOrderStatus } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    requireAuth()

    const orderId = Number.parseInt(params.id)

    if (isNaN(orderId)) {
      return NextResponse.json({ success: false, message: "Invalid order ID" }, { status: 400 })
    }

    const { status } = await request.json()

    if (!status || !["pending", "processing", "completed", "cancelled"].includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 })
    }

    // Update order status
    const success = await updateOrderStatus(orderId, status)

    if (!success) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
    })
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json({ success: false, message: "Failed to update order status" }, { status: 500 })
  }
}
