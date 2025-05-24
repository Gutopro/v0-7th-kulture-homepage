import type React from "react"
import { render, type RenderOptions } from "@testing-library/react"
import { ThemeProvider } from "@/components/theme-provider"
import { CartProvider } from "@/context/cart-context"
import { Toaster } from "@/components/ui/toaster"
import jest from "jest" // Import jest to fix the undeclared variable error

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Next.js image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <CartProvider>
        {children}
        <Toaster />
      </CartProvider>
    </ThemeProvider>
  )
}

const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, "wrapper">) =>
  render(ui, { wrapper: AllTheProviders, ...options })

export * from "@testing-library/react"
export { customRender as render }

// Test data factories
export const createMockProduct = (overrides = {}) => ({
  id: 1,
  name: "Test Product",
  description: "Test product description",
  price: 10000,
  category: "Test Category",
  image_url: "/test-image.jpg",
  in_stock: true,
  created_at: new Date(),
  ...overrides,
})

export const createMockCustomer = (overrides = {}) => ({
  id: 1,
  name: "Test Customer",
  email: "test@example.com",
  phone: "+1234567890",
  address: "Test Address",
  created_at: new Date(),
  ...overrides,
})

export const createMockOrder = (overrides = {}) => ({
  id: 1,
  customer_id: 1,
  total_amount: 10000,
  status: "pending",
  created_at: new Date(),
  ...overrides,
})

// API mocking utilities
export const mockApiResponse = (data: any, status = 200) => {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  })
}

export const mockApiError = (message = "API Error", status = 500) => {
  return Promise.reject(new Error(message))
}
