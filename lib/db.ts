import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { initializeAdminTable } from "@/lib/auth"

// Initialize the SQL client
export const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql)

// Product types
export type Product = {
  id: number
  name: string
  description: string
  price: number
  category: string
  image_url: string
  in_stock: boolean
  created_at: Date
}

export type Customer = {
  id: number
  name: string
  email: string
  phone: string
  address: string
  created_at?: Date
}

export type Order = {
  id: number
  customer_id: number
  total_amount: number
  status: string
  created_at: Date
  customer?: Customer
  items?: OrderItem[]
}

export type OrderItem = {
  id: number
  order_id: number
  product_id: number
  quantity: number
  price: number
  custom_requirements: string
  product?: Product
}

export type OrderWithDetails = Order & {
  customer: Customer
  items: (OrderItem & { product: Product })[]
}

// Product functions
export async function getProducts(): Promise<Product[]> {
  const products = await sql<Product[]>`
    SELECT * FROM products ORDER BY created_at DESC
  `
  return products
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await sql<Product[]>`
    SELECT * FROM products WHERE in_stock = true ORDER BY created_at DESC LIMIT 6
  `
  return products
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const products = await sql<Product[]>`
    SELECT * FROM products WHERE category = ${category} AND in_stock = true ORDER BY created_at DESC
  `
  return products
}

export async function getProductById(id: number): Promise<Product | null> {
  const products = await sql<Product[]>`
    SELECT * FROM products WHERE id = ${id}
  `
  return products.length > 0 ? products[0] : null
}

export async function createProduct(product: Omit<Product, "id" | "created_at">): Promise<number> {
  const result = await sql`
    INSERT INTO products (name, description, price, category, image_url, in_stock)
    VALUES (
      ${product.name}, 
      ${product.description}, 
      ${product.price}, 
      ${product.category}, 
      ${product.image_url}, 
      ${product.in_stock}
    )
    RETURNING id
  `
  return result[0].id
}

export async function updateProduct(
  id: number,
  product: Partial<Omit<Product, "id" | "created_at">>,
): Promise<boolean> {
  // Build the SET clause dynamically based on provided fields
  const setClauses = []
  const values: any[] = []

  if (product.name !== undefined) {
    setClauses.push(`name = $${values.length + 1}`)
    values.push(product.name)
  }

  if (product.description !== undefined) {
    setClauses.push(`description = $${values.length + 1}`)
    values.push(product.description)
  }

  if (product.price !== undefined) {
    setClauses.push(`price = $${values.length + 1}`)
    values.push(product.price)
  }

  if (product.category !== undefined) {
    setClauses.push(`category = $${values.length + 1}`)
    values.push(product.category)
  }

  if (product.image_url !== undefined) {
    setClauses.push(`image_url = $${values.length + 1}`)
    values.push(product.image_url)
  }

  if (product.in_stock !== undefined) {
    setClauses.push(`in_stock = $${values.length + 1}`)
    values.push(product.in_stock)
  }

  if (setClauses.length === 0) {
    return false
  }

  // Add the ID as the last parameter
  values.push(id)

  const query = `
    UPDATE products 
    SET ${setClauses.join(", ")} 
    WHERE id = $${values.length}
  `

  const result = await sql.query(query, values)
  return result.rowCount > 0
}

export async function deleteProduct(id: number): Promise<boolean> {
  try {
    // First check if the product is referenced in any order_items
    const orderItems = await sql`
      SELECT id FROM order_items WHERE product_id = ${id}
    `

    if (orderItems.length > 0) {
      // Product is referenced, so just mark it as out of stock instead of deleting
      await sql`
        UPDATE products SET in_stock = false WHERE id = ${id}
      `
      return true
    }

    // If not referenced, we can safely delete
    const result = await sql`
      DELETE FROM products WHERE id = ${id}
    `
    return result.count > 0
  } catch (error) {
    console.error("Error deleting product:", error)
    return false
  }
}

// Order functions
export async function createCustomer(customer: Omit<Customer, "id" | "created_at">): Promise<number> {
  const result = await sql`
    INSERT INTO customers (name, email, phone, address)
    VALUES (${customer.name}, ${customer.email}, ${customer.phone}, ${customer.address})
    RETURNING id
  `
  return result[0].id
}

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
  // Start a transaction
  const result = await sql.transaction(async (tx) => {
    // Create the order
    const orderResult = await tx`
      INSERT INTO orders (customer_id, total_amount)
      VALUES (${order.customer_id}, ${order.total_amount})
      RETURNING id
    `

    const orderId = orderResult[0].id

    // Create order items
    for (const item of order.items) {
      await tx`
        INSERT INTO order_items (order_id, product_id, quantity, price, custom_requirements)
        VALUES (
          ${orderId}, 
          ${item.product_id}, 
          ${item.quantity}, 
          ${item.price}, 
          ${item.custom_requirements || ""}
        )
      `
    }

    return orderId
  })

  return result
}

export async function getOrders(): Promise<Order[]> {
  const orders = await sql<Order[]>`
    SELECT o.*, c.name as customer_name 
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    ORDER BY o.created_at DESC
  `
  return orders
}

export async function getOrderById(id: number): Promise<OrderWithDetails | null> {
  // Get the order
  const orders = await sql<Order[]>`
    SELECT * FROM orders WHERE id = ${id}
  `

  if (orders.length === 0) {
    return null
  }

  const order = orders[0]

  // Get the customer
  const customers = await sql<Customer[]>`
    SELECT * FROM customers WHERE id = ${order.customer_id}
  `

  if (customers.length === 0) {
    return null
  }

  // Get the order items with product details
  const items = await sql`
    SELECT oi.*, p.name, p.description, p.category, p.image_url
    FROM order_items oi
    JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ${id}
  `

  // Format the items to include product details
  const formattedItems = items.map((item) => ({
    id: item.id,
    order_id: item.order_id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
    custom_requirements: item.custom_requirements,
    product: {
      id: item.product_id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image_url: item.image_url,
      in_stock: true, // Assuming it was in stock when ordered
      created_at: new Date(),
    },
  }))

  return {
    ...order,
    customer: customers[0],
    items: formattedItems,
  }
}

export async function updateOrderStatus(id: number, status: string): Promise<boolean> {
  const result = await sql`
    UPDATE orders SET status = ${status} WHERE id = ${id}
  `
  return result.count > 0
}

export async function getCustomers(): Promise<Customer[]> {
  const customers = await sql<Customer[]>`
    SELECT * FROM customers ORDER BY created_at DESC
  `
  return customers
}

export async function getCustomerById(id: number): Promise<Customer | null> {
  const customers = await sql<Customer[]>`
    SELECT * FROM customers WHERE id = ${id}
  `
  return customers.length > 0 ? customers[0] : null
}

export async function getCustomerOrders(customerId: number): Promise<Order[]> {
  const orders = await sql<Order[]>`
    SELECT * FROM orders WHERE customer_id = ${customerId} ORDER BY created_at DESC
  `
  return orders
}

export async function getDashboardStats() {
  // Get total products
  const productsResult = await sql`SELECT COUNT(*) as count FROM products`
  const totalProducts = Number.parseInt(productsResult[0].count)

  // Get total orders
  const ordersResult = await sql`SELECT COUNT(*) as count FROM orders`
  const totalOrders = Number.parseInt(ordersResult[0].count)

  // Get total customers
  const customersResult = await sql`SELECT COUNT(*) as count FROM customers`
  const totalCustomers = Number.parseInt(customersResult[0].count)

  // Get total revenue
  const revenueResult = await sql`SELECT SUM(total_amount) as total FROM orders`
  const totalRevenue = Number.parseFloat(revenueResult[0].total || 0)

  // Get recent orders
  const recentOrders = await sql`
    SELECT o.*, c.name as customer_name 
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    ORDER BY o.created_at DESC
    LIMIT 5
  `

  // Get popular products
  const popularProducts = await sql`
    SELECT p.*, COUNT(oi.id) as order_count
    FROM products p
    JOIN order_items oi ON p.id = oi.product_id
    GROUP BY p.id
    ORDER BY order_count DESC
    LIMIT 5
  `

  return {
    totalProducts,
    totalOrders,
    totalCustomers,
    totalRevenue,
    recentOrders,
    popularProducts,
  }
}

// Initialize database
export async function initializeDatabase() {
  try {
    // Create products table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category VARCHAR(100) NOT NULL,
        image_url TEXT,
        in_stock BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `

    // Create customers table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `

    // Create orders table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id),
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `

    // Create order_items table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id),
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        custom_requirements TEXT
      );
    `

    // Initialize admin table
    await initializeAdminTable()

    return { success: true }
  } catch (error) {
    console.error("Error initializing database:", error)
    return { success: false, error }
  }
}
