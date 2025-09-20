"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Upload, X, ImageIcon } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"

interface ImageUploadProps {
  onUpload: (url: string) => void
  currentImage?: string
  placeholder?: { width: number; height: number }
  path?: string
  maxSize?: number // in MB
  aspectRatio?: string
  accept?: string
}

export function ImageUpload({
  onUpload,
  currentImage,
  placeholder = { width: 300, height: 300 },
  path = "uploads",
  maxSize = 5,
  aspectRatio,
  accept = "image/*",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string>(currentImage || "")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file.",
        variant: "destructive",
      })
      return
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: `Please select an image smaller than ${maxSize}MB.`,
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPreview(result)
      }
      reader.readAsDataURL(file)

      // Simulate upload process (in real app, upload to your storage service)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes, we'll use the file data URL
      // In production, you'd upload to a service like Cloudinary, AWS S3, etc.
      const uploadedUrl = await uploadToStorage(file, path)

      onUpload(uploadedUrl)

      toast({
        title: "Upload Successful",
        description: "Image has been uploaded successfully.",
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
      setPreview(currentImage || "")
    } finally {
      setIsUploading(false)
    }
  }

  const uploadToStorage = async (file: File, path: string): Promise<string> => {
    // In a real application, you would upload to your storage service
    // For now, we'll create a data URL and store it in localStorage for persistence
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string

        // Store in localStorage for demo purposes
        const storageKey = `uploaded_image_${Date.now()}`
        localStorage.setItem(storageKey, dataUrl)

        // Return a reference to the stored image
        resolve(dataUrl)
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemove = () => {
    setPreview("")
    onUpload("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Image Upload</Label>
        {preview && (
          <Button variant="outline" size="sm" onClick={handleRemove}>
            <X className="w-4 h-4 mr-2" />
            Remove
          </Button>
        )}
      </div>

      <div
        className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
          isUploading ? "border-blue-300 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        }`}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview || "/placeholder.svg"}
              alt="Preview"
              className="w-full h-auto max-h-64 object-contain rounded"
              style={{
                aspectRatio: aspectRatio || "auto",
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all rounded flex items-center justify-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleClick}
                className="opacity-0 hover:opacity-100 transition-opacity"
              >
                <Upload className="w-4 h-4 mr-2" />
                Change Image
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 cursor-pointer" onClick={handleClick}>
            {isUploading ? (
              <div className="flex flex-col items-center">
                <LoadingSpinner size="lg" className="mb-4" />
                <p className="text-sm text-gray-600">Uploading image...</p>
              </div>
            ) : (
              <>
                <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-sm text-gray-600 text-center">
                  Click to upload an image
                  <br />
                  <span className="text-xs text-gray-500">
                    Max size: {maxSize}MB • {accept}
                  </span>
                </p>
              </>
            )}
          </div>
        )}

        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      {aspectRatio && (
        <p className="text-xs text-gray-500">Recommended aspect ratio: {aspectRatio.replace("/", ":")}</p>
      )}
    </div>
  )
}
