import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"
import { ContactSchema } from "@/lib/validation"
import { handleError } from "@/lib/errors"
import { logger } from "@/lib/logger"
import { contactRateLimiter } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID()

  try {
    // Rate limiting
    const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"
    const rateLimitResult = contactRateLimiter.check(ip)

    if (!rateLimitResult.allowed) {
      logger.warn("Contact form rate limit exceeded", { ip }, undefined, requestId)
      return NextResponse.json(
        {
          success: false,
          message: "Too many contact form submissions. Please try again later.",
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        { status: 429 },
      )
    }

    const formData = await request.formData()

    // Extract and validate form data
    const contactData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    }

    const validatedData = ContactSchema.parse(contactData)
    const supabase = createServerSupabaseClient()

    // Store the message in the database
    const { error } = await supabase.from("contact_messages").insert({
      name: validatedData.name,
      email: validatedData.email,
      subject: validatedData.subject,
      message: validatedData.message,
      ip_address: ip,
      user_agent: request.headers.get("user-agent") || "unknown",
    })

    if (error) {
      throw new Error(`Failed to save contact message: ${error.message}`)
    }

    logger.info(
      "Contact form submitted successfully",
      {
        email: validatedData.email,
        subject: validatedData.subject,
      },
      undefined,
      requestId,
    )

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully! We'll get back to you soon.",
    })
  } catch (error) {
    logger.error(
      "Contact form submission failed",
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      undefined,
      requestId,
    )

    const { message, statusCode } = handleError(error)
    return NextResponse.json({ success: false, message }, { status: statusCode })
  }
}
