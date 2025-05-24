import { logger } from "@/lib/logger"

// Check if required environment variables are set
export function checkEnvVariables() {
  const requiredVars = [
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ]

  const missingVars = requiredVars.filter((varName) => !process.env[varName])

  if (missingVars.length > 0) {
    logger.error("Missing required environment variables", { missingVars })
    return {
      success: false,
      missingVars,
    }
  }

  return {
    success: true,
    missingVars: [],
  }
}

// Initialize database
export async function initializeDatabase() {
  try {
    // First check if environment variables are set
    const envCheck = checkEnvVariables()
    if (!envCheck.success) {
      return {
        success: false,
        error: `Missing environment variables: ${envCheck.missingVars.join(", ")}`,
      }
    }

    // Dynamically import to avoid circular dependencies
    const { supabase } = await import("@/lib/db")

    if (!supabase) {
      return {
        success: false,
        error: "Supabase client not initialized. Check your environment variables.",
      }
    }

    // Check if we can connect to Supabase and if tables exist
    const { data, error } = await supabase.from("products").select("count", { count: "exact", head: true }).limit(1)

    if (error) {
      // If we get a relation does not exist error, tables need to be created
      if (error.message.includes('relation "products" does not exist')) {
        logger.warn("Database tables not found. Please run the initialization SQL script in Supabase.")
        return {
          success: false,
          error: "Database tables not found. Please run the initialization SQL script in Supabase.",
          needsInit: true,
        }
      }

      logger.error("Failed to connect to Supabase", { error: error.message })
      return {
        success: false,
        error: error.message,
      }
    }

    logger.info("Supabase connection successful")
    return { success: true }
  } catch (error) {
    logger.error("Failed to initialize database", {
      error: error instanceof Error ? error.message : "Unknown error",
    })
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
