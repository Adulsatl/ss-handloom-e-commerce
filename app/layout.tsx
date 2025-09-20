import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { ErrorBoundary } from "@/components/error-boundary"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "SS Balaramapuram Handlooms - Authentic Traditional Handloom Products",
    template: "%s | SS Balaramapuram Handlooms",
  },
  description:
    "Discover authentic handloom products from Balaramapuram, Kerala. Traditional craftsmanship meets modern convenience. Shop sarees, fabrics, and handwoven textiles online.",
  keywords: [
    "handloom",
    "Balaramapuram",
    "Kerala",
    "sarees",
    "traditional",
    "handwoven",
    "textiles",
    "Indian clothing",
    "authentic",
    "craftsmanship",
  ],
  authors: [{ name: "SS Balaramapuram Handlooms" }],
  creator: "SS Balaramapuram Handlooms",
  publisher: "SS Balaramapuram Handlooms",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://sshandloom.vercel.app",
    title: "SS Balaramapuram Handlooms - Authentic Traditional Handloom Products",
    description:
      "Discover authentic handloom products from Balaramapuram, Kerala. Traditional craftsmanship meets modern convenience.",
    siteName: "SS Balaramapuram Handlooms",
  },
  twitter: {
    card: "summary_large_image",
    title: "SS Balaramapuram Handlooms",
    description: "Authentic traditional handloom products from Kerala",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#FFC107" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
