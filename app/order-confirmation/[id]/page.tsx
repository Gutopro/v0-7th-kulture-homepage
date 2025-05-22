import Link from "next/link"
import { getOrderById } from "@/lib/db"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CheckCircle } from "lucide-react"

export default async function OrderConfirmationPage({
  params,
}: {
  params: { id: string }
}) {
  const orderId = Number.parseInt(params.id)

  if (isNaN(orderId)) {
    notFound()
  }

  const order = await getOrderById(orderId)

  if (!order) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold">Order Confirmed!</h1>
            <p className="text-muted-foreground mt-2">
              Thank you for your order. We've received your request and will contact you shortly.
            </p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order #{order.id}</CardTitle>
              <CardDescription>
                Placed on {new Date(order.created_at).toLocaleDateString()} • Status:{" "}
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between pb-4 border-b last:border-0">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ₦{formatCurrency(item.price)} × {item.quantity}
                      </p>
                      {item.custom_requirements && (
                        <p className="text-xs text-muted-foreground mt-1">Custom: {item.custom_requirements}</p>
                      )}
                    </div>
                    <p className="font-medium">₦{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}

                <div className="pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₦{formatCurrency(order.total_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2">
                    <span>Total</span>
                    <span>₦{formatCurrency(order.total_amount)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Contact Information</h3>
                  <p className="text-sm">{order.customer.name}</p>
                  <p className="text-sm">{order.customer.email}</p>
                  <p className="text-sm">{order.customer.phone}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Shipping Address</h3>
                  <p className="text-sm whitespace-pre-line">{order.customer.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
              <CardDescription>Here's what you can expect after placing your order.</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium">Order Confirmation</h3>
                    <p className="text-sm text-muted-foreground">
                      We'll send you an email confirmation with your order details.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium">Order Processing</h3>
                    <p className="text-sm text-muted-foreground">
                      Our team will review your order and contact you to confirm details.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Production</h3>
                    <p className="text-sm text-muted-foreground">
                      Your items will be carefully crafted according to your specifications.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    4
                  </div>
                  <div>
                    <h3 className="font-medium">Delivery</h3>
                    <p className="text-sm text-muted-foreground">
                      Once ready, your order will be delivered to the address you provided.
                    </p>
                  </div>
                </li>
              </ol>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/">Return to Homepage</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
