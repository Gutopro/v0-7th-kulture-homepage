import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase"
import { createHash } from "crypto"

// Types
export type Admin = {
  id: number
  username: string
  name: string
}

// Hash password
export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex")
}

// Initialize admin table and create default admin
export async function initializeAdminTable() {
  try {
    const supabase = createServerSupabaseClient()

    // Check if default admin exists
    const { data: adminExists, error: checkError } = await supabase
      .from("admins")
      .select("id")
      .eq("username", "admin")
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // Error other than "no rows returned"
      console.error("Error checking admin:", checkError)
      return { success: false, error: checkError }
    }

    // Create default admin if it doesn't exist
    if (!adminExists) {
      const defaultPassword = hashPassword("admin123") // Default password: admin123
      const { error: insertError } = await supabase.from("admins").insert({
        username: "admin",
        password: defaultPassword,
        name: "Administrator",
      })

      if (insertError) {
        console.error("Error creating admin:", insertError)
        return { success: false, error: insertError }
      }

      console.log("Default admin created")
    }

    return { success: true }
  } catch (error) {
    console.error("Error initializing admin table:", error)
    return { success: false, error }
  }
}

// Login function
export async function login(username: string, password: string) {
  try {
    const supabase = createServerSupabaseClient()
    const hashedPassword = hashPassword(password)

    const { data: result, error } = await supabase
      .from("admins")
      .select("id, username, name")
      .eq("username", username)
      .eq("password", hashedPassword)
      .single()

    if (error || !result) {
      return { success: false, message: "Invalid username or password" }
    }

    // Set session cookie
    const admin = result as Admin
    const session = {
      id: admin.id,
      username: admin.username,
      name: admin.name,
      expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    }

    cookies().set("admin_session", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    })

    return { success: true, admin }
  } catch (error) {
    console.error("Login error:", error)
    return { success: false, message: "An error occurred during login" }
  }
}

// Logout function
export function logout() {
  cookies().delete("admin_session")
}

// Get current admin
export function getCurrentAdmin(): Admin | null {
  const sessionCookie = cookies().get("admin_session")

  if (!sessionCookie) {
    return null
  }

  try {
    const session = JSON.parse(sessionCookie.value)

    // Check if session is expired
    if (session.expires < Date.now()) {
      cookies().delete("admin_session")
      return null
    }

    return {
      id: session.id,
      username: session.username,
      name: session.name,
    }
  } catch (error) {
    return null
  }
}

// Auth middleware
export function requireAuth() {
  const admin = getCurrentAdmin()

  if (!admin) {
    redirect("/admin/login")
  }

  return admin
}
