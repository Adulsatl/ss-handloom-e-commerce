"use client"

import { useApp } from "@/contexts/app-context"
import { generateBarcode, generateQRCode } from "@/lib/barcode-generator"

export function useCourierShippingLabels() {
  const { state } = useApp()

  const generateDelhiveryLabel = (orderId: string, trackingNumber: string) => {
    const order = state.orders.find((o) => o.id === orderId)
    if (!order) return

    const shippingAddress = order.shipping_address || {}
    const barcodeDataUrl = generateBarcode(trackingNumber)
    const qrCodeDataUrl = generateQRCode(trackingNumber)

    const labelContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Delhivery Shipping Label - ${trackingNumber}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 10px; 
            background: white;
            font-size: 12px;
        }
        .label {
            width: 4in;
            height: 6in;
            border: 2px solid #000;
            padding: 8px;
            box-sizing: border-box;
            position: relative;
        }
        .header {
            text-align: center;
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
            margin-bottom: 8px;
        }
        .delhivery-logo {
            font-size: 18px;
            font-weight: bold;
            color: #e31e24;
            margin-bottom: 3px;
        }
        .tracking-section {
            text-align: center;
            margin: 8px 0;
            border: 1px solid #000;
            padding: 5px;
        }
        .tracking-number {
            font-size: 14px;
            font-weight: bold;
            font-family: 'Courier New', monospace;
            margin: 3px 0;
        }
        .barcode-section {
            text-align: center;
            margin: 8px 0;
        }
        .addresses {
            margin: 8px 0;
        }
        .address-row {
            display: flex;
            margin-bottom: 8px;
        }
        .address-box {
            flex: 1;
            border: 1px solid #000;
            padding: 5px;
            font-size: 9px;
            margin-right: 5px;
        }
        .address-box:last-child {
            margin-right: 0;
        }
        .address-title {
            font-weight: bold;
            font-size: 8px;
            background: #000;
            color: white;
            padding: 2px;
            margin: -5px -5px 3px -5px;
        }
        .order-info {
            border: 1px solid #000;
            padding: 5px;
            margin: 8px 0;
            font-size: 8px;
        }
        .bottom-section {
            position: absolute;
            bottom: 8px;
            left: 8px;
            right: 8px;
        }
        .cod-section {
            border: 2px solid #000;
            padding: 5px;
            text-align: center;
            font-weight: bold;
            margin-bottom: 5px;
        }
        @media print {
            body { margin: 0; padding: 0; }
            .label { margin: 0; }
        }
    </style>
</head>
<body>
    <div class="label">
        <div class="header">
            <div class="delhivery-logo">DELHIVERY</div>
            <div style="font-size: 8px;">Express & Logistics</div>
        </div>

        <div class="tracking-section">
            <div style="font-size: 10px;">AWB No.</div>
            <div class="tracking-number">${trackingNumber}</div>
        </div>

        <div class="barcode-section">
            <img src="${barcodeDataUrl}" alt="Barcode" style="max-width: 100%; height: 30px;">
        </div>

        <div class="addresses">
            <div class="address-row">
                <div class="address-box">
                    <div class="address-title">FROM</div>
                    <div><strong>SS BALARAMAPURAM HANDLOOMS</strong></div>
                    <div>Main Street, Balaramapuram</div>
                    <div>Thiruvananthapuram, Kerala - 695501</div>
                    <div>Ph: +91 9876543210</div>
                </div>
                <div class="address-box">
                    <div class="address-title">TO</div>
                    <div><strong>${order.customer_name}</strong></div>
                    <div>${shippingAddress.address || ""}</div>
                    <div>${shippingAddress.city || ""}, ${shippingAddress.state || ""}</div>
                    <div>PIN: ${shippingAddress.pincode || ""}</div>
                    <div>Ph: ${shippingAddress.phone || order.customer_email}</div>
                </div>
            </div>
        </div>

        <div class="order-info">
            <div style="display: flex; justify-content: space-between;">
                <div>
                    <strong>Order:</strong> ${order.id}<br>
                    <strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}<br>
                    <strong>Weight:</strong> 1.0 KG
                </div>
                <div style="text-align: right;">
                    <strong>Pieces:</strong> ${order.items.reduce((sum, item) => sum + item.quantity, 0)}<br>
                    <strong>Mode:</strong> ${order.payment_method.toUpperCase()}<br>
                    <strong>Service:</strong> Surface
                </div>
            </div>
        </div>

        <div class="bottom-section">
            ${
              order.payment_method === "cod"
                ? `
            <div class="cod-section">
                <div style="font-size: 10px;">COD AMOUNT</div>
                <div style="font-size: 16px;">₹${order.total}</div>
            </div>
            `
                : ""
            }
            
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 7px;">
                    <div>Items: ${order.items.map((item) => `${item.product_name}(${item.quantity})`).join(", ")}</div>
                    <div>Generated: ${new Date().toLocaleString()}</div>
                </div>
                <img src="${qrCodeDataUrl}" alt="QR" style="width: 40px; height: 40px;">
            </div>
        </div>
    </div>
</body>
</html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(labelContent)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => printWindow.print(), 500)
    }
  }

  const generateBlueDartLabel = (orderId: string, trackingNumber: string) => {
    const order = state.orders.find((o) => o.id === orderId)
    if (!order) return

    const shippingAddress = order.shipping_address || {}
    const barcodeDataUrl = generateBarcode(trackingNumber)

    const labelContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Blue Dart Shipping Label - ${trackingNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 10px; background: white; }
        .label { width: 4in; height: 6in; border: 2px solid #0066cc; padding: 8px; box-sizing: border-box; }
        .header { text-align: center; background: #0066cc; color: white; padding: 8px; margin: -8px -8px 10px -8px; }
        .blue-dart-logo { font-size: 20px; font-weight: bold; }
        .tracking-number { font-size: 16px; font-weight: bold; text-align: center; margin: 10px 0; }
        .barcode-section { text-align: center; margin: 10px 0; }
        .address-section { display: flex; gap: 10px; margin: 10px 0; }
        .address-box { flex: 1; border: 1px solid #0066cc; padding: 8px; font-size: 10px; }
        .address-title { font-weight: bold; color: #0066cc; margin-bottom: 5px; }
        @media print { body { margin: 0; padding: 0; } .label { margin: 0; } }
    </style>
</head>
<body>
    <div class="label">
        <div class="header">
            <div class="blue-dart-logo">BLUE DART</div>
            <div>Express Distribution & Logistics</div>
        </div>
        
        <div class="tracking-number">AWB: ${trackingNumber}</div>
        
        <div class="barcode-section">
            <img src="${barcodeDataUrl}" alt="Barcode" style="max-width: 100%; height: 40px;">
        </div>
        
        <div class="address-section">
            <div class="address-box">
                <div class="address-title">FROM</div>
                <div><strong>SS BALARAMAPURAM HANDLOOMS</strong></div>
                <div>Main Street, Balaramapuram</div>
                <div>Thiruvananthapuram, Kerala - 695501</div>
                <div>Ph: +91 9876543210</div>
            </div>
            <div class="address-box">
                <div class="address-title">TO</div>
                <div><strong>${order.customer_name}</strong></div>
                <div>${shippingAddress.address || ""}</div>
                <div>${shippingAddress.city || ""}, ${shippingAddress.state || ""}</div>
                <div>PIN: ${shippingAddress.pincode || ""}</div>
                <div>Ph: ${shippingAddress.phone || order.customer_email}</div>
            </div>
        </div>
        
        <div style="border: 1px solid #0066cc; padding: 8px; margin: 10px 0; font-size: 10px;">
            <div><strong>Order:</strong> ${order.id} | <strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</div>
            <div><strong>Payment:</strong> ${order.payment_method.toUpperCase()} | <strong>Weight:</strong> 1.0 KG</div>
            ${order.payment_method === "cod" ? `<div style="text-align: center; font-size: 14px; font-weight: bold; color: #0066cc;">COD: ₹${order.total}</div>` : ""}
        </div>
    </div>
</body>
</html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(labelContent)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => printWindow.print(), 500)
    }
  }

  const generateCourierLabel = (courier: string, orderId: string, trackingNumber: string) => {
    switch (courier.toLowerCase()) {
      case "delhivery":
        generateDelhiveryLabel(orderId, trackingNumber)
        break
      case "bluedart":
        generateBlueDartLabel(orderId, trackingNumber)
        break
      default:
        generateDelhiveryLabel(orderId, trackingNumber) // Default to Delhivery format
    }
  }

  return { generateCourierLabel, generateDelhiveryLabel, generateBlueDartLabel }
}
