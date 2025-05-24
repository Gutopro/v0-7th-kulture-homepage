import { type NextRequest, NextResponse } from "next/server"
import { orderSchema } from "@/lib/validation"
import { createCustomer, createOrder } from "@/lib/db"
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()

  try {
    logger.info("Order API called", { requestId })

    const body = await request.json()
    logger.info("Request body received", { requestId, bodyKeys: Object.keys(body) })

    // Validate the request body
    const validatedData = orderSchema.parse(body)
    logger.info("Data validated successfully", {
      requestId,
      customerEmail: validatedData.customer.email,
      itemCount: validatedData.items.length,
    })

    // Create customer
    logger.info("Creating customer", { requestId, email: validatedData.customer.email })
    const customerId = await createCustomer(validatedData.customer)
    logger.info("Customer created successfully", { requestId, customerId })

    // Create order
    logger.info("Creating order", { requestId, customerId, totalAmount: validatedData.total_amount })
    const orderId = await createOrder({
      customer_id: customerId,
      total_amount: validatedData.total_amount,
      items: validatedData.items,
    })
    logger.info("Order created successfully", { requestId, orderId })

    return NextResponse.json({
      success: true,
      message: "Order placed successfully",
      orderId,
      customerId,
    })
  } catch (error) {
    logger.error("Order creation failed", {
      requestId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })

    // Return a more specific error response
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          requestId,
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred",
        requestId,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: "Orders endpoint is working",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Orders endpoint error",
      },
      { status: 500 },
    )
  }
}
