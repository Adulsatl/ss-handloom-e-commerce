"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { ErrorBoundary } from "@/components/error-boundary"
import { ImageUpload } from "@/components/image-upload"

interface Banner {
  id: string
  title: string
  subtitle: string
  description: string
  image_url: string
  mobile_image_url?: string
  link_url?: string
  link_text?: string
  position: "hero" | "secondary" | "sidebar"
  status: "active" | "inactive"
  sort_order: number
  created_at: string
}

export default function AdminBannersPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null)

  // Mock banners data - replace with actual state management
  const [banners, setBanners] = useState<Banner[]>([
    {
      id: "1",
      title: "Traditional Handloom Collection",
      subtitle: "Discover authentic handwoven textiles",
      description: "Explore our premium collection of traditional handloom products",
      image_url: "/placeholder.svg?height=400&width=800",
      link_url: "/products",
      link_text: "Shop Now",
      position: "hero",
      status: "active",
      sort_order: 1,
      created_at: new Date().toISOString(),
    },
  ])

  const [bannerForm, setBannerForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    image_url: "",
    mobile_image_url: "",
    link_url: "",
    link_text: "",
    position: "hero" as const,
    status: "active" as const,
  })

  const filteredBanners = banners.filter((banner) => banner.title.toLowerCase().includes(searchTerm.toLowerCase()))

  const resetForm = () => {
    setBannerForm({
      title: "",
      subtitle: "",
      description: "",
      image_url: "",
      mobile_image_url: "",
      link_url: "",
      link_text: "",
      position: "hero",
      status: "active",
    })
    setEditingBanner(null)
  }

  const handleInputChange = (field: string, value: string) => {
    setBannerForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!bannerForm.title || !bannerForm.image_url) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in the title and upload an image.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const bannerData: Banner = {
        id: editingBanner?.id || Date.now().toString(),
        ...bannerForm,
        sort_order: editingBanner?.sort_order || banners.length + 1,
        created_at: editingBanner?.created_at || new Date().toISOString(),
      }

      if (editingBanner) {
        setBanners((prev) => prev.map((banner) => (banner.id === editingBanner.id ? bannerData : banner)))
        toast({
          title: "Banner Updated",
          description: "Banner has been updated successfully.",
        })
      } else {
        setBanners((prev) => [...prev, bannerData])
        toast({
          title: "Banner Added",
          description: "New banner has been added successfully.",
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

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setBannerForm({
      title: banner.title,
      subtitle: banner.subtitle,
      description: banner.description,
      image_url: banner.image_url,
      mobile_image_url: banner.mobile_image_url || "",
      link_url: banner.link_url || "",
      link_text: banner.link_text || "",
      position: banner.position,
      status: banner.status,
    })
    setIsAddDialogOpen(true)
  }

  const handleDeleteClick = (bannerId: string) => {
    setBannerToDelete(bannerId)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (bannerToDelete) {
      setBanners((prev) => prev.filter((banner) => banner.id !== bannerToDelete))
      toast({
        title: "Banner Deleted",
        description: "Banner has been deleted successfully.",
      })
      setBannerToDelete(null)
    }
    setDeleteConfirmOpen(false)
  }

  const bannerStats = {
    total: banners.length,
    active: banners.filter((b) => b.status === "active").length,
    hero: banners.filter((b) => b.position === "hero").length,
    secondary: banners.filter((b) => b.position === "secondary").length,
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Banners</h1>
            <p className="text-muted-foreground">Manage website banners and promotional content</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-500 hover:bg-yellow-600" onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add Banner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingBanner ? "Edit Banner" : "Add New Banner"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Desktop Image Upload */}
                <div>
                  <Label>Desktop Image (Recommended: 1200x400px)</Label>
                  <div className="mt-2">
                    <ImageUpload
                      onUpload={(url) => handleInputChange("image_url", url)}
                      currentImage={bannerForm.image_url}
                      placeholder={{ width: 400, height: 133 }}
                      path="banners"
                      maxSize={5}
                    />
                  </div>
                </div>

                {/* Mobile Image Upload */}
                <div>
                  <Label>Mobile Image (Optional - Recommended: 600x400px)</Label>
                  <div className="mt-2">
                    <ImageUpload
                      onUpload={(url) => handleInputChange("mobile_image_url", url)}
                      currentImage={bannerForm.mobile_image_url}
                      placeholder={{ width: 300, height: 200 }}
                      path="banners/mobile"
                      maxSize={5}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={bannerForm.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="Enter banner title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                      id="subtitle"
                      value={bannerForm.subtitle}
                      onChange={(e) => handleInputChange("subtitle", e.target.value)}
                      placeholder="Enter banner subtitle"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={bannerForm.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Banner description..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="link_url">Link URL</Label>
                    <Input
                      id="link_url"
                      value={bannerForm.link_url}
                      onChange={(e) => handleInputChange("link_url", e.target.value)}
                      placeholder="/products or https://example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="link_text">Link Text</Label>
                    <Input
                      id="link_text"
                      value={bannerForm.link_text}
                      onChange={(e) => handleInputChange("link_text", e.target.value)}
                      placeholder="Shop Now, Learn More, etc."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Select value={bannerForm.position} onValueChange={(value) => handleInputChange("position", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hero">Hero Banner</SelectItem>
                        <SelectItem value="secondary">Secondary Banner</SelectItem>
                        <SelectItem value="sidebar">Sidebar Banner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={bannerForm.status} onValueChange={(value) => handleInputChange("status", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        {editingBanner ? "Updating..." : "Adding..."}
                      </div>
                    ) : editingBanner ? (
                      "Update Banner"
                    ) : (
                      "Add Banner"
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
            { label: "Total Banners", value: bannerStats.total.toString(), color: "text-blue-600" },
            { label: "Active", value: bannerStats.active.toString(), color: "text-green-600" },
            { label: "Hero Banners", value: bannerStats.hero.toString(), color: "text-purple-600" },
            { label: "Secondary", value: bannerStats.secondary.toString(), color: "text-orange-600" },
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

        {/* Search */}
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search banners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Banners Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Banners ({filteredBanners.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredBanners.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No banners found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="p-4 font-medium">Banner</th>
                      <th className="p-4 font-medium hidden sm:table-cell">Position</th>
                      <th className="p-4 font-medium hidden md:table-cell">Link</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBanners.map((banner) => (
                      <tr key={banner.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={banner.image_url || "/placeholder.svg"}
                              alt={banner.title}
                              className="w-16 h-10 rounded object-cover bg-gray-100"
                            />
                            <div>
                              <p className="font-medium">{banner.title}</p>
                              <p className="text-sm text-gray-600">{banner.subtitle}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          <Badge variant="outline" className="capitalize">
                            {banner.position.replace("-", " ")}
                          </Badge>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          {banner.link_url ? (
                            <span className="text-blue-600 text-sm">{banner.link_text || "Link"}</span>
                          ) : (
                            <span className="text-gray-400 text-sm">No link</span>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge variant={banner.status === "active" ? "default" : "destructive"}>
                            {banner.status === "active" ? "Active" : "Inactive"}
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
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(banner)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteClick(banner.id)}>
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
          title="Delete Banner"
          description="Are you sure you want to delete this banner? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={handleDeleteConfirm}
          variant="destructive"
        />
      </div>
    </ErrorBoundary>
  )
}
