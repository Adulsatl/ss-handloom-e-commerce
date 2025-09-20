"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ImageUpload } from "@/components/image-upload"
import { useApp } from "@/contexts/app-context"
import { Trash2 } from "lucide-react"

export default function MediaPage() {
  const { toast } = useToast()
  const { state, updateSiteSettings } = useApp()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("logos")

  const [logos, setLogos] = useState({
    mainLogo: state.siteSettings?.logos?.mainLogo || "",
    footerLogo: state.siteSettings?.logos?.footerLogo || "",
    favicon: state.siteSettings?.logos?.favicon || "",
    mobileLogo: state.siteSettings?.logos?.mobileLogo || "",
  })

  const [banners, setBanners] = useState(state.siteSettings?.banners || [])

  const handleLogoUpdate = async (type: keyof typeof logos, imageUrl: string) => {
    setIsLoading(true)
    try {
      const updatedLogos = { ...logos, [type]: imageUrl }
      setLogos(updatedLogos)

      await updateSiteSettings({
        logos: updatedLogos,
      })

      toast({
        title: "Logo Updated",
        description: "Your logo has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was a problem updating your logo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBannerUpdate = async (index: number, imageUrl: string) => {
    setIsLoading(true)
    try {
      const updatedBanners = [...banners]
      updatedBanners[index] = {
        ...updatedBanners[index],
        imageUrl,
      }

      setBanners(updatedBanners)
      await updateSiteSettings({ banners: updatedBanners })

      toast({
        title: "Banner Updated",
        description: "Your banner has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was a problem updating your banner.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddBanner = () => {
    const newBanner = {
      id: `banner_${Date.now()}`,
      imageUrl: "",
      title: "New Banner",
      subtitle: "",
      link: "",
      active: true,
    }

    setBanners([...banners, newBanner])
  }

  const handleDeleteBanner = async (index: number) => {
    try {
      const updatedBanners = banners.filter((_, i) => i !== index)
      setBanners(updatedBanners)
      await updateSiteSettings({ banners: updatedBanners })

      toast({
        title: "Banner Deleted",
        description: "Banner has been removed successfully.",
      })
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "There was a problem deleting the banner.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Media Management</h1>
        <p className="text-muted-foreground">Manage your site logos, banners and media files</p>
      </div>

      <Tabs defaultValue="logos" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="logos">Logos</TabsTrigger>
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="gallery">Media Gallery</TabsTrigger>
        </TabsList>

        <TabsContent value="logos" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main Logo */}
            <Card>
              <CardHeader>
                <CardTitle>Main Logo</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  onUpload={(url) => handleLogoUpdate("mainLogo", url)}
                  currentImage={logos.mainLogo}
                  placeholder={{ width: 200, height: 60 }}
                  path="logos"
                  maxSize={2}
                  aspectRatio="3/1"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Recommended size: 200x60px. PNG or SVG with transparent background.
                </p>
              </CardContent>
            </Card>

            {/* Mobile Logo */}
            <Card>
              <CardHeader>
                <CardTitle>Mobile Logo</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  onUpload={(url) => handleLogoUpdate("mobileLogo", url)}
                  currentImage={logos.mobileLogo}
                  placeholder={{ width: 40, height: 40 }}
                  path="logos"
                  maxSize={1}
                  aspectRatio="1/1"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Recommended size: 40x40px. Square format for mobile display.
                </p>
              </CardContent>
            </Card>

            {/* Footer Logo */}
            <Card>
              <CardHeader>
                <CardTitle>Footer Logo</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  onUpload={(url) => handleLogoUpdate("footerLogo", url)}
                  currentImage={logos.footerLogo}
                  placeholder={{ width: 160, height: 60 }}
                  path="logos"
                  maxSize={2}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Recommended size: 160x60px. Can be different from main logo.
                </p>
              </CardContent>
            </Card>

            {/* Favicon */}
            <Card>
              <CardHeader>
                <CardTitle>Favicon</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  onUpload={(url) => handleLogoUpdate("favicon", url)}
                  currentImage={logos.favicon}
                  placeholder={{ width: 32, height: 32 }}
                  path="logos"
                  maxSize={0.5}
                  aspectRatio="1/1"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Recommended size: 32x32px. Will be displayed in browser tabs.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="banners" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button onClick={handleAddBanner} className="bg-yellow-500 hover:bg-yellow-600">
              Add New Banner
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {banners.map((banner, index) => (
              <Card key={banner.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>{banner.title || `Banner ${index + 1}`}</CardTitle>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteBanner(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ImageUpload
                      onUpload={(url) => handleBannerUpdate(index, url)}
                      currentImage={banner.imageUrl}
                      placeholder={{ width: 1200, height: 400 }}
                      path="banners"
                      maxSize={5}
                    />
                    <p className="text-sm text-gray-500">
                      Recommended size: 1200x400px. Will be displayed on the homepage.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}

            {banners.length === 0 && (
              <div className="text-center p-8 border rounded-lg bg-gray-50">
                <p className="text-gray-500">No banners added yet. Click "Add New Banner" to create one.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Media Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8">
                <p className="text-gray-500">Media gallery functionality coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
