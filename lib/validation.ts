import { z } from "zod"

// Customer validation schema
export const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .max(20, "Phone number must be less than 20 characters"),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(500, "Address must be less than 500 characters"),
})

// Order item validation schema
export const orderItemSchema = z.object({
  product_id: z.number().positive("Product ID must be positive"),
  quantity: z.number().min(1, "Quantity must be at least 1").max(100, "Quantity cannot exceed 100"),
  price: z.number().positive("Price must be positive"),
  custom_requirements: z.string().max(500, "Custom requirements must be less than 500 characters").optional(),
})

// Order validation schema
export const orderSchema = z.object({
  customer: customerSchema,
  items: z.array(orderItemSchema).min(1, "Order must contain at least one item"),
  total_amount: z.number().positive("Total amount must be positive"),
})

// Product validation schema
export const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(255, "Product name must be less than 255 characters"),
  description: z
    .string()
    .min(1, "Product description is required")
    .max(1000, "Description must be less than 1000 characters"),
  price: z.number().positive("Price must be positive"),
  category: z.string().min(1, "Category is required").max(100, "Category must be less than 100 characters"),
  image_url: z.string().url("Invalid image URL").optional(),
  in_stock: z.boolean().default(true),
})

// Contact form validation schema
export const ContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters")
    .max(200, "Subject must be less than 200 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must be less than 1000 characters"),
})

// Keep the old export for backward compatibility
export const contactSchema = ContactSchema

// Admin login validation schema
export const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
})
