"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const categories = [
  {
    id: "sarees",
    name: "Traditional Sarees",
    description: "Elegant handwoven sarees with intricate designs",
    image: "/placeholder.svg?height=300&width=400",
    productCount: 45,
    gradient: "from-yellow-100 to-yellow-200",
  },
  {
    id: "fabrics",
    name: "Premium Fabrics",
    description: "High-quality handloom fabrics for all occasions",
    image: "/placeholder.svg?height=300&width=400",
    productCount: 32,
    gradient: "from-green-100 to-green-200",
  },
  {
    id: "home-textiles",
    name: "Home Textiles",
    description: "Beautiful bed sheets, curtains, and home decor",
    image: "/placeholder.svg?height=300&width=400",
    productCount: 28,
    gradient: "from-blue-100 to-blue-200",
  },
  {
    id: "accessories",
    name: "Accessories",
    description: "Handcrafted bags, scarves, and accessories",
    image: "/placeholder.svg?height=300&width=400",
    productCount: 19,
    gradient: "from-purple-100 to-purple-200",
  },
  {
    id: "mens-wear",
    name: "Men's Collection",
    description: "Traditional mundus and men's handloom wear",
    image: "/placeholder.svg?height=300&width=400",
    productCount: 24,
    gradient: "from-gray-100 to-gray-200",
  },
  {
    id: "special-occasions",
    name: "Special Occasions",
    description: "Exclusive pieces for weddings and festivals",
    image: "/placeholder.svg?height=300&width=400",
    productCount: 15,
    gradient: "from-pink-100 to-pink-200",
  },
]

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Product Categories</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our diverse collection of authentic handloom products, each category representing the finest
            traditions of Balaramapuram craftsmanship.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <Card
              key={category.id}
              className="overflow-hidden hover-lift group cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`h-48 bg-gradient-to-br ${category.gradient} relative overflow-hidden`}>
                <img
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300"></div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                  {category.productCount} items
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-yellow-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <Button
                  variant="outline"
                  className="w-full group-hover:bg-yellow-50 group-hover:border-yellow-300 transition-colors"
                  asChild
                >
                  <Link href={`/products?category=${category.id}`}>
                    View Products
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 animate-fade-in-up">
          <div className="bg-gradient-to-r from-yellow-50 to-green-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Can't Find What You're Looking For?</h2>
            <p className="text-gray-600 mb-6">
              We offer custom handloom products tailored to your specific needs. Contact us for personalized designs and
              bulk orders.
            </p>
            <Button className="bg-yellow-500 hover:bg-yellow-600" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
