import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { getProducts, initializeDatabase } from "@/lib/db"

// Sample data for fallback
const sampleProducts = [
  {
    id: 1,
    name: "Traditional Kaftan",
    description: "Elegant traditional kaftan with intricate embroidery, perfect for special occasions.",
    price: 15000,
    category: "Kaftan",
    image_url: "/placeholder.svg?height=400&width=400&text=Traditional%20Kaftan",
    in_stock: true,
    created_at: new Date(),
  },
  // ... other sample products
]

export default async function ProductsPage() {
  // Initialize the database tables if they don't exist
  await initializeDatabase()

  // Try to fetch products from the database, fallback to sample data if empty or error
  let products
  try {
    products = await getProducts()
    // If no products in database, use sample data
    if (products.length === 0) {
      products = sampleProducts
    }
  } catch (error) {
    console.error("Error fetching products:", error)
    // If there's an error, use sample data
    products = sampleProducts
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">All Products</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover our complete collection of handcrafted pieces that blend traditional African designs with
                modern styles.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
