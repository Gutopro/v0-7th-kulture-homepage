import type { ReactNode } from "react"
import { AdminSidebar } from "@/components/admin/sidebar"
import { getCurrentAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"

export default function AdminLayout({ children }: { children: ReactNode }) {
  const admin = getCurrentAdmin()

  // If not logged in and not on login page, redirect to login
  if (!admin && !children.props.childProp.segment.includes("login")) {
    redirect("/admin/login")
  }

  // If on login page and already logged in, redirect to admin dashboard
  if (admin && children.props.childProp.segment.includes("login")) {
    redirect("/admin")
  }

  // If on login page, don't show the sidebar
  if (children.props.childProp.segment.includes("login")) {
    return children
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
