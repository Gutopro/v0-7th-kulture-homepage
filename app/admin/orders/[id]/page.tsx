import { getOrderById } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OrderStatusForm } from "@/components/admin/order-status-form"
import { formatCurrency } from "@/lib/utils"
import Image from "next/image"

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  // Check authentication
  requireAuth()

  const orderId = Number.parseInt(params.id)

  if (isNaN(orderId)) {
    notFound()
  }

  const order = await getOrderById(orderId)

  if (!order) {
    notFound()
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Order #{order.id}</h1>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            order.status === "completed"
              ? "bg-green-100 text-green-800"
              : order.status === "processing"
                ? "bg-blue-100 text-blue-800"
                : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                  <div className="w-16 h-16 relative rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={
                        item.product.image_url ||
                        `/placeholder.svg?height=64&width=64&text=${encodeURIComponent(item.product.name)}`
                      }
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.product.category}</p>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm">
                        ₦{formatCurrency(item.price)} × {item.quantity}
                      </span>
                      <span className="font-medium">₦{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                    {item.custom_requirements && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground">Custom Requirements:</p>
                        <p className="text-sm">{item.custom_requirements}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between">
                  <span className="font-medium">Total</span>
                  <span className="font-bold">₦{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{order.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{order.customer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{order.customer.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">{order.customer.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatusForm orderId={order.id} currentStatus={order.status} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
