"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, AlertCircle } from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"
import { validateForm, type ValidationRules } from "@/lib/validation"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { ErrorBoundary } from "@/components/error-boundary"
import { ImageUpload } from "@/components/image-upload"

const productValidationRules: ValidationRules = {
  name: { required: true, minLength: 3, maxLength: 100 },
  price: { required: true, min: 1, max: 1000000 },
  category: { required: true },
  size: { required: true, minLength: 1 },
  stock: { required: true, min: 0, max: 10000 },
  description: { maxLength: 500 },
}

export default function AdminProductsPage() {
  const { state, addProduct, updateProduct, deleteProduct } = useApp()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [uploadedImage, setUploadedImage] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    category: "",
    size: "",
    stock: "",
    description: "",
  })

  const filteredProducts = state.products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const resetForm = () => {
    setProductForm({
      name: "",
      price: "",
      category: "",
      size: "",
      stock: "",
      description: "",
    })
    setUploadedImage("")
    setErrors({})
    setEditingProduct(null)
  }

  const handleInputChange = (field: string, value: string) => {
    setProductForm((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateFormData = () => {
    const formDataToValidate = {
      ...productForm,
      price: Number.parseFloat(productForm.price) || 0,
      stock: Number.parseInt(productForm.stock) || 0,
    }

    const validationErrors = validateForm(formDataToValidate, productValidationRules)
    setErrors(validationErrors)
    return Object.keys(validationErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateFormData()) {
      toast({
        title: "Please fix the errors",
        description: "Check the form for validation errors and try again.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const productData = {
        name: productForm.name.trim(),
        price: Number.parseFloat(productForm.price),
        category: productForm.category,
        size: productForm.size
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        stock: Number.parseInt(productForm.stock),
        status: "active" as const,
        description: productForm.description.trim(),
        image_url: uploadedImage || "/placeholder.svg?height=300&width=300",
      }

      if (editingProduct) {
        updateProduct({
          ...productData,
          id: editingProduct.id,
          created_at: editingProduct.created_at,
          updated_at: new Date().toISOString(),
        })
        toast({
          title: "Product Updated",
          description: "Product has been updated successfully.",
        })
      } else {
        addProduct(productData)
        toast({
          title: "Product Added",
          description: "New product has been added successfully.",
        })
      }

      resetForm()
      setIsAddDialogOpen(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (product: any) => {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      size: product.size.join(", "),
      stock: product.stock.toString(),
      description: product.description,
    })
    setUploadedImage(product.image_url)
    setIsAddDialogOpen(true)
  }

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      deleteProduct(productToDelete)
      toast({
        title: "Product Deleted",
        description: "Product has been deleted successfully.",
      })
      setProductToDelete(null)
    }
    setDeleteConfirmOpen(false)
  }

  const productStats = {
    total: state.products.length,
    active: state.products.filter((p) => p.status === "active").length,
    lowStock: state.products.filter((p) => p.stock < 5).length,
    outOfStock: state.products.filter((p) => p.stock === 0).length,
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground">Manage your product catalog</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-500 hover:bg-yellow-600" onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Image Upload */}
                <div>
                  <Label>Product Image</Label>
                  <div className="mt-2">
                    <ImageUpload
                      onUpload={(url) => setUploadedImage(url)}
                      currentImage={uploadedImage}
                      placeholder={{ width: 300, height: 300 }}
                      path="products"
                      maxSize={5}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={productForm.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className={errors.name ? "border-red-500" : ""}
                      placeholder="Enter product name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={productForm.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                      className={errors.price ? "border-red-500" : ""}
                      placeholder="0"
                      min="1"
                      step="0.01"
                    />
                    {errors.price && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.price}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={productForm.category}
                      onValueChange={(value) => handleInputChange("category", value)}
                    >
                      <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sarees">Sarees</SelectItem>
                        <SelectItem value="fabrics">Fabrics</SelectItem>
                        <SelectItem value="mens-wear">Men's Wear</SelectItem>
                        <SelectItem value="home-textiles">Home Textiles</SelectItem>
                        <SelectItem value="accessories">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.category}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="stock">Stock Quantity *</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => handleInputChange("stock", e.target.value)}
                      className={errors.stock ? "border-red-500" : ""}
                      placeholder="0"
                      min="0"
                    />
                    {errors.stock && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.stock}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="size">Available Sizes (comma separated) *</Label>
                  <Input
                    id="size"
                    value={productForm.size}
                    onChange={(e) => handleInputChange("size", e.target.value)}
                    className={errors.size ? "border-red-500" : ""}
                    placeholder="e.g., S, M, L, XL or Free Size"
                  />
                  {errors.size && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.size}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={productForm.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className={errors.description ? "border-red-500" : ""}
                    placeholder="Product description..."
                    rows={3}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        {editingProduct ? "Updating..." : "Adding..."}
                      </div>
                    ) : editingProduct ? (
                      "Update Product"
                    ) : (
                      "Add Product"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Products", value: productStats.total.toString(), color: "text-blue-600" },
            { label: "Active", value: productStats.active.toString(), color: "text-green-600" },
            { label: "Low Stock", value: productStats.lowStock.toString(), color: "text-yellow-600" },
            { label: "Out of Stock", value: productStats.outOfStock.toString(), color: "text-red-600" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 md:p-6">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Products ({filteredProducts.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No products found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="p-4 font-medium">Product</th>
                      <th className="p-4 font-medium hidden sm:table-cell">Category</th>
                      <th className="p-4 font-medium">Price</th>
                      <th className="p-4 font-medium hidden md:table-cell">Stock</th>
                      <th className="p-4 font-medium hidden sm:table-cell">Status</th>
                      <th className="p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image_url || "/placeholder.svg"}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                            />
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-600 sm:hidden">{product.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          <Badge variant="outline" className="capitalize">
                            {product.category.replace("-", " ")}
                          </Badge>
                        </td>
                        <td className="p-4 font-medium">₹{product.price}</td>
                        <td className="p-4 hidden md:table-cell">
                          <span
                            className={
                              product.stock === 0
                                ? "text-red-600 font-medium"
                                : product.stock < 5
                                  ? "text-yellow-600 font-medium"
                                  : ""
                            }
                          >
                            {product.stock}
                          </span>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          <Badge variant={product.status === "active" ? "default" : "destructive"}>
                            {product.status === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(product)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(product.id)}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={deleteConfirmOpen}
          onOpenChange={setDeleteConfirmOpen}
          title="Delete Product"
          description="Are you sure you want to delete this product? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          variant="destructive"
        />
      </div>
    </ErrorBoundary>
  )
}
