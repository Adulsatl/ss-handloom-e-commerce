"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useApp } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"
import { Search, Package, Truck, MapPin, Clock, CheckCircle, ExternalLink } from "lucide-react"

export default function TrackingPage() {
  const { getTrackingInfo } = useApp()
  const { toast } = useToast()
  const [trackingNumber, setTrackingNumber] = useState("")
  const [trackingData, setTrackingData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleTrack = async () => {
    if (!trackingNumber.trim()) {
      toast({
        title: "Missing Tracking Number",
        description: "Please enter a tracking number to search.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Try to find the carrier based on tracking number format
      let carrier = "unknown"
      if (trackingNumber.startsWith("DL")) carrier = "delhivery"
      else if (trackingNumber.startsWith("BD")) carrier = "bluedart"
      else if (trackingNumber.startsWith("DT")) carrier = "dtdc"
      else if (trackingNumber.startsWith("IP")) carrier = "indiapost"

      const data = await getTrackingInfo(trackingNumber, carrier)
      setTrackingData(data)
    } catch (error) {
      toast({
        title: "Tracking Not Found",
        description: "No tracking information found for this number. Please check and try again.",
        variant: "destructive",
      })
      setTrackingData(null)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />
      case "in_transit":
        return <Truck className="w-4 h-4 text-blue-600" />
      case "out_for_delivery":
        return <MapPin className="w-4 h-4 text-orange-600" />
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      default:
        return <Package className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in_transit":
        return "bg-blue-100 text-blue-800"
      case "out_for_delivery":
        return "bg-orange-100 text-orange-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCarrierUrl = (carrier: string, trackingNumber: string) => {
    const urls: Record<string, string> = {
      delhivery: `https://www.delhivery.com/track/package/${trackingNumber}`,
      bluedart: `https://www.bluedart.com/web/guest/trackdartresult?trackFor=0&trackNo=${trackingNumber}`,
      dtdc: `https://www.dtdc.in/tracking/tracking_results.asp?Ttype=awb_no&strCnno=${trackingNumber}`,
      indiapost: `https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx?consignmentnumber=${trackingNumber}`,
    }
    return urls[carrier] || "#"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Track Your Package</h1>
            <p className="text-gray-600">Enter your tracking number to get real-time updates</p>
          </div>

          {/* Tracking Search */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="tracking-number" className="sr-only">
                    Tracking Number
                  </Label>
                  <Input
                    id="tracking-number"
                    placeholder="Enter tracking number (e.g., DL1234567890)"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleTrack()}
                    className="text-center sm:text-left"
                  />
                </div>
                <Button onClick={handleTrack} disabled={isLoading} className="bg-yellow-500 hover:bg-yellow-600">
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Tracking...
                    </div>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Track Package
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Results */}
          {trackingData && (
            <div className="space-y-6">
              {/* Package Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Package Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-gray-600">Tracking Number</Label>
                        <p className="font-mono font-medium">{trackingData.trackingNumber}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Carrier</Label>
                        <p className="font-medium capitalize">{trackingData.carrier}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Current Status</Label>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(trackingData.status)}
                          <Badge className={getStatusColor(trackingData.status)}>
                            {trackingData.status.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-gray-600">Estimated Delivery</Label>
                        <p className="font-medium">
                          {trackingData.estimatedDelivery
                            ? new Date(trackingData.estimatedDelivery).toLocaleDateString()
                            : "TBD"}
                        </p>
                      </div>
                      {trackingData.actualDelivery && (
                        <div>
                          <Label className="text-sm text-gray-600">Delivered On</Label>
                          <p className="font-medium text-green-600">
                            {new Date(trackingData.actualDelivery).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                      <div>
                        <Button asChild variant="outline" className="w-full">
                          <a
                            href={getCarrierUrl(trackingData.carrier, trackingData.trackingNumber)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Track on {trackingData.carrier} Website
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tracking Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Tracking Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trackingData.updates.map((update: any, index: number) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              update.status === trackingData.status ? "bg-blue-500" : "bg-green-500"
                            }`}
                          />
                          {index < trackingData.updates.length - 1 && <div className="w-px h-8 bg-gray-300 mt-2" />}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(update.status)}
                            <span className="font-medium capitalize">{update.status.replace("_", " ")}</span>
                            <span className="text-sm text-gray-500">{new Date(update.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-gray-600">{update.description}</p>
                          <p className="text-xs text-gray-500">{update.location}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Help Section */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Tracking Number Formats</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Delhivery: DL + 16 digits</li>
                    <li>• Blue Dart: BD + 16 digits</li>
                    <li>• DTDC: DT + 16 digits</li>
                    <li>• India Post: IP + 16 digits</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Contact Support</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    If you can't find your tracking information, please contact our support team.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <a href="/contact">Contact Support</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
