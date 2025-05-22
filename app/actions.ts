"use server"

import { createCustomer, createOrder, getProductById } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function submitOrder(formData: FormData) {
  try {
    // Extract customer data
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const address = formData.get("address") as string

    // Extract order items
    const productId = Number.parseInt(formData.get("productId") as string)
    const quantity = Number.parseInt(formData.get("quantity") as string)
    const customRequirements = formData.get("customRequirements") as string

    // Validate inputs
    if (!name || !email || !phone || !address || !productId || !quantity) {
      return { success: false, message: "All fields are required" }
    }

    // Get product details
    const product = await getProductById(productId)
    if (!product) {
      return { success: false, message: "Product not found" }
    }

    // Calculate total amount
    const totalAmount = product.price * quantity

    // Create customer
    const customerId = await createCustomer({
      name,
      email,
      phone,
      address,
    })

    // Create order
    await createOrder({
      customer_id: customerId,
      total_amount: totalAmount,
      items: [
        {
          product_id: productId,
          quantity,
          price: product.price,
          custom_requirements: customRequirements,
        },
      ],
    })

    revalidatePath("/")

    return {
      success: true,
      message: "Order submitted successfully! We will contact you shortly.",
    }
  } catch (error) {
    console.error("Order submission error:", error)
    return {
      success: false,
      message: "An error occurred while submitting your order. Please try again.",
    }
  }
}
