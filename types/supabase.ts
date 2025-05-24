export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: number
          name: string
          description: string
          price: number
          category: string
          image_url: string
          in_stock: boolean
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          description: string
          price: number
          category: string
          image_url?: string
          in_stock?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string
          price?: number
          category?: string
          image_url?: string
          in_stock?: boolean
          created_at?: string
        }
      }
      customers: {
        Row: {
          id: number
          name: string
          email: string
          phone: string
          address: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          email: string
          phone: string
          address: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          email?: string
          phone?: string
          address?: string
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: number
          customer_id: number
          total_amount: number
          status: string
          created_at: string
        }
        Insert: {
          id?: number
          customer_id: number
          total_amount: number
          status?: string
          created_at?: string
        }
        Update: {
          id?: number
          customer_id?: number
          total_amount?: number
          status?: string
          created_at?: string
        }
      }
      order_items: {
        Row: {
          id: number
          order_id: number
          product_id: number
          quantity: number
          price: number
          custom_requirements: string | null
        }
        Insert: {
          id?: number
          order_id: number
          product_id: number
          quantity: number
          price: number
          custom_requirements?: string | null
        }
        Update: {
          id?: number
          order_id?: number
          product_id?: number
          quantity?: number
          price?: number
          custom_requirements?: string | null
        }
      }
      contact_messages: {
        Row: {
          id: number
          name: string
          email: string
          subject: string
          message: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          email: string
          subject: string
          message: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          email?: string
          subject?: string
          message?: string
          created_at?: string
        }
      }
      admins: {
        Row: {
          id: number
          username: string
          password: string
          name: string
          created_at: string
        }
        Insert: {
          id?: number
          username: string
          password: string
          name: string
          created_at?: string
        }
        Update: {
          id?: number
          username?: string
          password?: string
          name?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Derived types for easier use
export type Product = Database["public"]["Tables"]["products"]["Row"]
export type Customer = Database["public"]["Tables"]["customers"]["Row"]
export type Order = Database["public"]["Tables"]["orders"]["Row"]
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"]
export type ContactMessage = Database["public"]["Tables"]["contact_messages"]["Row"]
export type Admin = Database["public"]["Tables"]["admins"]["Row"]

// Extended types
export type OrderWithDetails = Order & {
  customer: Customer
  items: (OrderItem & { product: Product })[]
}
