"use client"

import Link from "next/link"
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react"
import { useApp } from "@/contexts/app-context"

export function Footer() {
  const { state } = useApp()

  const footerLogo = state.siteSettings?.logos?.footerLogo || "/placeholder.svg?height=60&width=160"
  const contactInfo = state.siteSettings?.contactInfo || {
    email: "info@ssbalaramapuram.com",
    phone: "+91 9876543210",
    address: "Balaramapuram, Thiruvananthapuram, Kerala, India - 695501",
  }
  const socialLinks = state.siteSettings?.socialLinks || {}

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <img
              src={footerLogo || "/placeholder.svg"}
              alt="SS Balaramapuram Handlooms"
              className="h-12 max-w-[160px] object-contain"
            />
            <p className="text-gray-300 text-sm">
              Authentic traditional handloom products crafted by skilled artisans. Preserving Kerala's rich textile
              heritage since 1950.
            </p>
            <div className="flex space-x-4">
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-gray-300 hover:text-white">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-300 hover:text-white">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/track" className="text-gray-300 hover:text-white">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/orders" className="text-gray-300 hover:text-white">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-300 hover:text-white">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white">
                  Help & Support
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white">
                  Returns
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white">
                  Shipping Info
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <p className="text-gray-300 text-sm">{contactInfo.address}</p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <a href={`tel:${contactInfo.phone}`} className="text-gray-300 hover:text-white text-sm">
                  {contactInfo.phone}
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                <a href={`mailto:${contactInfo.email}`} className="text-gray-300 hover:text-white text-sm">
                  {contactInfo.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} SS Balaramapuram Handlooms. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
