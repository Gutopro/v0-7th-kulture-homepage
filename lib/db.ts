import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

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
}

export type Order = {
  id: number
  customer_id: number
  total_amount: number
  status: string
  created_at: Date
}

export type OrderItem = {
  id: number
  order_id: number
  product_id: number
  quantity: number
  price: number
  custom_requirements: string
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

// Order functions
export async function createCustomer(customer: Omit<Customer, "id">): Promise<number> {
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

// Add this function at the end of the file, after the other functions

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

    return { success: true }
  } catch (error) {
    console.error("Error initializing database:", error)
    return { success: false, error }
  }
}
