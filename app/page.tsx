import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        {/* Additional sections will be added */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Authentic Handloom Products</h2>
            <p className="text-lg text-gray-600 mb-8">Discover our collection of traditional handwoven textiles</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-full h-48 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">Sarees</h3>
                <p className="text-gray-600">Traditional handwoven sarees</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-full h-48 bg-gradient-to-br from-green-100 to-green-200 rounded-lg mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">Fabrics</h3>
                <p className="text-gray-600">Premium handloom fabrics</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-full h-48 bg-gradient-to-br from-yellow-100 to-green-100 rounded-lg mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">Accessories</h3>
                <p className="text-gray-600">Handcrafted accessories</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
