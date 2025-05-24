import { createServerSupabaseClient } from "@/lib/supabase"
import { logger } from "@/lib/logger"

export async function seedProducts() {
  try {
    const supabase = createServerSupabaseClient()

    const products = [
      {
        name: "Traditional Kaftan",
        description: "Elegant traditional kaftan with intricate embroidery, perfect for special occasions.",
        price: 15000,
        category: "Kaftan",
        image_url: "/placeholder.svg?height=400&width=400&text=Traditional%20Kaftan",
        in_stock: true,
      },
      {
        name: "Modern Agbada",
        description: "Contemporary Agbada design with a modern twist, suitable for weddings and formal events.",
        price: 25000,
        category: "Agbada",
        image_url: "/placeholder.svg?height=400&width=400&text=Modern%20Agbada",
        in_stock: true,
      },
      {
        name: "Casual Ankara Shirt",
        description: "Stylish casual shirt made from vibrant Ankara fabric, perfect for everyday wear.",
        price: 8000,
        category: "Casual",
        image_url: "/placeholder.svg?height=400&width=400&text=Ankara%20Shirt",
        in_stock: true,
      },
      {
        name: "Embroidered Senator",
        description: "Classic Senator style with detailed embroidery, ideal for business and formal settings.",
        price: 12000,
        category: "Senator",
        image_url: "/placeholder.svg?height=400&width=400&text=Embroidered%20Senator",
        in_stock: true,
      },
      {
        name: "Dashiki Set",
        description: "Colorful Dashiki set with matching pants, celebrating African heritage with modern styling.",
        price: 10000,
        category: "Dashiki",
        image_url: "/placeholder.svg?height=400&width=400&text=Dashiki%20Set",
        in_stock: true,
      },
      {
        name: "Luxury Babariga",
        description: "Premium Babariga outfit with gold embroidery, designed for royalty and special celebrations.",
        price: 30000,
        category: "Babariga",
        image_url: "/placeholder.svg?height=400&width=400&text=Luxury%20Babariga",
        in_stock: true,
      },
    ]

    for (const product of products) {
      try {
        const { error } = await supabase.from("products").upsert(product, { onConflict: "name" })

        if (error) {
          logger.error(`Error inserting product ${product.name}:`, error)
        }
      } catch (error) {
        logger.error(`Error inserting product ${product.name}:`, error)
      }
    }

    logger.info("Products seeded successfully!")
  } catch (error) {
    logger.error("Failed to seed products:", error)
    throw error
  }
}
