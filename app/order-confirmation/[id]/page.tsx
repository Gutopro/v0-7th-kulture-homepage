import { Suspense } from "react"
import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Package, Truck, Clock } from "lucide-react"
import Link from "next/link"

interface OrderConfirmationPageProps {
  params: {
    id: string
  }
}

// Mock order data - in production this would come from database
const getOrderDetails = async (orderId: string) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 100))

  // Mock order data
  return {
    id: orderId,
    orderNumber: `ORD-${orderId.padStart(6, "0")}`,
    status: "confirmed",
    total: 45000,
    estimatedDelivery: "3-5 business days",
    customer: {
      name: "John Doe",
      email: "john@example.com",
      phone: "+234 123 456 7890",
      address: "123 Main Street, Lagos, Nigeria",
    },
    items: [
      {
        id: 1,
        name: "Traditional Kaftan",
        quantity: 1,
        price: 45000,
        image: "/placeholder.svg?height=80&width=80&text=Kaftan",
      },
    ],
  }
}

function OrderDetails({ orderId }: { orderId: string }) {
  // In a real app, you'd fetch order details here
  const order = {
    id: orderId,
    orderNumber: `ORD-${orderId.padStart(6, "0")}`,
    status: "confirmed",
    total: 45000,
    estimatedDelivery: "3-5 business days",
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-green-600 mb-2">Order Confirmed!</h1>
        <p className="text-muted-foreground">Thank you for your order. We'll contact you shortly to confirm details.</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order Number:</span>
            <span className="font-medium">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status:</span>
            <span className="font-medium capitalize">{order.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Amount:</span>
            <span className="font-medium">₦{order.total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estimated Delivery:</span>
            <span className="font-medium">{order.estimatedDelivery}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Order Confirmation</h3>
                <p className="text-sm text-muted-foreground">
                  We'll call you within 24 hours to confirm your order details and measurements.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium">Production</h3>
                <p className="text-sm text-muted-foreground">
                  Your custom piece will be handcrafted by our skilled artisans.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Truck className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">Delivery</h3>
                <p className="text-sm text-muted-foreground">
                  We'll deliver your order and collect payment on delivery.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center space-y-4">
        <Button asChild className="w-full sm:w-auto">
          <Link href="/products">Continue Shopping</Link>
        </Button>
        <p className="text-sm text-muted-foreground">
          Questions about your order? Contact us at{" "}
          <a href="tel:+2341234567890" className="text-primary hover:underline">
            +234 123 456 7890
          </a>
        </p>
      </div>
    </div>
  )
}

export default function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const orderId = params.id

  if (!orderId) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-12">
        <Suspense
          fallback={
            <div className="max-w-2xl mx-auto text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading order details...</p>
            </div>
          }
        >
          <OrderDetails orderId={orderId} />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
