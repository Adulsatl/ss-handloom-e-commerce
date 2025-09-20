// Simple barcode and QR code generator using canvas
export function generateBarcode(text: string): string {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) return ""

  canvas.width = 200
  canvas.height = 50

  // Simple barcode pattern (Code 128 style)
  ctx.fillStyle = "#000000"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = "#FFFFFF"
  const barWidth = 2
  let x = 10

  // Generate bars based on text
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i)
    const pattern = charCode % 4

    for (let j = 0; j < 4; j++) {
      if ((pattern >> j) & 1) {
        ctx.fillRect(x, 5, barWidth, 40)
      }
      x += barWidth
    }
    x += barWidth // Space between characters
  }

  return canvas.toDataURL()
}

export function generateQRCode(text: string): string {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) return ""

  canvas.width = 100
  canvas.height = 100

  // Simple QR code pattern (simplified)
  ctx.fillStyle = "#FFFFFF"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = "#000000"
  const moduleSize = 4

  // Generate pattern based on text
  for (let y = 0; y < 25; y++) {
    for (let x = 0; x < 25; x++) {
      const hash = (text.charCodeAt((x + y) % text.length) + x + y) % 2
      if (hash === 0) {
        ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize)
      }
    }
  }

  return canvas.toDataURL()
}
