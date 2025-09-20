"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, Users, Heart, Leaf, Star, Clock } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-yellow-50 to-green-50 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
              <Badge className="mb-4 bg-yellow-100 text-yellow-800">Since 1950</Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                Our Story of
                <span className="text-yellow-600"> Tradition</span> &
                <span className="text-green-700"> Craftsmanship</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                For over seven decades, SS Balaramapuram has been preserving the rich heritage of handloom weaving,
                bringing authentic traditional textiles to families across the world.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
              <p className="text-lg text-gray-600">What drives us every day</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Heart,
                  title: "Passion",
                  description: "Deep love for traditional craftsmanship and heritage preservation",
                  color: "text-red-500",
                },
                {
                  icon: Award,
                  title: "Quality",
                  description: "Uncompromising standards in every thread and weave",
                  color: "text-yellow-500",
                },
                {
                  icon: Users,
                  title: "Community",
                  description: "Supporting local artisans and their families",
                  color: "text-blue-500",
                },
                {
                  icon: Leaf,
                  title: "Sustainability",
                  description: "Eco-friendly practices and natural materials",
                  color: "text-green-500",
                },
              ].map((value, index) => (
                <Card
                  key={value.title}
                  className="text-center hover-lift animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 ${value.color} mx-auto mb-4`}>
                      <value.icon className="w-full h-full" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="animate-fade-in-left">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">The Balaramapuram Legacy</h2>
                <div className="space-y-4 text-gray-600">
                  <p>
                    Balaramapuram, a small town in Kerala, has been synonymous with exquisite handloom textiles for
                    centuries. Our founder, late Shri Sankaran, established SS Balaramapuram in 1950 with a vision to
                    preserve and promote this dying art form.
                  </p>
                  <p>
                    What started as a small workshop with just 5 looms has now grown into a thriving enterprise that
                    supports over 200 artisan families. We take pride in maintaining the traditional techniques while
                    adapting to modern needs and preferences.
                  </p>
                  <p>
                    Every piece that leaves our workshop carries with it the soul of Balaramapuram - the patience of our
                    weavers, the wisdom of generations, and the promise of authenticity that our customers have come to
                    trust.
                  </p>
                </div>
              </div>
              <div className="animate-fade-in-right">
                <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-yellow-100 to-green-100 p-8">
                  <img
                    src="/placeholder.svg?height=500&width=500"
                    alt="Traditional Weaving Process"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { number: "70+", label: "Years of Excellence", icon: Clock },
                { number: "200+", label: "Artisan Families", icon: Users },
                { number: "10,000+", label: "Happy Customers", icon: Heart },
                { number: "4.9", label: "Customer Rating", icon: Star },
              ].map((stat, index) => (
                <div
                  key={stat.label}
                  className="text-center animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 text-yellow-600 mx-auto mb-4">
                    <stat.icon className="w-full h-full" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-gradient-to-r from-yellow-50 to-green-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                To preserve the ancient art of handloom weaving while providing sustainable livelihoods to artisan
                communities, and to bring the beauty of authentic traditional textiles to homes around the world.
              </p>
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  "Every thread tells a story, every weave preserves a tradition."
                </h3>
                <p className="text-gray-600">- Our Founding Philosophy</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
