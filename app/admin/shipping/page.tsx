"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, MoreHorizontal, Truck, Package, Download, Eye, Printer, ExternalLink, RefreshCw } from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"
import { courierAPI } from "@/lib/courier-api"
import { LoadingSpinner } from "@/components/loading-spinner"
import { DelhiveryConfig } from "@/components/delhivery-config"

export default function AdminShippingPage() {
  const { state, createShipment, updateShipment } = useApp()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isTrackingDialogOpen, setIsTrackingDialogOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState("")
  const [selectedCarrier, setSelectedCarrier] = useState("")
  const [manualTracking, setManualTracking] = useState("")
  const [needsManualTracking, setNeedsManualTracking] = useState(false)
  const [isCreatingShipment, setIsCreatingShipment] = useState(false)
  const [trackingInfo, setTrackingInfo] = useState<any>(null)
  const [isLoadingTracking, setIsLoadingTracking] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("shipments")
  const [courierCredentials, setCourierCredentials] = useState({
    delhivery: { apiKey: localStorage.getItem("delhivery_api_key") || "" },
    bluedart: { apiKey: localStorage.getItem("bluedart_api_key") || "" },
    dtdc: { apiKey: localStorage.getItem("dtdc_api_key") || "" },
    indiapost: { apiKey: localStorage.getItem("indiapost_api_key") || "" },
  })

  // Get orders that can be shipped (processing status and no existing shipment)
  const shippableOrders = state.orders.filter(
    (order) => order.status === "processing" && !state.shipments.some((shipment) => shipment.order_id === order.id),
  )

  const filteredShipments = state.shipments.filter(
    (shipment) =>
      shipment.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.carrier.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in_transit":
        return "bg-blue-100 text-blue-800"
      case "out_for_delivery":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "failed":
      case "exception":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleCarrierChange = (carrier: string) => {
    setSelectedCarrier(carrier)
    setNeedsManualTracking(!courierCredentials[carrier as keyof typeof courierCredentials]?.apiKey)
    if (carrier !== "indiapost") {
      setManualTracking("")
    }
  }

  const handleCreateShipment = async () => {
    if (!selectedOrderId || !selectedCarrier) {
      toast({
        title: "Missing Information",
        description: "Please select an order and carrier.",
        variant: "destructive",
      })
      return
    }

    if (needsManualTracking && !manualTracking) {
      toast({
        title: "Missing Tracking ID",
        description: "Please enter the tracking ID for this carrier.",
        variant: "destructive",
      })
      return
    }

    setIsCreatingShipment(true)
    try {
      let trackingNumber = manualTracking

      // If we have API credentials and don't need manual tracking, create shipment via API
      if (!needsManualTracking) {
        const order = state.orders.find((o) => o.id === selectedOrderId)
        if (order) {
          const shipmentDetails = {
            orderId: order.id,
            customerName: order.customer_name,
            customerPhone: order.shipping_address?.phone || "",
            customerEmail: order.customer_email,
            pickupAddress: {
              name: "SS Balaramapuram Handlooms",
              address: "Main Street",
              city: "Balaramapuram",
              state: "Kerala",
              pincode: "695501",
              phone: "+919876543210",
            },
            deliveryAddress: {
              name: order.shipping_address?.name || order.customer_name,
              address: order.shipping_address?.address || "",
              city: order.shipping_address?.city || "",
              state: order.shipping_address?.state || "",
              pincode: order.shipping_address?.pincode || "",
              phone: order.shipping_address?.phone || "",
            },
            packageDetails: {
              weight: 1, // Default weight in kg
              items: order.items.map((item) => ({
                name: item.product_name,
                quantity: item.quantity,
                price: item.price,
              })),
            },
            paymentMode: order.payment_method === "cod" ? "cod" : "prepaid",
            codAmount: order.payment_method === "cod" ? order.total : 0,
          }

          try {
            // Try to create shipment via API
            trackingNumber = await courierAPI.createShipment(selectedCarrier, shipmentDetails)
          } catch (error) {
            console.error("Failed to create shipment via API:", error)
            toast({
              title: "API Error",
              description: "Failed to create shipment via API. Please enter tracking ID manually.",
              variant: "destructive",
            })
            setNeedsManualTracking(true)
            setIsCreatingShipment(false)
            return
          }
        }
      }

      // Create the shipment in our system
      createShipment(selectedOrderId, selectedCarrier, trackingNumber)

      toast({
        title: "Shipment Created",
        description: "Shipment created successfully with tracking ID: " + trackingNumber,
      })

      setIsCreateDialogOpen(false)
      setSelectedOrderId("")
      setSelectedCarrier("")
      setManualTracking("")
      setNeedsManualTracking(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create shipment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingShipment(false)
    }
  }

  const handleUpdateStatus = (shipmentId: string, newStatus: string) => {
    updateShipment(shipmentId, { status: newStatus as any })
    toast({
      title: "Status Updated",
      description: `Shipment status updated to ${newStatus.replace("_", " ")}.`,
    })
  }

  const handleTrackShipment = async (shipment: any) => {
    setSelectedShipment(shipment)
    setIsLoadingTracking(true)
    setTrackingInfo(null)
    setIsTrackingDialogOpen(true)

    try {
      // Try to get tracking info from courier API
      const trackingData = await courierAPI.trackShipment(shipment.carrier, shipment.tracking_number)
      setTrackingInfo(trackingData)

      // Update shipment status in our system if it's different
      if (trackingData.status !== shipment.status) {
        updateShipment(shipment.id, { status: trackingData.status as any })
      }
    } catch (error) {
      console.error("Failed to track shipment:", error)
      // Fallback to our stored data
      setTrackingInfo({
        trackingId: shipment.tracking_number,
        courierName: shipment.carrier,
        status: shipment.status,
        statusDate: new Date().toISOString(),
        estimatedDelivery: shipment.estimated_delivery,
        trackingUrl: courierAPI.getTrackingUrl(shipment.carrier, shipment.tracking_number),
      })
    } finally {
      setIsLoadingTracking(false)
    }
  }

  const handlePrintLabel = (shipment: any) => {
    // Simulate printing label
    const printContent = `
      SHIPPING LABEL
      
      Order: ${shipment.order_id}
      Tracking: ${shipment.tracking_number}
      Carrier: ${shipment.carrier}
      
      From: SS Balaramapuram Handlooms
      Balaramapuram, Kerala, India
      
      To: Customer Address
      (Address would be fetched from order)
      
      Status: ${shipment.status}
      Shipped: ${shipment.shipped_date ? new Date(shipment.shipped_date).toLocaleDateString() : "N/A"}
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`<pre>${printContent}</pre>`)
      printWindow.document.close()
      printWindow.print()
    }

    toast({
      title: "Label Printed",
      description: "Shipping label has been sent to printer.",
    })
  }

  const handleSaveCredentials = () => {
    // Save credentials to localStorage
    Object.entries(courierCredentials).forEach(([courier, creds]) => {
      if (creds.apiKey) {
        localStorage.setItem(`${courier}_api_key`, creds.apiKey)
        courierAPI.setCredentials(courier, creds)
      }
    })

    toast({
      title: "Credentials Saved",
      description: "Courier API credentials have been saved.",
    })
  }

  // Initialize courier API with saved credentials on mount
  useEffect(() => {
    Object.entries(courierCredentials).forEach(([courier, creds]) => {
      if (creds.apiKey) {
        courierAPI.setCredentials(courier as any, creds)
      }
    })
  }, [])

  const shipmentStats = {
    total: state.shipments.length,
    pending: state.shipments.filter((s) => s.status === "pending").length,
    inTransit: state.shipments.filter((s) => s.status === "in_transit").length,
    delivered: state.shipments.filter((s) => s.status === "delivered").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Shipping</h1>
          <p className="text-muted-foreground">Manage shipments and tracking</p>
        </div>
        <Button
          className="bg-yellow-500 hover:bg-yellow-600"
          onClick={() => setIsCreateDialogOpen(true)}
          disabled={shippableOrders.length === 0}
        >
          <Package className="w-4 h-4 mr-2" />
          Create Shipment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Shipments", value: shipmentStats.total.toString(), color: "text-blue-600" },
          { label: "Pending", value: shipmentStats.pending.toString(), color: "text-yellow-600" },
          { label: "In Transit", value: shipmentStats.inTransit.toString(), color: "text-orange-600" },
          { label: "Delivered", value: shipmentStats.delivered.toString(), color: "text-green-600" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="shipments" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="shipments">Shipments</TabsTrigger>
          <TabsTrigger value="settings">Courier Settings</TabsTrigger>
          <TabsTrigger value="config">API Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="shipments" className="space-y-4 mt-4">
          {/* Search */}
          <Card>
            <CardContent className="p-4 md:p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search shipments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Shipments Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Shipments ({filteredShipments.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {filteredShipments.length === 0 ? (
                <div className="p-8 text-center">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No shipments found</p>
                  {shippableOrders.length > 0 && (
                    <Button
                      className="mt-4 bg-yellow-500 hover:bg-yellow-600"
                      onClick={() => setIsCreateDialogOpen(true)}
                    >
                      Create First Shipment
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="p-4 font-medium">Order ID</th>
                        <th className="p-4 font-medium hidden sm:table-cell">Tracking</th>
                        <th className="p-4 font-medium hidden md:table-cell">Carrier</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium hidden lg:table-cell">Shipped Date</th>
                        <th className="p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredShipments.map((shipment) => {
                        const order = state.orders.find((o) => o.id === shipment.order_id)
                        return (
                          <tr key={shipment.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <div className="font-medium">{shipment.order_id}</div>
                              <div className="text-sm text-gray-600">{order?.customer_name || "Unknown Customer"}</div>
                            </td>
                            <td className="p-4 hidden sm:table-cell">
                              <div className="font-mono text-sm">{shipment.tracking_number}</div>
                              <div className="text-sm text-gray-600">
                                ETA:{" "}
                                {shipment.estimated_delivery
                                  ? new Date(shipment.estimated_delivery).toLocaleDateString()
                                  : "N/A"}
                              </div>
                            </td>
                            <td className="p-4 hidden md:table-cell">
                              <Badge variant="outline">{shipment.carrier}</Badge>
                            </td>
                            <td className="p-4">
                              <Badge className={getStatusColor(shipment.status)}>
                                {shipment.status.replace("_", " ")}
                              </Badge>
                            </td>
                            <td className="p-4 hidden lg:table-cell text-sm text-gray-600">
                              {shipment.shipped_date ? new Date(shipment.shipped_date).toLocaleDateString() : "N/A"}
                            </td>
                            <td className="p-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleTrackShipment(shipment)}>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Track Package
                                  </DropdownMenuItem>
                                  {shipment.status === "pending" && (
                                    <DropdownMenuItem onClick={() => handleUpdateStatus(shipment.id, "in_transit")}>
                                      <Truck className="w-4 h-4 mr-2" />
                                      Mark In Transit
                                    </DropdownMenuItem>
                                  )}
                                  {shipment.status === "in_transit" && (
                                    <DropdownMenuItem
                                      onClick={() => handleUpdateStatus(shipment.id, "out_for_delivery")}
                                    >
                                      <Truck className="w-4 h-4 mr-2" />
                                      Mark Out for Delivery
                                    </DropdownMenuItem>
                                  )}
                                  {(shipment.status === "in_transit" || shipment.status === "out_for_delivery") && (
                                    <DropdownMenuItem onClick={() => handleUpdateStatus(shipment.id, "delivered")}>
                                      <Package className="w-4 h-4 mr-2" />
                                      Mark Delivered
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => handlePrintLabel(shipment)}>
                                    <Printer className="w-4 h-4 mr-2" />
                                    Print Label
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Invoice
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <a
                                      href={courierAPI.getTrackingUrl(shipment.carrier, shipment.tracking_number)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center px-2 py-1.5 text-sm"
                                    >
                                      <ExternalLink className="w-4 h-4 mr-2" />
                                      Track on Carrier Site
                                    </a>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Courier API Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-gray-600">
                Configure your courier API credentials to automatically create shipments and track packages.
              </p>

              {Object.entries(courierCredentials).map(([courier, creds]) => (
                <div key={courier} className="space-y-2">
                  <Label htmlFor={`${courier}-api-key`} className="capitalize">
                    {courier} API Key
                  </Label>
                  <Input
                    id={`${courier}-api-key`}
                    type="password"
                    value={creds.apiKey}
                    onChange={(e) =>
                      setCourierCredentials({
                        ...courierCredentials,
                        [courier]: { ...creds, apiKey: e.target.value },
                      })
                    }
                    placeholder={`Enter ${courier} API key`}
                  />
                </div>
              ))}

              <Button onClick={handleSaveCredentials} className="bg-yellow-500 hover:bg-yellow-600">
                Save Credentials
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="config" className="space-y-4 mt-4">
          <DelhiveryConfig />
        </TabsContent>
      </Tabs>

      {/* Create Shipment Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Shipment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="order">Select Order</Label>
              <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an order to ship" />
                </SelectTrigger>
                <SelectContent>
                  {shippableOrders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.id} - {order.customer_name} (₹{order.total})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {shippableOrders.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  No orders available for shipping. Orders must be in "processing" status.
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="carrier">Shipping Carrier</Label>
              <Select value={selectedCarrier} onValueChange={(value) => handleCarrierChange(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select shipping carrier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delhivery">Delhivery</SelectItem>
                  <SelectItem value="bluedart">Blue Dart</SelectItem>
                  <SelectItem value="dtdc">DTDC</SelectItem>
                  <SelectItem value="indiapost">India Post</SelectItem>
                  <SelectItem value="fedex">FedEx</SelectItem>
                </SelectContent>
              </Select>
              {selectedCarrier && !courierCredentials[selectedCarrier as keyof typeof courierCredentials]?.apiKey && (
                <p className="text-sm text-yellow-600 mt-1">
                  No API key configured for this carrier. You'll need to enter tracking ID manually.
                </p>
              )}
            </div>

            {needsManualTracking && (
              <div>
                <Label htmlFor="tracking">Tracking ID *</Label>
                <Input
                  id="tracking"
                  value={manualTracking}
                  onChange={(e) => setManualTracking(e.target.value)}
                  placeholder="Enter tracking number"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Please enter the tracking ID provided by the carrier</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateShipment}
                className="bg-yellow-500 hover:bg-yellow-600"
                disabled={
                  !selectedOrderId || !selectedCarrier || isCreatingShipment || (needsManualTracking && !manualTracking)
                }
              >
                {isCreatingShipment ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Shipment"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tracking Dialog */}
      <Dialog open={isTrackingDialogOpen} onOpenChange={setIsTrackingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tracking Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {isLoadingTracking ? (
              <div className="flex flex-col items-center justify-center py-8">
                <LoadingSpinner size="lg" className="mb-4" />
                <p>Loading tracking information...</p>
              </div>
            ) : trackingInfo ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Tracking Number</p>
                    <p className="font-mono font-medium">{trackingInfo.trackingId}</p>
                  </div>
                  <Badge className={getStatusColor(trackingInfo.status)}>{trackingInfo.status.replace("_", " ")}</Badge>
                </div>

                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Carrier</p>
                    <p className="font-medium capitalize">{trackingInfo.courierName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Estimated Delivery</p>
                    <p className="font-medium">
                      {trackingInfo.estimatedDelivery
                        ? new Date(trackingInfo.estimatedDelivery).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="font-medium mb-2">Tracking History</p>
                  {trackingInfo.checkpoints ? (
                    <div className="space-y-3">
                      {trackingInfo.checkpoints.map((checkpoint: any, index: number) => (
                        <div key={index} className="flex gap-3">
                          <div className="relative">
                            <div
                              className={`w-3 h-3 rounded-full mt-1.5 ${index === 0 ? "bg-green-500" : "bg-gray-300"}`}
                            ></div>
                            {index < trackingInfo.checkpoints.length - 1 && (
                              <div className="absolute top-3 bottom-0 left-1.5 w-0.5 -ml-px bg-gray-200"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{checkpoint.status.replace("_", " ")}</p>
                            <p className="text-sm">{checkpoint.location}</p>
                            <p className="text-xs text-gray-500">{new Date(checkpoint.date).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No tracking history available</p>
                  )}
                </div>

                <div className="flex justify-between pt-2">
                  <Button variant="outline" size="sm" onClick={() => handleTrackShipment(selectedShipment)}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>

                  <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600" asChild>
                    <a href={trackingInfo.trackingUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Track on Carrier Site
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-center py-4">No tracking information available</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
