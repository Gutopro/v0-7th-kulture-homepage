import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { logger } from "@/lib/logger"

export async function GET() {
  try {
    // Check environment variables
    const requiredEnvVars = [
      "SUPABASE_SUPABASE_URL",
      "SUPABASE_SUPABASE_SERVICE_ROLE_KEY",
      "SUPABASE_SUPABASE_NEXT_PUBLIC_SUPABASE_URL",
      "SUPABASE_NEXT_PUBLIC_SUPABASE_ANON_KEY_ANON_KEY",
    ]

    const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

    if (missingEnvVars.length > 0) {
      logger.error("Missing environment variables", { missingEnvVars })
      return NextResponse.json(
        {
          status: "error",
          message: "Missing required environment variables",
          missingEnvVars,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    // Test Supabase connection
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("products").select("count", { count: "exact", head: true })

    if (error) {
      logger.error("Supabase connection failed", { error: error.message })
      return NextResponse.json(
        {
          status: "error",
          message: "Database connection failed",
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    logger.info("Health check passed")
    return NextResponse.json({
      status: "healthy",
      database: "connected",
      supabaseUrl: process.env.SUPABASE_NEXT_PUBLIC_SUPABASE_URL,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    })
  } catch (error) {
    logger.error("Health check failed", { error: error instanceof Error ? error.message : "Unknown error" })
    return NextResponse.json(
      {
        status: "error",
        message: "Health check failed",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
