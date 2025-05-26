import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { Testimonial } from "@/components/testimonial"
import { Button } from "@/components/ui/button"
import { Scissors, Ruler, Package, Users, Mail, Phone, MapPin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Sample data for initial rendering
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
  {
    id: 2,
    name: "Modern Agbada",
    description: "Contemporary Agbada design with a modern twist, suitable for weddings and formal events.",
    price: 25000,
    category: "Agbada",
    image_url: "/placeholder.svg?height=400&width=400&text=Modern%20Agbada",
    in_stock: true,
    created_at: new Date(),
  },
  {
    id: 3,
    name: "Casual Ankara Shirt",
    description: "Stylish casual shirt made from vibrant Ankara fabric, perfect for everyday wear.",
    price: 8000,
    category: "Casual",
    image_url: "/placeholder.svg?height=400&width=400&text=Ankara%20Shirt",
    in_stock: true,
    created_at: new Date(),
  },
  {
    id: 4,
    name: "Embroidered Senator",
    description: "Classic Senator style with detailed embroidery, ideal for business and formal settings.",
    price: 12000,
    category: "Senator",
    image_url: "/placeholder.svg?height=400&width=400&text=Embroidered%20Senator",
    in_stock: true,
    created_at: new Date(),
  },
  {
    id: 5,
    name: "Dashiki Set",
    description: "Colorful Dashiki set with matching pants, celebrating African heritage with modern styling.",
    price: 10000,
    category: "Dashiki",
    image_url: "/placeholder.svg?height=400&width=400&text=Dashiki%20Set",
    in_stock: true,
    created_at: new Date(),
  },
  {
    id: 6,
    name: "Luxury Babariga",
    description: "Premium Babariga outfit with gold embroidery, designed for royalty and special celebrations.",
    price: 30000,
    category: "Babariga",
    image_url: "/placeholder.svg?height=400&width=400&text=Luxury%20Babariga",
    in_stock: true,
    created_at: new Date(),
  },
]

export default async function Home() {
  // Initialize the database tables if they don't exist
  const { initializeDatabase, getFeaturedProducts } = await import("@/lib/db")
  await initializeDatabase()

  // Try to fetch products from the database, fallback to sample data if empty or error
  let products
  try {
    products = await getFeaturedProducts()
    // If no products in database, use sample data
    if (products.length === 0) {
      products = sampleProducts
    }
  } catch (error) {
    console.error("Error fetching products:", error)
    // If there's an error (like table doesn't exist), use sample data
    products = sampleProducts
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* Hero Section */}
      <section className="hero-pattern py-16 md:py-24">
        <div className="container grid gap-8 md:grid-cols-2 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Authentic African <span className="text-primary">Fashion</span> Handcrafted For You
            </h1>
            <p className="text-lg text-muted-foreground">
              Premium kaftans and traditional clothing tailored in Makurdi, Benue State. Elevate your style with our
              authentic African designs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="#products">Shop Now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#contact">Contact Us</Link>
              </Button>
            </div>
          </div>
          <div className="relative aspect-square md:aspect-auto md:h-[500px] rounded-lg overflow-hidden">
            <Image
              src="/placeholder.svg?height=500&width=500&text=African%20Fashion"
              alt="African Fashion"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="products" className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Featured Collection</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover our handcrafted pieces that blend traditional African designs with modern styles. Each item is
              carefully tailored to perfection.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Button size="lg" variant="outline">
              View All Products
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-muted/50">
        <div className="container grid gap-8 md:grid-cols-2 items-center">
          <div className="relative aspect-square md:aspect-auto md:h-[400px] rounded-lg overflow-hidden">
            <Image
              src="/placeholder.svg?height=400&width=400&text=Our%20Story"
              alt="7th Kulture Workshop"
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Our Story</h2>
            <p className="text-muted-foreground">
              Founded in Makurdi, Benue State, 7th Kulture Africa was born from a passion for preserving and celebrating
              African fashion heritage while embracing modern aesthetics.
            </p>
            <p className="text-muted-foreground">
              Our skilled artisans combine traditional techniques with contemporary designs to create clothing that
              honors our cultural roots while meeting the needs of today's fashion-conscious individuals.
            </p>
            <p className="text-muted-foreground">
              We source high-quality fabrics locally and are committed to ethical production practices that support our
              community and showcase the rich textile traditions of Nigeria.
            </p>
            <Button variant="outline">Learn More About Us</Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Beyond our ready-to-wear collection, we offer a range of tailoring services to meet your specific needs.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-card rounded-lg p-6 text-center shadow-sm">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <Scissors className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Custom Tailoring</h3>
              <p className="text-muted-foreground">
                Bespoke clothing made to your exact measurements and style preferences.
              </p>
            </div>

            <div className="bg-card rounded-lg p-6 text-center shadow-sm">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <Ruler className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Alterations</h3>
              <p className="text-muted-foreground">Professional alterations to ensure your garments fit perfectly.</p>
            </div>

            <div className="bg-card rounded-lg p-6 text-center shadow-sm">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <Package className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Bulk Orders</h3>
              <p className="text-muted-foreground">Special pricing for events, organizations, and group orders.</p>
            </div>

            <div className="bg-card rounded-lg p-6 text-center shadow-sm">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Design Consultation</h3>
              <p className="text-muted-foreground">
                Expert advice on styles, fabrics, and designs that suit your needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Don't just take our word for it. Here's what our satisfied customers have to say about our products and
              services.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Testimonial
              quote="The quality of my kaftan exceeded my expectations. The attention to detail in the embroidery is remarkable."
              author="Emmanuel Okonkwo"
              role="Abuja"
            />
            <Testimonial
              quote="I ordered custom outfits for my wedding, and 7th Kulture delivered perfection. My entire family looked stunning!"
              author="Blessing Adeyemi"
              role="Lagos"
            />
            <Testimonial
              quote="Their customer service is as impressive as their craftsmanship. They listened to my requirements and delivered exactly what I wanted."
              author="Daniel Ibrahim"
              role="Makurdi"
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16">
        <div className="container grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Get In Touch</h2>
            <p className="text-muted-foreground mb-8">
              Have questions about our products or services? Reach out to us and our team will be happy to assist you.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Visit Our Workshop</h3>
                  <address className="not-italic text-muted-foreground">
                    7th Kulture Africa
                    <br />
                    Makurdi, Benue State
                    <br />
                    Nigeria
                  </address>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Email Us</h3>
                  <p className="text-muted-foreground">info@7thkulture.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Call Us</h3>
                  <p className="text-muted-foreground">+234 123 456 7890</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-4">Send Us a Message</h3>
            <form className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Your Name
                  </label>
                  <input id="name" className="w-full px-3 py-2 border rounded-md text-sm" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Your Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Subject
                </label>
                <input
                  id="subject"
                  className="w-full px-3 py-2 border rounded-md text-sm"
                  placeholder="How can we help you?"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="w-full px-3 py-2 border rounded-md text-sm resize-none"
                  placeholder="Your message here..."
                />
              </div>
              <Button type="submit" className="w-full">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
