interface SmsConfig {
  provider: "twilio" | "textlocal" | "msg91" | "fast2sms"
  apiKey: string
  senderId?: string
  username?: string
  password?: string
}

interface SmsMessage {
  to: string
  message: string
  templateId?: string
}

class SmsService {
  private config: SmsConfig | null = null

  configure(config: SmsConfig) {
    this.config = config
    localStorage.setItem("sms_config", JSON.stringify(config))
  }

  loadConfig() {
    const saved = localStorage.getItem("sms_config")
    if (saved) {
      this.config = JSON.parse(saved)
    }
  }

  async sendSms(message: SmsMessage): Promise<boolean> {
    if (!this.config) {
      console.error("SMS service not configured")
      return false
    }

    try {
      switch (this.config.provider) {
        case "twilio":
          return await this.sendViaTwilio(message)
        case "textlocal":
          return await this.sendViaTextLocal(message)
        case "msg91":
          return await this.sendViaMsg91(message)
        case "fast2sms":
          return await this.sendViaFast2Sms(message)
        default:
          console.error("Unsupported SMS provider")
          return false
      }
    } catch (error) {
      console.error("SMS sending failed:", error)
      return false
    }
  }

  private async sendViaTwilio(message: SmsMessage): Promise<boolean> {
    // Twilio implementation
    const accountSid = this.config?.username
    const authToken = this.config?.apiKey

    if (!accountSid || !authToken) {
      console.error("Twilio credentials missing")
      return false
    }

    try {
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: message.to,
          From: this.config?.senderId || "+1234567890",
          Body: message.message,
        }),
      })

      return response.ok
    } catch (error) {
      console.error("Twilio SMS error:", error)
      return false
    }
  }

  private async sendViaTextLocal(message: SmsMessage): Promise<boolean> {
    // TextLocal implementation (UK SMS service)
    try {
      const response = await fetch("https://api.textlocal.in/send/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          apikey: this.config?.apiKey || "",
          numbers: message.to,
          message: message.message,
          sender: this.config?.senderId || "SSBALA",
        }),
      })

      const data = await response.json()
      return data.status === "success"
    } catch (error) {
      console.error("TextLocal SMS error:", error)
      return false
    }
  }

  private async sendViaMsg91(message: SmsMessage): Promise<boolean> {
    // MSG91 implementation (Indian SMS service)
    try {
      const response = await fetch("https://api.msg91.com/api/sendhttp.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          authkey: this.config?.apiKey || "",
          mobiles: message.to,
          message: message.message,
          sender: this.config?.senderId || "SSBALA",
          route: "4",
        }),
      })

      return response.ok
    } catch (error) {
      console.error("MSG91 SMS error:", error)
      return false
    }
  }

  private async sendViaFast2Sms(message: SmsMessage): Promise<boolean> {
    // Fast2SMS implementation (Indian SMS service)
    try {
      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: this.config?.apiKey || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "v3",
          sender_id: this.config?.senderId || "SSBALA",
          message: message.message,
          language: "english",
          flash: 0,
          numbers: message.to,
        }),
      })

      const data = await response.json()
      return data.return === true
    } catch (error) {
      console.error("Fast2SMS error:", error)
      return false
    }
  }

  // Test SMS functionality
  async testSms(phoneNumber: string): Promise<boolean> {
    const testMessage = {
      to: phoneNumber,
      message: "Test SMS from SS Balaramapuram Handlooms. Your SMS service is working correctly!",
    }

    return await this.sendSms(testMessage)
  }
}

export const smsService = new SmsService()

// Initialize on load
if (typeof window !== "undefined") {
  smsService.loadConfig()
}
