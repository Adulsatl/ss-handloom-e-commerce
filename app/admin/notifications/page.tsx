"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useApp } from "@/contexts/app-context"
import { Bell, Mail, MessageSquare, CheckCircle, XCircle } from "lucide-react"

export default function AdminNotificationsPage() {
  const { toast } = useToast()
  const { state, toggleNotifications, testNotification } = useApp()
  const [testEmail, setTestEmail] = useState("")
  const [loading, setLoading] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Array<{ type: string; success: boolean; message: string }>>([])

  const handleToggleNotifications = () => {
    toggleNotifications(!state.notificationsEnabled)
    toast({
      title: state.notificationsEnabled ? "Notifications Disabled" : "Notifications Enabled",
      description: state.notificationsEnabled
        ? "All notifications have been disabled"
        : "All notifications have been enabled",
    })
  }

  const handleTestNotification = async (type: string) => {
    setLoading(type)
    try {
      const result = await testNotification(type, testEmail || undefined)
      setTestResults((prev) => [
        {
          type,
          success: result,
          message: result
            ? `Successfully sent ${type} notification to ${testEmail || "test@example.com"}`
            : `Failed to send ${type} notification`,
        },
        ...prev.slice(0, 9), // Keep only last 10 results
      ])
      toast({
        title: result ? "Test Notification Sent" : "Test Failed",
        description: result
          ? `${type} notification sent to ${testEmail || "test@example.com"}`
          : "Failed to send test notification",
        variant: result ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Error sending test notification:", error)
      setTestResults((prev) => [
        {
          type,
          success: false,
          message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
        ...prev.slice(0, 9),
      ])
      toast({
        title: "Error",
        description: "Failed to send test notification",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleTestAllNotifications = async () => {
    setLoading("all")
    try {
      const notificationTypes = ["order_confirmation", "payment_success", "order_shipped", "order_delivered"]
      const results = await Promise.all(
        notificationTypes.map(async (type) => {
          const result = await testNotification(type, testEmail || undefined)
          return { type, success: result }
        }),
      )

      const successCount = results.filter((r) => r.success).length
      setTestResults((prev) => [
        {
          type: "all",
          success: successCount === notificationTypes.length,
          message: `Sent ${successCount}/${notificationTypes.length} test notifications to ${
            testEmail || "test@example.com"
          }`,
        },
        ...prev.slice(0, 9),
      ])

      toast({
        title: successCount === notificationTypes.length ? "All Tests Successful" : "Some Tests Failed",
        description: `Successfully sent ${successCount}/${notificationTypes.length} test notifications`,
        variant: successCount === notificationTypes.length ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Error sending test notifications:", error)
      setTestResults((prev) => [
        {
          type: "all",
          success: false,
          message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
        ...prev.slice(0, 9),
      ])
      toast({
        title: "Error",
        description: "Failed to send test notifications",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">Manage customer notifications and communication</p>
      </div>

      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="test">Test</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how and when notifications are sent to customers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Enable All Notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Turn on/off all email and SMS notifications system-wide
                  </p>
                </div>
                <Switch checked={state.notificationsEnabled} onCheckedChange={handleToggleNotifications} />
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-4">Notification Channels</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <div>
                        <p>Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Send order updates via email</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      <div>
                        <p>SMS Notifications</p>
                        <p className="text-sm text-muted-foreground">Send order updates via SMS</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-600">Active</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-4">Notification Events</h3>
                <div className="space-y-4">
                  {[
                    {
                      name: "Order Confirmation",
                      description: "Send when a new order is placed",
                      checked: state.notificationsEnabled,
                    },
                    {
                      name: "Payment Success",
                      description: "Send when payment is successfully processed",
                      checked: state.notificationsEnabled,
                    },
                    {
                      name: "Order Shipped",
                      description: "Send when an order is shipped",
                      checked: state.notificationsEnabled,
                    },
                    {
                      name: "Order Delivered",
                      description: "Send when an order is delivered",
                      checked: state.notificationsEnabled,
                    },
                  ].map((event) => (
                    <div key={event.name} className="flex items-center justify-between">
                      <div>
                        <p>{event.name}</p>
                        <p className="text-sm text-muted-foreground">{event.description}</p>
                      </div>
                      <Switch checked={event.checked} disabled />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Manage email notification templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  name: "Order Confirmation",
                  description: "Sent when a customer places a new order",
                  subject: "Your Order Confirmation - SS Balaramapuram Handlooms",
                },
                {
                  name: "Payment Success",
                  description: "Sent when payment is successfully processed",
                  subject: "Payment Successful - SS Balaramapuram Handlooms",
                },
                {
                  name: "Order Shipped",
                  description: "Sent when an order is shipped",
                  subject: "Your Order Has Been Shipped - SS Balaramapuram Handlooms",
                },
                {
                  name: "Order Delivered",
                  description: "Sent when an order is delivered",
                  subject: "Your Order Has Been Delivered - SS Balaramapuram Handlooms",
                },
              ].map((template) => (
                <div key={template.name} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{template.name}</h3>
                    <Button variant="outline" size="sm" disabled>
                      Edit
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                  <div className="text-sm">
                    <span className="font-medium">Subject:</span> {template.subject}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SMS Templates</CardTitle>
              <CardDescription>Manage SMS notification templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  name: "Order Confirmation",
                  description: "Sent when a customer places a new order",
                  preview: "SS Balaramapuram: Thank you for your order #ORD-123! Total: ₹2500. Track your order at...",
                },
                {
                  name: "Payment Success",
                  description: "Sent when payment is successfully processed",
                  preview: "SS Balaramapuram: Payment of ₹2500 received for order #ORD-123. Thank you for your...",
                },
                {
                  name: "Order Shipped",
                  description: "Sent when an order is shipped",
                  preview:
                    "SS Balaramapuram: Your order #ORD-123 has been shipped! Track: DL12345678. Est. delivery...",
                },
                {
                  name: "Order Delivered",
                  description: "Sent when an order is delivered",
                  preview:
                    "SS Balaramapuram: Your order #ORD-123 has been delivered! We hope you love your purchase...",
                },
              ].map((template) => (
                <div key={template.name} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{template.name}</h3>
                    <Button variant="outline" size="sm" disabled>
                      Edit
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                  <div className="text-sm bg-gray-50 p-2 rounded">
                    <span className="font-medium">Preview:</span> {template.preview}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Notifications</CardTitle>
                <CardDescription>Send test notifications to verify your setup</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-email">Test Email Address</Label>
                  <Input
                    id="test-email"
                    type="email"
                    placeholder="Enter email address for test"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave blank to use default test email (test@example.com)
                  </p>
                </div>

                <div className="space-y-2">
                  <Button onClick={handleTestAllNotifications} disabled={loading !== null} className="w-full">
                    {loading === "all" ? (
                      <>
                        <LoadingSpinner className="mr-2" />
                        Testing All...
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4 mr-2" />
                        Test All Notifications
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <Button
                    onClick={() => handleTestNotification("order_confirmation")}
                    disabled={loading !== null}
                    variant="outline"
                    size="sm"
                  >
                    {loading === "order_confirmation" ? (
                      <LoadingSpinner className="mr-2" />
                    ) : (
                      <Bell className="w-4 h-4 mr-2" />
                    )}
                    Order Confirmation
                  </Button>
                  <Button
                    onClick={() => handleTestNotification("payment_success")}
                    disabled={loading !== null}
                    variant="outline"
                    size="sm"
                  >
                    {loading === "payment_success" ? (
                      <LoadingSpinner className="mr-2" />
                    ) : (
                      <Bell className="w-4 h-4 mr-2" />
                    )}
                    Payment Success
                  </Button>
                  <Button
                    onClick={() => handleTestNotification("order_shipped")}
                    disabled={loading !== null}
                    variant="outline"
                    size="sm"
                  >
                    {loading === "order_shipped" ? (
                      <LoadingSpinner className="mr-2" />
                    ) : (
                      <Bell className="w-4 h-4 mr-2" />
                    )}
                    Order Shipped
                  </Button>
                  <Button
                    onClick={() => handleTestNotification("order_delivered")}
                    disabled={loading !== null}
                    variant="outline"
                    size="sm"
                  >
                    {loading === "order_delivered" ? (
                      <LoadingSpinner className="mr-2" />
                    ) : (
                      <Bell className="w-4 h-4 mr-2" />
                    )}
                    Order Delivered
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
                <CardDescription>Real-time results of notification tests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {testResults.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No test results yet</p>
                      <p className="text-sm">Run a test to see results here</p>
                    </div>
                  ) : (
                    testResults.map((result, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                        {result.success ? (
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium capitalize">{result.type.replace("_", " ")}</p>
                          <p className="text-xs text-muted-foreground break-words">{result.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {testResults.length > 0 && (
                  <Button variant="outline" size="sm" onClick={() => setTestResults([])} className="w-full mt-4">
                    Clear Results
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
