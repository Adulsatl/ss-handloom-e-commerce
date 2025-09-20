"use client"

import { useApp } from "@/contexts/app-context"

export function useInvoicePrinter() {
  const { state } = useApp()

  const printInvoice = (orderId: string) => {
    const order = state.orders.find((o) => o.id === orderId)
    if (!order) return

    const invoiceContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Invoice - ${order.id}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #FFC107; padding-bottom: 20px; }
        .company-name { font-size: 24px; font-weight: bold; color: #333; }
        .company-details { margin-top: 10px; color: #666; }
        .invoice-details { display: flex; justify-content: space-between; margin: 30px 0; }
        .invoice-details div { flex: 1; }
        .customer-details { margin: 20px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .items-table th, .items-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .items-table th { background-color: #f8f9fa; font-weight: bold; }
        .total-section { margin-top: 20px; text-align: right; }
        .total-row { margin: 5px 0; }
        .grand-total { font-size: 18px; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; }
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">SS Balaramapuram Handlooms</div>
        <div class="company-details">
            Authentic Traditional Handloom Products<br>
            Balaramapuram, Thiruvananthapuram, Kerala, India - 695501<br>
            Phone: +91 9876543210 | Email: info@ssbalaramapuram.com<br>
            GSTIN: 32XXXXX1234X1ZX
        </div>
    </div>

    <div class="invoice-details">
        <div>
            <h3>Invoice Details</h3>
            <p><strong>Invoice No:</strong> INV-${order.id}</p>
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
            <p><strong>Payment Method:</strong> ${order.payment_method.toUpperCase()}</p>
            ${order.payment_id ? `<p><strong>Payment ID:</strong> ${order.payment_id}</p>` : ""}
        </div>
        <div>
            <h3>Bill To</h3>
            <p><strong>${order.customer_name}</strong></p>
            <p>${order.customer_email}</p>
            <p>${order.shipping_address.address}</p>
            <p>${order.shipping_address.city}, ${order.shipping_address.state}</p>
            <p>${order.shipping_address.pincode}, ${order.shipping_address.country}</p>
            ${order.shipping_address.phone ? `<p>Phone: ${order.shipping_address.phone}</p>` : ""}
        </div>
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th>S.No</th>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            ${order.items
              .map(
                (item, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.product_name}</td>
                    <td>${item.quantity}</td>
                    <td>₹${item.price}</td>
                    <td>₹${item.price * item.quantity}</td>
                </tr>
            `,
              )
              .join("")}
        </tbody>
    </table>

    <div class="total-section">
        <div class="total-row">
            <strong>Subtotal: ₹${order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)}</strong>
        </div>
        <div class="total-row">
            <strong>Shipping: ₹${order.total - order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)}</strong>
        </div>
        <div class="total-row grand-total">
            <strong>Grand Total: ₹${order.total}</strong>
        </div>
    </div>

    <div class="footer">
        <p>Thank you for your business!</p>
        <p>This is a computer-generated invoice and does not require a signature.</p>
        <p>For any queries, please contact us at info@ssbalaramapuram.com or +91 9876543210</p>
    </div>
</body>
</html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(invoiceContent)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
  }

  return { printInvoice }
}
