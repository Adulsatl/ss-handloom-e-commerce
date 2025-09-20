"use client"

import { useState, useMemo } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useCart } from "@/contexts/cart-context"
import { useApp } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"
import { Filter, Search, X } from "lucide-react"

export default function ProductsPage() {
  const { addToCart } = useCart()
  const { state } = useApp()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [sortBy, setSortBy] = useState("name")
  const [showFilters, setShowFilters] = useState(false)

  // Get unique categories and sizes
  const categories = Array.from(new Set(state.products.map((p) => p.category)))
  const sizes = Array.from(new Set(state.products.flatMap((p) => p.size)))

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const filtered = state.products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(product.category)
      const matchesSize = selectedSizes.length === 0 || product.size.some((size) => selectedSizes.includes(size))
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1]
      const isActive = product.status === "active"

      return matchesSearch && matchesCategory && matchesSize && matchesPrice && isActive
    })

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })

    return filtered
  }, [state.products, searchTerm, selectedCategories, selectedSizes, priceRange, sortBy])

  const handleAddToCart = (product: any) => {
    addToCart(product)
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category])
    } else {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
    }
  }

  const handleSizeChange = (size: string, checked: boolean) => {
    if (checked) {
      setSelectedSizes([...selectedSizes, size])
    } else {
      setSelectedSizes(selectedSizes.filter((s) => s !== size))
    }
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedCategories([])
    setSelectedSizes([])
    setPriceRange([0, 10000])
    setSortBy("name")
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Our Products</h1>
          <p className="text-lg text-gray-600">Discover our collection of authentic handloom products</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:hidden mb-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
            </div>

            <div className={`space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}>
              {/* Search */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Search</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                      />
                      <Label htmlFor={category} className="capitalize cursor-pointer">
                        {category.replace("-", " ")}
                      </Label>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Sizes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sizes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sizes.map((size) => (
                    <div key={size} className="flex items-center space-x-2">
                      <Checkbox
                        id={size}
                        checked={selectedSizes.includes(size)}
                        onCheckedChange={(checked) => handleSizeChange(size, checked as boolean)}
                      />
                      <Label htmlFor={size} className="cursor-pointer">
                        {size}
                      </Label>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Price Range */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Price Range</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={10000}
                    min={0}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Clear Filters */}
              <Button variant="outline" onClick={clearFilters} className="w-full">
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Sort and Results */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <p className="text-gray-600">
                Showing {filteredProducts.length} of {state.products.length} products
              </p>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="price-low">Price (Low to High)</SelectItem>
                  <SelectItem value="price-high">Price (High to Low)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products */}
            {filteredProducts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your filters or search terms.</p>
                  <Button onClick={clearFilters}>Clear Filters</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow hover-lift">
                    <div className="aspect-square bg-gradient-to-br from-yellow-100 to-green-100 p-4">
                      <img
                        src={product.image_url || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold text-yellow-600">₹{product.price}</span>
                        <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                      </div>
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Available sizes:</p>
                        <div className="flex flex-wrap gap-1">
                          {product.size.map((size) => (
                            <span key={size} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {size}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button
                        className="w-full bg-yellow-500 hover:bg-yellow-600"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                      >
                        {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
