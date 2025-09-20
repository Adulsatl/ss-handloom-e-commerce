"use client"

import { useApp } from "@/contexts/app-context"
import { generateBarcode, generateQRCode } from "@/lib/barcode-generator"

interface ShippingLabelGeneratorProps {
  orderId: string
  trackingNumber: string
  carrier: string
}

export function useShippingLabelGenerator() {
  const { state } = useApp()

  const generateShippingLabel = (orderId: string, trackingNumber: string, carrier: string) => {
    const order = state.orders.find((o) => o.id === orderId)
    const shipment = state.shipments.find((s) => s.order_id === orderId)

    if (!order) {
      console.error("Order not found:", orderId)
      return
    }

    // Ensure we have proper address data
    const shippingAddress = order.shipping_address || {}
    const customerName = order.customer_name || "Unknown Customer"
    const customerPhone = shippingAddress.phone || order.customer_email || "N/A"

    const barcodeDataUrl = generateBarcode(trackingNumber)
    const qrCodeDataUrl = generateQRCode(trackingNumber)

    const labelContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Shipping Label - ${trackingNumber}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: white;
        }
        .label {
            width: 4in;
            height: 6in;
            border: 2px solid #000;
            padding: 10px;
            box-sizing: border-box;
            page-break-after: always;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
        }
        .company-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .tracking-section {
            text-align: center;
            margin: 15px 0;
            border: 1px solid #000;
            padding: 10px;
        }
        .tracking-number {
            font-size: 18px;
            font-weight: bold;
            font-family: 'Courier New', monospace;
            margin: 5px 0;
        }
        .barcode {
            margin: 10px 0;
        }
        .addresses {
            display: flex;
            justify-content: space-between;
            margin: 15px 0;
        }
        .address-box {
            width: 48%;
            border: 1px solid #000;
            padding: 8px;
            font-size: 10px;
        }
        .address-title {
            font-weight: bold;
            margin-bottom: 5px;
            text-decoration: underline;
        }
        .order-details {
            border: 1px solid #000;
            padding: 8px;
            margin: 10px 0;
            font-size: 10px;
        }
        .footer {
            text-align: center;
            font-size: 8px;
            margin-top: 10px;
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
            <div class="company-name">SS BALARAMAPURAM HANDLOOMS</div>
            <div style="font-size: 10px;">Authentic Traditional Handloom Products</div>
            <div style="font-size: 8px;">Balaramapuram, Kerala - 695501 | Ph: +91 9876543210</div>
        </div>

        <div class="tracking-section">
            <div style="font-size: 12px; font-weight: bold;">${carrier.toUpperCase()} SHIPPING LABEL</div>
            <div class="tracking-number">${trackingNumber}</div>
            <div class="barcode">
                <img src="${barcodeDataUrl}" alt="Barcode" style="max-width: 100%; height: 40px;">
            </div>
            <div style="font-size: 8px;">Scan barcode for tracking</div>
        </div>

        <div class="addresses">
            <div class="address-box">
                <div class="address-title">FROM:</div>
                <div><strong>SS Balaramapuram Handlooms</strong></div>
                <div>Main Street, Balaramapuram</div>
                <div>Thiruvananthapuram, Kerala</div>
                <div>PIN: 695501</div>
                <div>Ph: +91 9876543210</div>
                <div>Email: info@ssbalaramapuram.com</div>
            </div>
            <div class="address-box">
                <div class="address-title">TO:</div>
                <div><strong>${customerName}</strong></div>
                <div>${shippingAddress.street || shippingAddress.address || "Address not provided"}</div>
                <div>${shippingAddress.city || "City not provided"}, ${shippingAddress.state || "State not provided"}</div>
                <div>PIN: ${shippingAddress.pincode || "Pincode not provided"}</div>
                <div>Ph: ${customerPhone}</div>
                <div>Email: ${order.customer_email}</div>
            </div>
        </div>

        <div class="order-details">
            <div style="display: flex; justify-content: space-between;">
                <div>
                    <strong>Order ID:</strong> ${order.id}<br>
                    <strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}<br>
                    <strong>Payment:</strong> ${order.payment_method.toUpperCase()}<br>
                    <strong>Total Value:</strong> ₹${order.total.toLocaleString()}
                </div>
                <div style="text-align: right;">
                    <strong>Weight:</strong> 1.0 KG<br>
                    <strong>COD Amount:</strong> ${order.payment_method === "cod" ? `₹${order.total}` : "NIL"}<br>
                    <strong>Pieces:</strong> ${order.items.reduce((sum, item) => sum + item.quantity, 0)}<br>
                    <strong>Carrier:</strong> ${carrier.toUpperCase()}
                </div>
            </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin: 10px 0;">
            <div style="font-size: 8px; flex: 1;">
                <strong>Items:</strong><br>
                ${order.items.map((item) => `• ${item.product_name} (Qty: ${item.quantity})`).join("<br>")}
            </div>
            <div style="text-align: center; margin-left: 10px;">
                <img src="${qrCodeDataUrl}" alt="QR Code" style="width: 60px; height: 60px;">
                <div style="font-size: 6px;">QR Code</div>
            </div>
        </div>

        <div class="footer">
            <div><strong>Handle with care • Fragile items • Keep dry</strong></div>
            <div>For queries: info@ssbalaramapuram.com | Track: ssbalaramapuram.com/track</div>
            <div>Generated on: ${new Date().toLocaleString()}</div>
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

      // Wait for content to load before printing
      setTimeout(() => {
        printWindow.print()
      }, 500)
    } else {
      alert("Please allow popups to generate shipping labels")
    }
  }

  return { generateShippingLabel }
}
