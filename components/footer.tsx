import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-muted py-12">
      <div className="container grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="text-lg font-bold mb-4">7th Kulture Africa</h3>
          <p className="text-muted-foreground mb-4">
            Premium African clothing handcrafted in Makurdi, Benue State. Quality tailoring with authentic African
            designs.
          </p>
          <div className="flex gap-4">
            <Link href="https://facebook.com" className="text-muted-foreground hover:text-primary">
              <Facebook className="h-5 w-5" />
              <span className="sr-only">Facebook</span>
            </Link>
            <Link href="https://instagram.com" className="text-muted-foreground hover:text-primary">
              <Instagram className="h-5 w-5" />
              <span className="sr-only">Instagram</span>
            </Link>
            <Link href="https://twitter.com" className="text-muted-foreground hover:text-primary">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Link>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-bold mb-4">Quick Links</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="text-muted-foreground hover:text-primary">
                Home
              </Link>
            </li>
            <li>
              <Link href="#products" className="text-muted-foreground hover:text-primary">
                Products
              </Link>
            </li>
            <li>
              <Link href="#about" className="text-muted-foreground hover:text-primary">
                About Us
              </Link>
            </li>
            <li>
              <Link href="#services" className="text-muted-foreground hover:text-primary">
                Services
              </Link>
            </li>
            <li>
              <Link href="#contact" className="text-muted-foreground hover:text-primary">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-bold mb-4">Services</h3>
          <ul className="space-y-2">
            <li className="text-muted-foreground">Custom Tailoring</li>
            <li className="text-muted-foreground">Bulk Orders</li>
            <li className="text-muted-foreground">Fabric Selection</li>
            <li className="text-muted-foreground">Design Consultation</li>
            <li className="text-muted-foreground">Alterations</li>
          </ul>
        </div>
        <div>
          <h3 className="text-lg font-bold mb-4">Contact Us</h3>
          <address className="not-italic text-muted-foreground space-y-2">
            <p>7th Kulture Africa</p>
            <p>Makurdi, Benue State</p>
            <p>Nigeria</p>
            <p className="mt-2">Phone: +234 123 456 7890</p>
            <p>Email: info@7thkulture.com</p>
          </address>
        </div>
      </div>
      <div className="container mt-8 pt-8 border-t">
        <p className="text-center text-muted-foreground">
          &copy; {new Date().getFullYear()} 7th Kulture Africa. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
