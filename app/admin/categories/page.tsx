"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"

export default function AdminCategoriesPage() {
  const { state, addCategory, updateCategory, deleteCategory } = useApp()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [viewingCategory, setViewingCategory] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    description: "",
  })

  const filteredCategories = state.categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const resetForm = () => {
    setCategoryForm({
      name: "",
      slug: "",
      description: "",
    })
    setEditingCategory(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const categoryData = {
      name: categoryForm.name,
      slug: categoryForm.slug || categoryForm.name.toLowerCase().replace(/\s+/g, "-"),
      description: categoryForm.description,
      productCount: editingCategory?.productCount || 0,
      status: "active" as const,
    }

    if (editingCategory) {
      updateCategory({
        ...categoryData,
        id: editingCategory.id,
        created_at: editingCategory.created_at,
      })
      toast({
        title: "Category Updated",
        description: "Category has been updated successfully.",
      })
    } else {
      addCategory(categoryData)
      toast({
        title: "Category Added",
        description: "New category has been added successfully.",
      })
    }

    resetForm()
    setIsDialogOpen(false)
  }

  const handleEdit = (category: any) => {
    setEditingCategory(category)
    setCategoryForm({
      name: category.name,
      slug: category.slug,
      description: category.description,
    })
    setIsDialogOpen(true)
  }

  const handleView = (category: any) => {
    setViewingCategory(category)
    setIsViewDialogOpen(true)
  }

  const handleDelete = (categoryId: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      deleteCategory(categoryId)
      toast({
        title: "Category Deleted",
        description: "Category has been deleted successfully.",
      })
    }
  }

  // Calculate actual product counts
  const categoriesWithCounts = filteredCategories.map((category) => ({
    ...category,
    productCount: state.products.filter((p) => p.category === category.slug).length,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Manage product categories</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-yellow-500 hover:bg-yellow-600" onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  placeholder="Auto-generated from name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="Category description..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600">
                  {editingCategory ? "Update Category" : "Add Category"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoriesWithCounts.map((category) => (
          <Card key={category.id} className="hover-lift">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleView(category)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEdit(category)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(category.id)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={category.status === "active" ? "default" : "secondary"}>{category.status}</Badge>
                  <span className="text-sm text-gray-600">{category.productCount} products</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Category Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Category Details</DialogTitle>
          </DialogHeader>
          {viewingCategory && (
            <div className="space-y-4">
              <div>
                <Label>Category Name</Label>
                <p className="text-lg font-medium">{viewingCategory.name}</p>
              </div>
              <div>
                <Label>URL Slug</Label>
                <p className="text-gray-600">{viewingCategory.slug}</p>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-gray-600">{viewingCategory.description || "No description"}</p>
              </div>
              <div>
                <Label>Products</Label>
                <p className="text-gray-600">
                  {state.products.filter((p) => p.category === viewingCategory.slug).length} products
                </p>
              </div>
              <div>
                <Label>Status</Label>
                <Badge variant={viewingCategory.status === "active" ? "default" : "secondary"}>
                  {viewingCategory.status}
                </Badge>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsViewDialogOpen(false)
                    handleEdit(viewingCategory)
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600"
                >
                  Edit Category
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
