import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { CartProvider } from "@/context/cart-context"
import { ErrorBoundary } from "@/components/error-boundary"
import { SupabaseProvider } from "@/components/supabase-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

export const metadata: Metadata = {
  title: "7th Kulture Africa | Premium African Clothing",
  description:
    "Handcrafted kaftans and African clothing from Makurdi, Benue. Quality tailoring with authentic African designs.",
  keywords: "African clothing, kaftans, traditional wear, Nigerian fashion, custom tailoring, Makurdi",
  authors: [{ name: "7th Kulture Africa" }],
  creator: "7th Kulture Africa",
  publisher: "7th Kulture Africa",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://7thkulture.com",
    title: "7th Kulture Africa | Premium African Clothing",
    description:
      "Handcrafted kaftans and African clothing from Makurdi, Benue. Quality tailoring with authentic African designs.",
    siteName: "7th Kulture Africa",
  },
  twitter: {
    card: "summary_large_image",
    title: "7th Kulture Africa | Premium African Clothing",
    description:
      "Handcrafted kaftans and African clothing from Makurdi, Benue. Quality tailoring with authentic African designs.",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#8B4513" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <SupabaseProvider>
              <CartProvider>
                {children}
                <Toaster />
              </CartProvider>
            </SupabaseProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
