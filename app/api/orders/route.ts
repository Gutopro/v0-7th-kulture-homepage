import { type NextRequest, NextResponse } from "next/server"
import { createCustomer, createOrder } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { customer, items, total_amount } = await request.json()

    // Validate required fields
    if (!customer || !items || !total_amount) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    if (!customer.name || !customer.email || !customer.phone || !customer.address) {
      return NextResponse.json({ success: false, message: "Missing customer information" }, { status: 400 })
    }

    if (!items.length) {
      return NextResponse.json({ success: false, message: "No items in order" }, { status: 400 })
    }

    // Create customer
    const customerId = await createCustomer({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
    })

    // Create order
    const orderId = await createOrder({
      customer_id: customerId,
      total_amount,
      items,
    })

    return NextResponse.json({
      success: true,
      orderId,
      message: "Order created successfully",
    })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ success: false, message: "Failed to create order" }, { status: 500 })
  }
}
