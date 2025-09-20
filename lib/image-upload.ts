interface ImageUploadOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: "jpeg" | "png" | "webp"
}

interface ResizeOptions {
  width: number
  height: number
  fit?: "cover" | "contain" | "fill"
}

export class ImageUploadService {
  private static instance: ImageUploadService

  static getInstance(): ImageUploadService {
    if (!ImageUploadService.instance) {
      ImageUploadService.instance = new ImageUploadService()
    }
    return ImageUploadService.instance
  }

  // Validate file before upload
  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (!file.type.startsWith("image/")) {
      return { valid: false, error: "Please select a valid image file" }
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { valid: false, error: "Image size must be less than 10MB" }
    }

    // Check supported formats
    const supportedFormats = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!supportedFormats.includes(file.type)) {
      return { valid: false, error: "Supported formats: JPEG, PNG, WebP, GIF" }
    }

    return { valid: true }
  }

  // Resize image to specific dimensions
  async resizeImage(file: File, options: ResizeOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        const { width, height, fit = "cover" } = options

        // Calculate dimensions based on fit type
        const sourceX = 0,
          sourceY = 0,
          sourceWidth = img.width,
          sourceHeight = img.height
        let destX = 0,
          destY = 0,
          destWidth = width,
          destHeight = height

        if (fit === "cover") {
          // Scale to fill the entire canvas, cropping if necessary
          const scale = Math.max(width / img.width, height / img.height)
          const scaledWidth = img.width * scale
          const scaledHeight = img.height * scale

          destX = (width - scaledWidth) / 2
          destY = (height - scaledHeight) / 2
          destWidth = scaledWidth
          destHeight = scaledHeight
        } else if (fit === "contain") {
          // Scale to fit within canvas, maintaining aspect ratio
          const scale = Math.min(width / img.width, height / img.height)
          destWidth = img.width * scale
          destHeight = img.height * scale
          destX = (width - destWidth) / 2
          destY = (height - destHeight) / 2
        }

        canvas.width = width
        canvas.height = height

        // Fill background with white for transparency
        ctx!.fillStyle = "#ffffff"
        ctx!.fillRect(0, 0, width, height)

        // Draw the resized image
        ctx!.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight)

        // Convert canvas to base64
        const resizedDataUrl = canvas.toDataURL("image/jpeg", 0.9)
        resolve(resizedDataUrl)
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = URL.createObjectURL(file)
    })
  }

  // Generate multiple sizes for responsive images
  async generateImageSizes(file: File): Promise<{
    thumbnail: string
    medium: string
    large: string
    original: string
  }> {
    const [thumbnail, medium, large, original] = await Promise.all([
      this.resizeImage(file, { width: 150, height: 150, fit: "cover" }),
      this.resizeImage(file, { width: 400, height: 400, fit: "cover" }),
      this.resizeImage(file, { width: 800, height: 800, fit: "cover" }),
      this.fileToBase64(file),
    ])

    return {
      thumbnail,
      medium,
      large,
      original,
    }
  }

  // Simulate upload to storage (returns base64 for now)
  async uploadToStorage(file: File, path: string): Promise<string> {
    try {
      // For now, we'll just return the base64 data URL
      // In production, this would upload to actual storage
      const dataUrl = await this.fileToBase64(file)

      // Store in localStorage for persistence across sessions
      const storageKey = `uploaded_image_${Date.now()}_${Math.random().toString(36).substring(2)}`
      localStorage.setItem(storageKey, dataUrl)

      // Return a reference that can be used to retrieve the image
      return dataUrl
    } catch (error) {
      console.error("Upload error:", error)
      throw new Error("Failed to upload image")
    }
  }

  // Complete upload process with resizing
  async uploadWithResize(file: File, path: string, targetSize: { width: number; height: number }): Promise<string> {
    // Validate file
    const validation = this.validateFile(file)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    // Resize image and return base64
    const resizedDataUrl = await this.resizeImage(file, {
      width: targetSize.width,
      height: targetSize.height,
      fit: "cover",
    })

    // Store in localStorage for persistence
    const storageKey = `uploaded_image_${Date.now()}_${Math.random().toString(36).substring(2)}`
    localStorage.setItem(storageKey, resizedDataUrl)

    return resizedDataUrl
  }

  // Convert file to base64 for preview
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Compress image for better performance
  async compressImage(file: File, quality = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        // Maintain original dimensions but compress
        canvas.width = img.width
        canvas.height = img.height

        // Draw image
        ctx!.drawImage(img, 0, 0)

        // Convert to compressed base64
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality)
        resolve(compressedDataUrl)
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = URL.createObjectURL(file)
    })
  }
}

export const imageUploadService = ImageUploadService.getInstance()
