import { type NextRequest, NextResponse } from "next/server"
import { getProductById, updateProduct, deleteProduct } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    requireAuth()

    const productId = Number.parseInt(params.id)

    if (isNaN(productId)) {
      return NextResponse.json({ success: false, message: "Invalid product ID" }, { status: 400 })
    }

    const product = await getProductById(productId)

    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    requireAuth()

    const productId = Number.parseInt(params.id)

    if (isNaN(productId)) {
      return NextResponse.json({ success: false, message: "Invalid product ID" }, { status: 400 })
    }

    const { name, description, price, category, image_url, in_stock } = await request.json()

    // Validate required fields
    if (!name || !description || price === undefined || !category) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Update product
    const success = await updateProduct(productId, {
      name,
      description,
      price,
      category,
      image_url,
      in_stock,
    })

    if (!success) {
      return NextResponse.json({ success: false, message: "Product not found or no changes made" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
    })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ success: false, message: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    requireAuth()

    const productId = Number.parseInt(params.id)

    if (isNaN(productId)) {
      return NextResponse.json({ success: false, message: "Invalid product ID" }, { status: 400 })
    }

    // Delete product
    const success = await deleteProduct(productId)

    if (!success) {
      return NextResponse.json(
        { success: false, message: "Product not found or could not be deleted" },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ success: false, message: "Failed to delete product" }, { status: 500 })
  }
}
