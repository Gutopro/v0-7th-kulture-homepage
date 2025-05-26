import { NextResponse } from "next/server"
import { seedProducts } from "@/scripts/seed-products"
import { initializeDatabase } from "@/lib/db"

export async function GET() {
  try {
    // First initialize the database tables
    const initResult = await initializeDatabase()
    if (!initResult.success) {
      return NextResponse.json(
        { success: false, message: "Failed to initialize database", error: String(initResult.error) },
        { status: 500 },
      )
    }

    // Then seed the products
    await seedProducts()
    return NextResponse.json({ success: true, message: "Database seeded successfully!" })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json(
      { success: false, message: "Failed to seed database", error: String(error) },
      { status: 500 },
    )
  }
}
