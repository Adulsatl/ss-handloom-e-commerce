"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ImageUpload } from "@/components/image-upload"
import { X, Plus, MoveUp, MoveDown } from "lucide-react"

interface ImageGalleryProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  imageSize?: { width: number; height: number }
}

export function ImageGallery({
  images,
  onImagesChange,
  maxImages = 5,
  imageSize = { width: 200, height: 200 },
}: ImageGalleryProps) {
  const [showUpload, setShowUpload] = useState(false)

  const handleAddImage = (url: string) => {
    if (images.length < maxImages) {
      onImagesChange([...images, url])
      setShowUpload(false)
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onImagesChange(newImages)
  }

  const handleMoveImage = (index: number, direction: "up" | "down") => {
    const newImages = [...images]
    const targetIndex = direction === "up" ? index - 1 : index + 1

    if (targetIndex >= 0 && targetIndex < images.length) {
      ;[newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]]
      onImagesChange(newImages)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Product Images</h3>
        <span className="text-sm text-gray-500">
          {images.length}/{maxImages} images
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <Card key={index} className="relative group">
            <div className="aspect-square">
              <img
                src={image || "/placeholder.svg"}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                {index > 0 && (
                  <Button type="button" variant="secondary" size="sm" onClick={() => handleMoveImage(index, "up")}>
                    <MoveUp className="w-3 h-3" />
                  </Button>
                )}
                {index < images.length - 1 && (
                  <Button type="button" variant="secondary" size="sm" onClick={() => handleMoveImage(index, "down")}>
                    <MoveDown className="w-3 h-3" />
                  </Button>
                )}
                <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveImage(index)}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
            {index === 0 && (
              <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">Primary</div>
            )}
          </Card>
        ))}

        {images.length < maxImages && (
          <Card className="aspect-square border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
            {showUpload ? (
              <div className="p-2">
                <ImageUpload onUpload={handleAddImage} placeholder={imageSize} path="products" maxSize={5} />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={() => setShowUpload(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div
                className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setShowUpload(true)}
              >
                <Plus className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Add Image</span>
              </div>
            )}
          </Card>
        )}
      </div>

      {images.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No images uploaded yet. Click "Add Image" to get started.</p>
        </div>
      )}
    </div>
  )
}
