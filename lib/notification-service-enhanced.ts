export interface NotificationData {
  customerName: string
  customerEmail: string
  customerPhone?: string
  orderNumber: string
  orderTotal: number
  orderItems: Array<{
    name: string
    quantity: number
    price: number
  }>
  paymentMethod: string
  paymentId?: string
  trackingNumber?: string
  carrier?: string
  estimatedDelivery?: string
  shippingAddress?: any
}

interface EmailTemplate {
  subject: string
  body: (data: NotificationData) => string
}

interface SmsTemplate {
  body: (data: NotificationData) => string
}

class EnhancedNotificationService {
  private emailTemplates: Record<string, EmailTemplate> = {
    order_confirmation: {
      subject: "Order Confirmed - SS Balaramapuram Handlooms",
      body: (data) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4f46e5;">SS Balaramapuram Handlooms</h1>
            <p style="font-size: 18px; color: #333;">Thank you for your order!</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h2 style="color: #333;">Order Details</h2>
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
            ${data.paymentId ? `<p><strong>Payment ID:</strong> ${data.paymentId}</p>` : ""}
          </div>
          
          <div style="margin-bottom: 20px;">
            <h2 style="color: #333;">Order Summary</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e0e0e0;">Product</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 1px solid #e0e0e0;">Quantity</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 1px solid #e0e0e0;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${data.orderItems
                  .map(
                    (item) => `
                  <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">${item.name}</td>
                    <td style="padding: 10px; text-align: center; border-bottom: 1px solid #e0e0e0;">${item.quantity}</td>
                    <td style="padding: 10px; text-align: right; border-bottom: 1px solid #e0e0e0;">₹${item.price.toLocaleString()}</td>
                  </tr>
                `,
                  )
                  .join("")}
                <tr>
                  <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
                  <td style="padding: 10px; text-align: right; font-weight: bold;">₹${data.orderTotal.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
            <p>Thank you for shopping with SS Balaramapuram Handlooms!</p>
            <p>Track your order at: <a href="https://ssbalaramapuram.com/track">ssbalaramapuram.com/track</a></p>
          </div>
        </div>
      `,
    },
    payment_success: {
      subject: "Payment Successful - SS Balaramapuram Handlooms",
      body: (data) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4f46e5;">SS Balaramapuram Handlooms</h1>
            <p style="font-size: 18px; color: #333;">Payment Successful!</p>
          </div>
          
          <div style="margin-bottom: 20px; text-align: center;">
            <div style="background-color: #ecfdf5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <p style="color: #047857; font-size: 18px; margin: 0;">₹${data.orderTotal.toLocaleString()}</p>
              <p style="color: #047857; margin: 5px 0 0 0;">Payment received successfully</p>
            </div>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h2 style="color: #333;">Payment Details</h2>
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Payment Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
            ${data.paymentId ? `<p><strong>Payment ID:</strong> ${data.paymentId}</p>` : ""}
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
            <p>Your order is now being processed and will be shipped soon!</p>
          </div>
        </div>
      `,
    },
    order_shipped: {
      subject: "Your Order Has Been Shipped - SS Balaramapuram Handlooms",
      body: (data) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4f46e5;">SS Balaramapuram Handlooms</h1>
            <p style="font-size: 18px; color: #333;">Your Order Has Been Shipped!</p>
          </div>
          
          <div style="margin-bottom: 20px; text-align: center;">
            <div style="background-color: #eff6ff; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <p style="color: #1e40af; font-size: 18px; margin: 0;">Your package is on its way</p>
              <p style="color: #1e40af; margin: 5px 0 0 0;">Estimated delivery: ${
                data.estimatedDelivery
                  ? new Date(data.estimatedDelivery).toLocaleDateString()
                  : "Within 5-7 business days"
              }</p>
            </div>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h2 style="color: #333;">Shipping Details</h2>
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Tracking Number:</strong> ${data.trackingNumber || "Will be updated soon"}</p>
            <p><strong>Carrier:</strong> ${data.carrier || "Standard Shipping"}</p>
            ${
              data.trackingNumber
                ? `<p><a href="/track?number=${data.trackingNumber}" style="color: #4f46e5; text-decoration: none;">Track Your Package</a></p>`
                : ""
            }
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
            <p>Thank you for shopping with SS Balaramapuram Handlooms!</p>
          </div>
        </div>
      `,
    },
    order_delivered: {
      subject: "Your Order Has Been Delivered - SS Balaramapuram Handlooms",
      body: (data) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4f46e5;">SS Balaramapuram Handlooms</h1>
            <p style="font-size: 18px; color: #333;">Your Order Has Been Delivered!</p>
          </div>
          
          <div style="margin-bottom: 20px; text-align: center;">
            <div style="background-color: #ecfdf5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <p style="color: #047857; font-size: 18px; margin: 0;">Delivery Confirmed</p>
              <p style="color: #047857; margin: 5px 0 0 0;">We hope you love your purchase!</p>
            </div>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h2 style="color: #333;">Order Details</h2>
            <p><strong>Order Number:</strong> ${data.orderNumber}</p>
            <p><strong>Delivery Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div style="margin-bottom: 20px; text-align: center;">
            <a href="/review" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Leave a Review</a>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
            <p>Thank you for shopping with SS Balaramapuram Handlooms!</p>
          </div>
        </div>
      `,
    },
  }

  private smsTemplates: Record<string, SmsTemplate> = {
    order_confirmation: {
      body: (data) =>
        `SS Balaramapuram: Thank you for your order #${data.orderNumber}! Total: ₹${data.orderTotal}. Track your order at ssbalaramapuram.com/track`,
    },
    payment_success: {
      body: (data) =>
        `SS Balaramapuram: Payment of ₹${data.orderTotal} received for order #${data.orderNumber}. Your order is being processed!`,
    },
    order_shipped: {
      body: (data) =>
        `SS Balaramapuram: Your order #${data.orderNumber} has been shipped! ${
          data.trackingNumber ? `Track: ${data.trackingNumber}` : ""
        } Est. delivery: ${
          data.estimatedDelivery ? new Date(data.estimatedDelivery).toLocaleDateString() : "5-7 days"
        }`,
    },
    order_delivered: {
      body: (data) =>
        `SS Balaramapuram: Your order #${data.orderNumber} has been delivered! We hope you love your purchase. Leave a review at ssbalaramapuram.com/review`,
    },
  }

  async sendNotification(
    type: string,
    data: NotificationData,
    channels: Array<"email" | "sms"> = ["email"],
  ): Promise<boolean> {
    try {
      const promises: Promise<boolean>[] = []

      if (channels.includes("email") && data.customerEmail) {
        promises.push(this.sendEmail(type, data))
      }

      if (channels.includes("sms") && data.customerPhone) {
        promises.push(this.sendSms(type, data))
      }

      const results = await Promise.all(promises)
      return results.some((result) => result)
    } catch (error) {
      console.error("Failed to send notification:", error)
      return false
    }
  }

  async sendEmail(type: string, data: NotificationData): Promise<boolean> {
    try {
      const template = this.emailTemplates[type]
      if (!template) {
        console.error(`Email template not found for type: ${type}`)
        return false
      }

      // In a real implementation, this would use an email service like SendGrid, Mailgun, etc.
      // For now, we'll simulate the email sending
      console.log(`Sending ${type} email to ${data.customerEmail}:`)
      console.log(`Subject: ${template.subject}`)
      console.log(`Body: ${template.body(data).substring(0, 100)}...`)

      // Simulate API call to email service
      const emailPayload = {
        to: data.customerEmail,
        subject: template.subject,
        html: template.body(data),
        from: "noreply@ssbalaramapuram.com",
      }

      // Here you would make an actual API call to your email service
      // Example with SendGrid:
      // const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(emailPayload)
      // })

      return true
    } catch (error) {
      console.error("Failed to send email:", error)
      return false
    }
  }

  async sendSms(type: string, data: NotificationData): Promise<boolean> {
    try {
      const template = this.smsTemplates[type]
      if (!template) {
        console.error(`SMS template not found for type: ${type}`)
        return false
      }

      const message = template.body(data)

      // In a real implementation, this would use an SMS service like Twilio, MessageBird, etc.
      console.log(`Sending ${type} SMS to ${data.customerPhone}:`)
      console.log(`Message: ${message}`)

      // Simulate API call to SMS service
      const smsPayload = {
        to: data.customerPhone,
        message: message,
        from: "SSBALA",
      }

      // Here you would make an actual API call to your SMS service
      // Example with Twilio:
      // const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      //     'Content-Type': 'application/x-www-form-urlencoded'
      //   },
      //   body: new URLSearchParams(smsPayload)
      // })

      return true
    } catch (error) {
      console.error("Failed to send SMS:", error)
      return false
    }
  }

  async testNotification(type: string, email?: string): Promise<boolean> {
    try {
      const testData: NotificationData = {
        customerName: "Test Customer",
        customerEmail: email || "test@example.com",
        customerPhone: "+919876543210",
        orderNumber: "TEST-123456",
        orderTotal: 4500,
        orderItems: [
          {
            name: "Traditional Kasavu Saree",
            quantity: 1,
            price: 2500,
          },
          {
            name: "Handwoven Cotton Fabric",
            quantity: 2,
            price: 1000,
          },
        ],
        paymentMethod: "Prepaid (Razorpay)",
        paymentId: "pay_TEST12345",
        trackingNumber: "TRACK123456789",
        carrier: "Delhivery",
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        shippingAddress: {
          name: "Test Customer",
          street: "123 Test Street",
          city: "Thiruvananthapuram",
          state: "Kerala",
          pincode: "695001",
          phone: "+919876543210",
        },
      }

      return await this.sendNotification(type, testData, ["email", "sms"])
    } catch (error) {
      console.error("Failed to test notification:", error)
      return false
    }
  }
}

export const enhancedNotificationService = new EnhancedNotificationService()
