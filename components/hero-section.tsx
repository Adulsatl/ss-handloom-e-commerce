"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star, Users, Award } from "lucide-react"
import { useEffect, useState } from "react"
import { useApp } from "@/contexts/app-context"

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const { state } = useApp()

  const banners = state.siteSettings?.banners?.filter((banner) => banner.active) || []
  const hasBanners = banners.length > 0

  useEffect(() => {
    setIsVisible(true)
  }, [])

  useEffect(() => {
    if (hasBanners && banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length)
      }, 5000) // Change banner every 5 seconds

      return () => clearInterval(interval)
    }
  }, [banners.length, hasBanners])

  const currentBanner = hasBanners ? banners[currentBannerIndex] : null

  return (
    <section className="relative bg-gradient-to-br from-yellow-50 via-white to-green-50 py-20 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 handloom-pattern opacity-5"></div>
      <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400 rounded-full opacity-10 animate-float"></div>
      <div
        className="absolute bottom-20 right-10 w-24 h-24 bg-green-400 rounded-full opacity-10 animate-float"
        style={{ animationDelay: "1s" }}
      ></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className={`space-y-8 ${isVisible ? "animate-fade-in-left" : "opacity-0"}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium animate-scale-in">
              <Award className="w-4 h-4" />
              Authentic Handloom Since 1950
            </div>

            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
              {currentBanner?.title || "Authentic"}
              <span className="text-yellow-600 animate-weave inline-block"> Handloom</span>
              <br />
              {currentBanner?.subtitle || "Treasures from"}
              <span className="text-green-700"> Balaramapuram</span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed">
              Discover the timeless beauty of traditional handloom products crafted by skilled artisans. Each piece
              tells a story of heritage, culture, and exceptional craftsmanship.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 py-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-yellow-600" />
                <span className="text-sm text-gray-600">500+ Happy Customers</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-600" />
                <span className="text-sm text-gray-600">4.9/5 Rating</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 hover-lift group"
                asChild
              >
                <Link href={currentBanner?.link || "/products"}>
                  Shop Now
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-3 hover-lift"
                asChild
              >
                <Link href="/about">Our Story</Link>
              </Button>
            </div>
          </div>

          <div className={`relative ${isVisible ? "animate-fade-in-right" : "opacity-0"}`}>
            <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-yellow-100 to-green-100 p-8 hover-glow transition-all duration-500">
              <img
                src={currentBanner?.imageUrl || "/placeholder.svg?height=500&width=500"}
                alt={currentBanner?.title || "Traditional Handloom Products"}
                className="w-full h-full object-cover rounded-xl hover:scale-105 transition-transform duration-500"
              />
            </div>
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full opacity-20 animate-pulse-glow"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-green-400 rounded-full opacity-20 animate-float"></div>

            {/* Banner indicators */}
            {hasBanners && banners.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentBannerIndex ? "bg-yellow-500" : "bg-white/50"
                    }`}
                    onClick={() => setCurrentBannerIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
