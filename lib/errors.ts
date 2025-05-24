import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(message: string, statusCode = 500, isOperational = true) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400)
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized access") {
    super(message, 401)
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden access") {
    super(message, 403)
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super(message, 409)
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Rate limit exceeded") {
    super(message, 429)
  }
}

// Error handler utility for API routes
export function handleError(error: unknown): NextResponse {
  const requestId = crypto.randomUUID()

  logger.error("API Error occurred", {
    requestId,
    error: error instanceof Error ? error.message : "Unknown error",
    stack: error instanceof Error ? error.stack : undefined,
  })

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        requestId,
      },
      { status: error.statusCode },
    )
  }

  if (error instanceof Error) {
    // Check for specific error types
    if (error.message.includes("validation")) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid data provided",
          details: error.message,
          requestId,
        },
        { status: 400 },
      )
    }

    if (error.message.includes("Supabase")) {
      return NextResponse.json(
        {
          success: false,
          message: "Database connection error",
          details: error.message,
          requestId,
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message,
        requestId,
      },
      { status: 500 },
    )
  }

  return NextResponse.json(
    {
      success: false,
      message: "An unknown error occurred",
      requestId,
    },
    { status: 500 },
  )
}
