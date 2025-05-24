// Use direct implementation instead of re-exporting
import { createClient } from "@supabase/supabase-js"
import { logger } from "@/lib/logger"
import type { Database } from "@/types/supabase"

// Type aliases for easier use
export type Product = Database["public"]["Tables"]["products"]["Row"]
export type Customer = Database["public"]["Tables"]["customers"]["Row"]
export type Order = Database["public"]["Tables"]["orders"]["Row"]
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"]

export type OrderWithDetails = Order & {
  customer: Customer
  items: (OrderItem & { product: Product })[]
}

// Check if environment variables are available
const isSupabaseConfigured = () => {
  return typeof process.env.SUPABASE_URL !== "undefined" && typeof process.env.SUPABASE_ANON_KEY !== "undefined"
}

// Create a single supabase client for the entire server-side application
export const createServerSupabaseClient = () => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    logger.error("Missing Supabase environment variables for server client")
    throw new Error("Supabase environment variables are required")
  }

  return createClient<Database>(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
}

// Create a singleton client for the browser to avoid multiple instances
let clientSideSupabaseClient: ReturnType<typeof createClient> | null = null

export const createClientSupabaseClient = () => {
  // In the browser, we need to check if we're in the browser and if the variables are available
  if (typeof window !== "undefined") {
    // For client-side, we need to use NEXT_PUBLIC_ prefixed variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing Supabase environment variables for client")
      // Return a dummy client that will gracefully fail
      return {
        from: () => ({
          select: () => ({ data: null, error: new Error("Supabase not configured") }),
        }),
        auth: {
          signIn: () => Promise.reject(new Error("Supabase not configured")),
          signOut: () => Promise.reject(new Error("Supabase not configured")),
        },
      } as any
    }

    if (clientSideSupabaseClient) {
      return clientSideSupabaseClient
    }

    try {
      clientSideSupabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey)
      return clientSideSupabaseClient
    } catch (error) {
      console.error("Failed to create Supabase client:", error)
      // Return a dummy client that will gracefully fail
      return {
        from: () => ({
          select: () => ({ data: null, error: new Error("Failed to initialize Supabase") }),
        }),
        auth: {
          signIn: () => Promise.reject(new Error("Failed to initialize Supabase")),
          signOut: () => Promise.reject(new Error("Failed to initialize Supabase")),
        },
      } as any
    }
  }

  // If we're in a server context but this function is called, return a dummy client
  return {
    from: () => ({
      select: () => ({ data: null, error: new Error("Client Supabase used in server context") }),
    }),
    auth: {
      signIn: () => Promise.reject(new Error("Client Supabase used in server context")),
      signOut: () => Promise.reject(new Error("Client Supabase used in server context")),
    },
  } as any
}

// Convenience exports - but only if properly configured
export const supabase = isSupabaseConfigured() ? createServerSupabaseClient() : null

// Cache implementation (in production, use Redis)
class SimpleCache {
  private cache = new Map<string, { data: any; expires: number }>()

  set(key: string, data: any, ttlMs = 300000) {
    // 5 minutes default
    this.cache.set(key, {
      data,
      expires: Date.now() + ttlMs,
    })
  }

  get(key: string): any | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expires) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  delete(key: string) {
    this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }
}

const cache = new SimpleCache()

// Safe Supabase client getter with error handling
const getSupabase = () => {
  if (!supabase) {
    throw new Error("Supabase client not initialized. Check your environment variables.")
  }
  return supabase
}

// Product functions with caching and error handling
export async function getProducts(): Promise<Product[]> {
  try {
    const cacheKey = "products:all"
    const cached = cache.get(cacheKey)
    if (cached) {
      logger.debug("Products retrieved from cache")
      return cached
    }

    const client = getSupabase()
    const { data: products, error } = await client
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Failed to retrieve products: ${error.message}`)
    }

    cache.set(cacheKey, products, 300000) // Cache for 5 minutes
    logger.info(`Retrieved ${products.length} products from database`)

    return products
  } catch (error) {
    logger.error("Failed to retrieve products", { error: error instanceof Error ? error.message : "Unknown error" })
    return [] // Return empty array instead of throwing to prevent app crashes
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const cacheKey = "products:featured"
    const cached = cache.get(cacheKey)
    if (cached) {
      logger.debug("Featured products retrieved from cache")
      return cached
    }

    const client = getSupabase()
    const { data: products, error } = await client
      .from("products")
      .select("*")
      .eq("in_stock", true)
      .order("created_at", { ascending: false })
      .limit(6)

    if (error) {
      throw new Error(`Failed to retrieve featured products: ${error.message}`)
    }

    cache.set(cacheKey, products, 600000) // Cache for 10 minutes
    logger.info(`Retrieved ${products.length} featured products`)

    return products
  } catch (error) {
    logger.error("Failed to retrieve featured products", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return [] // Return empty array instead of throwing
  }
}

export async function getProductById(id: number): Promise<Product | null> {
  try {
    const cacheKey = `product:${id}`
    const cached = cache.get(cacheKey)
    if (cached) {
      logger.debug(`Product ${id} retrieved from cache`)
      return cached
    }

    const client = getSupabase()
    const { data: product, error } = await client.from("products").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        // No rows returned
        logger.warn(`Product not found: ${id}`)
        return null
      }
      throw new Error(`Failed to retrieve product: ${error.message}`)
    }

    if (product) {
      cache.set(cacheKey, product, 600000) // Cache for 10 minutes
      logger.info(`Retrieved product: ${product.name}`)
    }

    return product
  } catch (error) {
    logger.error(`Failed to retrieve product: ${id}`, {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return null // Return null instead of throwing
  }
}

export async function createProduct(product: {
  name: string
  description: string
  price: number
  category: string
  image_url?: string
  in_stock?: boolean
}): Promise<number> {
  try {
    const client = getSupabase()
    const { data, error } = await client.from("products").insert(product).select("id").single()

    if (error) {
      throw new Error(`Failed to create product: ${error.message}`)
    }

    // Clear relevant caches
    cache.delete("products:all")
    cache.delete("products:featured")
    if (product.category) {
      cache.delete(`products:category:${product.category}`)
    }

    logger.info(`Created product: ${product.name}`, { productId: data.id })

    return data.id
  } catch (error) {
    logger.error("Failed to create product", {
      product: product.name,
      error: error instanceof Error ? error.message : "Unknown error",
    })
    throw new Error("Failed to create product")
  }
}

export async function updateProduct(
  id: number,
  product: {
    name?: string
    description?: string
    price?: number
    category?: string
    image_url?: string
    in_stock?: boolean
  },
): Promise<boolean> {
  try {
    const client = getSupabase()
    const { error } = await client.from("products").update(product).eq("id", id)

    if (error) {
      throw new Error(`Failed to update product: ${error.message}`)
    }

    // Clear relevant caches
    cache.delete("products:all")
    cache.delete("products:featured")
    cache.delete(`product:${id}`)
    if (product.category) {
      cache.delete(`products:category:${product.category}`)
    }

    logger.info(`Updated product: ${id}`)
    return true
  } catch (error) {
    logger.error(`Failed to update product: ${id}`, { error: error instanceof Error ? error.message : "Unknown error" })
    throw new Error("Failed to update product")
  }
}

export async function deleteProduct(id: number): Promise<boolean> {
  try {
    const client = getSupabase()

    // First check if the product is referenced in any order_items
    const { data: orderItems, error: checkError } = await client
      .from("order_items")
      .select("id")
      .eq("product_id", id)
      .limit(1)

    if (checkError) {
      throw new Error(`Failed to check product references: ${checkError.message}`)
    }

    if (orderItems && orderItems.length > 0) {
      // Product is referenced, so just mark it as out of stock instead of deleting
      const { error: updateError } = await client.from("products").update({ in_stock: false }).eq("id", id)

      if (updateError) {
        throw new Error(`Failed to mark product as out of stock: ${updateError.message}`)
      }

      logger.info(`Marked product as out of stock (has orders): ${id}`)
    } else {
      // If not referenced, we can safely delete
      const { error: deleteError } = await client.from("products").delete().eq("id", id)

      if (deleteError) {
        throw new Error(`Failed to delete product: ${deleteError.message}`)
      }

      logger.info(`Deleted product: ${id}`)
    }

    // Clear caches
    cache.delete("products:all")
    cache.delete("products:featured")
    cache.delete(`product:${id}`)

    return true
  } catch (error) {
    logger.error(`Failed to delete product: ${id}`, { error: error instanceof Error ? error.message : "Unknown error" })
    throw new Error("Failed to delete product")
  }
}

// Customer functions
export async function createCustomer(customer: {
  name: string
  email: string
  phone: string
  address: string
}): Promise<number> {
  try {
    const client = getSupabase()

    logger.info("Creating customer", { email: customer.email })

    // Check if customer already exists by email
    const { data: existingCustomer, error: checkError } = await client
      .from("customers")
      .select("id")
      .eq("email", customer.email)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // Error other than "no rows returned"
      logger.error("Error checking existing customer", { error: checkError.message })
      throw new Error(`Failed to check existing customer: ${checkError.message}`)
    }

    if (existingCustomer) {
      logger.info("Customer already exists, returning existing ID", { customerId: existingCustomer.id })
      return existingCustomer.id
    }

    // Create new customer
    const { data, error } = await client
      .from("customers")
      .insert({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
      })
      .select("id")
      .single()

    if (error) {
      logger.error("Failed to create customer", { error: error.message, customer })
      throw new Error(`Failed to create customer: ${error.message}`)
    }

    if (!data || !data.id) {
      throw new Error("Customer creation returned no data")
    }

    logger.info(`Created customer: ${customer.email}`, { customerId: data.id })
    return data.id
  } catch (error) {
    logger.error("Failed to create customer", {
      email: customer.email,
      error: error instanceof Error ? error.message : "Unknown error",
    })
    throw error // Re-throw the original error
  }
}

export async function getCustomers(): Promise<Customer[]> {
  try {
    const client = getSupabase()
    const { data: customers, error } = await client
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Failed to retrieve customers: ${error.message}`)
    }

    logger.info(`Retrieved ${customers.length} customers`)

    return customers
  } catch (error) {
    logger.error("Failed to retrieve customers", { error: error instanceof Error ? error.message : "Unknown error" })
    return [] // Return empty array instead of throwing
  }
}

export async function getCustomerById(id: number): Promise<Customer | null> {
  try {
    const client = getSupabase()
    const { data: customer, error } = await client.from("customers").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        logger.warn(`Customer not found: ${id}`)
        return null
      }
      throw new Error(`Failed to retrieve customer: ${error.message}`)
    }

    if (customer) {
      logger.info(`Retrieved customer: ${customer.email}`)
    }

    return customer
  } catch (error) {
    logger.error(`Failed to retrieve customer: ${id}`, {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return null // Return null instead of throwing
  }
}

// Order functions
export async function createOrder(order: {
  customer_id: number
  total_amount: number
  items: Array<{
    product_id: number
    quantity: number
    price: number
    custom_requirements?: string
  }>
}): Promise<number> {
  try {
    const client = getSupabase()

    logger.info("Creating order", {
      customerId: order.customer_id,
      totalAmount: order.total_amount,
      itemCount: order.items.length,
    })

    // Start a transaction by creating the order first
    const { data: orderData, error: orderError } = await client
      .from("orders")
      .insert({
        customer_id: order.customer_id,
        total_amount: order.total_amount,
        status: "pending",
      })
      .select("id")
      .single()

    if (orderError) {
      logger.error("Failed to create order", { error: orderError.message })
      throw new Error(`Failed to create order: ${orderError.message}`)
    }

    if (!orderData || !orderData.id) {
      throw new Error("Order creation returned no data")
    }

    const orderId = orderData.id

    // Create order items
    const orderItems = order.items.map((item) => ({
      order_id: orderId,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
      custom_requirements: item.custom_requirements || null,
    }))

    const { error: itemsError } = await client.from("order_items").insert(orderItems)

    if (itemsError) {
      // If order items creation fails, we should clean up the order
      logger.error("Failed to create order items, cleaning up order", { orderId, error: itemsError.message })
      await client.from("orders").delete().eq("id", orderId)
      throw new Error(`Failed to create order items: ${itemsError.message}`)
    }

    logger.info(`Created order: ${orderId}`, {
      customerId: order.customer_id,
      totalAmount: order.total_amount,
      itemCount: order.items.length,
    })

    return orderId
  } catch (error) {
    logger.error("Failed to create order", {
      customerId: order.customer_id,
      error: error instanceof Error ? error.message : "Unknown error",
    })
    throw error // Re-throw the original error
  }
}

export async function getOrders(): Promise<(Order & { customer_name: string })[]> {
  try {
    const client = getSupabase()
    const { data: orders, error } = await client
      .from("orders")
      .select(`
        *,
        customers!inner(name)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Failed to retrieve orders: ${error.message}`)
    }

    // Transform the data to match the expected format
    const transformedOrders = orders.map((order) => ({
      ...order,
      customer_name: order.customers.name,
    }))

    logger.info(`Retrieved ${transformedOrders.length} orders`)

    return transformedOrders
  } catch (error) {
    logger.error("Failed to retrieve orders", { error: error instanceof Error ? error.message : "Unknown error" })
    return [] // Return empty array instead of throwing
  }
}

export async function getOrderById(id: number): Promise<OrderWithDetails | null> {
  try {
    const client = getSupabase()

    // Get the order with customer details
    const { data: order, error: orderError } = await client
      .from("orders")
      .select(`
        *,
        customers!inner(*)
      `)
      .eq("id", id)
      .single()

    if (orderError) {
      if (orderError.code === "PGRST116") {
        logger.warn(`Order not found: ${id}`)
        return null
      }
      throw new Error(`Failed to retrieve order: ${orderError.message}`)
    }

    // Get the order items with product details
    const { data: items, error: itemsError } = await client
      .from("order_items")
      .select(`
        *,
        products!inner(*)
      `)
      .eq("order_id", id)

    if (itemsError) {
      throw new Error(`Failed to retrieve order items: ${itemsError.message}`)
    }

    // Transform the data to match the expected format
    const transformedItems = items.map((item) => ({
      ...item,
      product: item.products,
    }))

    const orderWithDetails: OrderWithDetails = {
      ...order,
      customer: order.customers,
      items: transformedItems,
    }

    logger.info(`Retrieved order details: ${id}`)

    return orderWithDetails
  } catch (error) {
    logger.error(`Failed to retrieve order: ${id}`, { error: error instanceof Error ? error.message : "Unknown error" })
    return null // Return null instead of throwing
  }
}

export async function updateOrderStatus(id: number, status: string): Promise<boolean> {
  try {
    const client = getSupabase()
    const { error } = await client.from("orders").update({ status }).eq("id", id)

    if (error) {
      throw new Error(`Failed to update order status: ${error.message}`)
    }

    logger.info(`Updated order status: ${id}`, { status })
    return true
  } catch (error) {
    logger.error(`Failed to update order status: ${id}`, {
      status,
      error: error instanceof Error ? error.message : "Unknown error",
    })
    throw new Error("Failed to update order status")
  }
}

export async function getCustomerOrders(customerId: number): Promise<Order[]> {
  try {
    const client = getSupabase()
    const { data: orders, error } = await client
      .from("orders")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Failed to retrieve customer orders: ${error.message}`)
    }

    logger.info(`Retrieved ${orders.length} orders for customer: ${customerId}`)

    return orders
  } catch (error) {
    logger.error(`Failed to retrieve customer orders: ${customerId}`, {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return [] // Return empty array instead of throwing
  }
}

export async function getDashboardStats() {
  try {
    const cacheKey = "dashboard:stats"
    const cached = cache.get(cacheKey)
    if (cached) {
      logger.debug("Dashboard stats retrieved from cache")
      return cached
    }

    const client = getSupabase()

    // Get total products
    const { count: totalProducts, error: productsError } = await client
      .from("products")
      .select("*", { count: "exact", head: true })

    if (productsError) {
      throw new Error(`Failed to count products: ${productsError.message}`)
    }

    // Get total orders
    const { count: totalOrders, error: ordersError } = await client
      .from("orders")
      .select("*", { count: "exact", head: true })

    if (ordersError) {
      throw new Error(`Failed to count orders: ${ordersError.message}`)
    }

    // Get total customers
    const { count: totalCustomers, error: customersError } = await client
      .from("customers")
      .select("*", { count: "exact", head: true })

    if (customersError) {
      throw new Error(`Failed to count customers: ${customersError.message}`)
    }

    // Get total revenue
    const { data: revenueData, error: revenueError } = await client.from("orders").select("total_amount")

    if (revenueError) {
      throw new Error(`Failed to calculate revenue: ${revenueError.message}`)
    }

    const totalRevenue = revenueData.reduce((sum, order) => sum + order.total_amount, 0)

    // Get recent orders
    const { data: recentOrders, error: recentOrdersError } = await client
      .from("orders")
      .select(`
        *,
        customers!inner(name)
      `)
      .order("created_at", { ascending: false })
      .limit(5)

    if (recentOrdersError) {
      throw new Error(`Failed to retrieve recent orders: ${recentOrdersError.message}`)
    }

    // Transform recent orders
    const transformedRecentOrders = recentOrders.map((order) => ({
      ...order,
      customer_name: order.customers.name,
    }))

    // Get popular products
    const { data: popularProducts, error: popularProductsError } = await client
      .from("order_items")
      .select(`
        product_id,
        products!inner(*),
        count:product_id
      `)
      .limit(5)

    if (popularProductsError) {
      throw new Error(`Failed to retrieve popular products: ${popularProductsError.message}`)
    }

    const stats = {
      totalProducts: totalProducts || 0,
      totalOrders: totalOrders || 0,
      totalCustomers: totalCustomers || 0,
      totalRevenue,
      recentOrders: transformedRecentOrders,
      popularProducts: popularProducts || [],
    }

    cache.set(cacheKey, stats, 300000) // Cache for 5 minutes
    logger.info("Retrieved dashboard stats")

    return stats
  } catch (error) {
    logger.error("Failed to retrieve dashboard stats", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return {
      totalProducts: 0,
      totalOrders: 0,
      totalCustomers: 0,
      totalRevenue: 0,
      recentOrders: [],
      popularProducts: [],
    } // Return empty stats instead of throwing
  }
}

// Initialize database (Supabase tables should be created via migrations)
export async function initializeDatabase() {
  try {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      logger.error("Supabase not configured. Check your environment variables.")
      return {
        success: false,
        error: "Supabase not configured. Check your environment variables.",
      }
    }

    // For Supabase, we'll just check if we can connect
    const client = getSupabase()
    const { data, error } = await client.from("products").select("count", { count: "exact", head: true })

    if (error) {
      // If we get a relation does not exist error, tables need to be created
      if (error.message.includes('relation "products" does not exist')) {
        logger.warn("Database tables not found. Please run the initialization SQL script in Supabase.")
        return {
          success: false,
          error: "Database tables not found. Please run the initialization SQL script in Supabase.",
        }
      }

      logger.error("Failed to connect to Supabase", { error: error.message })
      return { success: false, error: error.message }
    }

    logger.info("Supabase connection successful")
    return { success: true }
  } catch (error) {
    logger.error("Failed to initialize database", { error: error instanceof Error ? error.message : "Unknown error" })
    return { success: false, error }
  }
}
