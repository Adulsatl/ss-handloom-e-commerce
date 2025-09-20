"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Save, Upload } from "lucide-react"

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const [settings, setSettings] = useState({
    siteName: "SS Balaramapuram Handlooms",
    siteDescription: "Authentic traditional handloom products from Balaramapuram",
    contactEmail: "info@ssbalaramapuram.com",
    contactPhone: "+91 9876543210",
    address: "Balaramapuram, Thiruvananthapuram, Kerala, India - 695501",
    enableCOD: true,
    enablePrepaid: true,
    minOrderAmount: 500,
    freeShippingThreshold: 2000,
    taxRate: 0,
    emailNotifications: true,
    smsNotifications: false,
  })

  const handleInputChange = (field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Settings Saved",
        description: "Your settings have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your store settings</p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => handleInputChange("siteName", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="siteDescription">Site Description</Label>
            <Textarea
              id="siteDescription"
              value={settings.siteDescription}
              onChange={(e) => handleInputChange("siteDescription", e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                value={settings.contactPhone}
                onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={settings.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Cash on Delivery</Label>
              <p className="text-sm text-gray-600">Allow customers to pay on delivery</p>
            </div>
            <Switch
              checked={settings.enableCOD}
              onCheckedChange={(checked) => handleInputChange("enableCOD", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Prepaid Payments</Label>
              <p className="text-sm text-gray-600">Allow online payments via Razorpay</p>
            </div>
            <Switch
              checked={settings.enablePrepaid}
              onCheckedChange={(checked) => handleInputChange("enablePrepaid", checked)}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="minOrderAmount">Minimum Order Amount (₹)</Label>
              <Input
                id="minOrderAmount"
                type="number"
                value={settings.minOrderAmount}
                onChange={(e) => handleInputChange("minOrderAmount", Number.parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="freeShippingThreshold">Free Shipping Threshold (₹)</Label>
              <Input
                id="freeShippingThreshold"
                type="number"
                value={settings.freeShippingThreshold}
                onChange={(e) => handleInputChange("freeShippingThreshold", Number.parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                step="0.1"
                value={settings.taxRate}
                onChange={(e) => handleInputChange("taxRate", Number.parseFloat(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Email Notifications</Label>
              <p className="text-sm text-gray-600">Send order updates via email</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => handleInputChange("emailNotifications", checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label>SMS Notifications</Label>
              <p className="text-sm text-gray-600">Send order updates via SMS</p>
            </div>
            <Switch
              checked={settings.smsNotifications}
              onCheckedChange={(checked) => handleInputChange("smsNotifications", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Logo Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Site Logo</Label>
            <div className="mt-2 flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">SS</span>
              </div>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Upload New Logo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="bg-yellow-500 hover:bg-yellow-600">
          {isSaving ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Saving...
            </div>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
