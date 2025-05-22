import { type NextRequest, NextResponse } from "next/server"
import { createProduct } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    requireAuth()

    const { name, description, price, category, image_url, in_stock } = await request.json()

    // Validate required fields
    if (!name || !description || price === undefined || !category) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Create product
    const productId = await createProduct({
      name,
      description,
      price,
      category,
      image_url: image_url || `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(name)}`,
      in_stock: in_stock !== undefined ? in_stock : true,
    })

    return NextResponse.json({
      success: true,
      productId,
      message: "Product created successfully",
    })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ success: false, message: "Failed to create product" }, { status: 500 })
  }
}
