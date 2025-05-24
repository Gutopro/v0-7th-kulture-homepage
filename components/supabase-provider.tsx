"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { EnvError } from "@/components/env-error"

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<string | null>(null)
  const [missingVars, setMissingVars] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if required environment variables are available on the client
    const requiredVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]
    const missing = requiredVars.filter((varName) => !process.env[varName])

    if (missing.length > 0) {
      setMissingVars(missing)
      setError("Missing required environment variables")
    }

    setLoading(false)
  }, [])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (error) {
    return <EnvError missingVars={missingVars} />
  }

  return children
}
