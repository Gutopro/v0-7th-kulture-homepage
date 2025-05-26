import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { sql } from "@/lib/db"
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
    // Create admin table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `

    // Check if default admin exists
    const adminExists = await sql`SELECT id FROM admins WHERE username = 'admin'`

    // Create default admin if it doesn't exist
    if (adminExists.length === 0) {
      const defaultPassword = hashPassword("admin123") // Default password: admin123
      await sql`
        INSERT INTO admins (username, password, name)
        VALUES ('admin', ${defaultPassword}, 'Administrator')
      `
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
    const hashedPassword = hashPassword(password)
    const result = await sql`
      SELECT id, username, name
      FROM admins
      WHERE username = ${username} AND password = ${hashedPassword}
    `

    if (result.length === 0) {
      return { success: false, message: "Invalid username or password" }
    }

    // Set session cookie
    const admin = result[0] as Admin
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
