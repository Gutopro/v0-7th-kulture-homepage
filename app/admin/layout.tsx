"use client"

import { type ReactNode, useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin/sidebar"

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check if we're on the login page
  const isLoginPage = pathname === "/admin/login"

  useEffect(() => {
    // Simulate checking authentication
    // In production, you would check a real auth token
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true"
      setIsAuthenticated(isLoggedIn)
      setIsLoading(false)

      // Redirect if not authenticated and not on login page
      if (!isLoggedIn && !isLoginPage) {
        router.push("/admin/login")
      }
    }

    checkAuth()
  }, [isLoginPage, router])

  // If on login page, don't show the sidebar
  if (isLoginPage) {
    return children
  }

  // Show loading state
  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  // If authenticated, show admin layout
  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    )
  }

  // This should not be reached due to the redirect in useEffect
  return null
}
