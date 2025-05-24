import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"
import { logger } from "@/lib/logger"

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
export const supabaseClient = typeof window !== "undefined" ? createClientSupabaseClient() : null
