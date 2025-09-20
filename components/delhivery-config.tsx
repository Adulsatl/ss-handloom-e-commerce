"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { realCourierAPI } from "@/lib/courier-api-real"
import { LoadingSpinner } from "@/components/loading-spinner"
import { CheckCircle, XCircle, AlertCircle, Download, Calculator } from "lucide-react"

export function DelhiveryConfig() {
  const { toast } = useToast()
  const [config, setConfig] = useState({
    apiKey: localStorage.getItem("delhivery_api_key") || "",
    clientName: localStorage.getItem("delhivery_client_name") || "",
    isProduction: localStorage.getItem("delhivery_is_production") === "true",
  })
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")
  const [testResults, setTestResults] = useState<any>(null)
  const [shippingCalculator, setShippingCalculator] = useState({
    fromPincode: "695501",
    toPincode: "",
    weight: 1,
    paymentMode: "prepaid" as "prepaid" | "cod",
    codAmount: 0,
  })
  const [calculatedCost, setCalculatedCost] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const handleSaveConfig = () => {
    localStorage.setItem("delhivery_api_key", config.apiKey)
    localStorage.setItem("delhivery_client_name", config.clientName)
    localStorage.setItem("delhivery_is_production", config.isProduction.toString())

    realCourierAPI.setCredentials("delhivery", config)

    toast({
      title: "Configuration Saved",
      description: "Delhivery API configuration has been saved successfully.",
    })
  }

  const testConnection = async () => {
    if (!config.apiKey || !config.clientName) {
      toast({
        title: "Missing Configuration",
        description: "Please provide API key and client name.",
        variant: "destructive",
      })
      return
    }

    setIsTestingConnection(true)
    setConnectionStatus("idle")

    try {
      realCourierAPI.setCredentials("delhivery", config)

      // Test by fetching waybills
      const waybills = await realCourierAPI.fetchDelhiveryWaybill(1)

      setTestResults({
        waybills,
        timestamp: new Date().toISOString(),
      })
      setConnectionStatus("success")

      toast({
        title: "Connection Successful",
        description: "Successfully connected to Delhivery API.",
      })
    } catch (error: any) {
      console.error("Delhivery connection test failed:", error)
      setConnectionStatus("error")
      setTestResults({ error: error.message })

      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to Delhivery API.",
        variant: "destructive",
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  const calculateShippingCost = async () => {
    if (!shippingCalculator.toPincode) {
      toast({
        title: "Missing Information",
        description: "Please provide destination pincode.",
        variant: "destructive",
      })
      return
    }

    setIsCalculating(true)
    try {
      const cost = await realCourierAPI.calculateDelhiveryShippingCost(
        shippingCalculator.fromPincode,
        shippingCalculator.toPincode,
        shippingCalculator.weight,
        shippingCalculator.paymentMode,
        shippingCalculator.codAmount,
      )

      setCalculatedCost(cost)
      toast({
        title: "Cost Calculated",
        description: "Shipping cost calculated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Calculation Failed",
        description: error.message || "Failed to calculate shipping cost.",
        variant: "destructive",
      })
    } finally {
      setIsCalculating(false)
    }
  }

  const downloadLabel = async () => {
    if (!testResults?.waybills?.[0]) {
      toast({
        title: "No Waybill Available",
        description: "Please test the connection first to get a waybill.",
        variant: "destructive",
      })
      return
    }

    try {
      const labelUrl = await realCourierAPI.generateDelhiveryShippingLabel(testResults.waybills[0])
      window.open(labelUrl, "_blank")

      toast({
        title: "Label Generated",
        description: "Shipping label opened in new tab.",
      })
    } catch (error: any) {
      toast({
        title: "Label Generation Failed",
        description: error.message || "Failed to generate shipping label.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <img src="/placeholder.svg?height=24&width=24" alt="Delhivery" className="w-6 h-6" />
            Delhivery API Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="apiKey">API Token</Label>
              <Input
                id="apiKey"
                type="password"
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="Enter Delhivery API token"
              />
              <p className="text-xs text-gray-500 mt-1">12-16 character API token provided by Delhivery</p>
            </div>
            <div>
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={config.clientName}
                onChange={(e) => setConfig({ ...config, clientName: e.target.value })}
                placeholder="Enter client name (HQ name)"
              />
              <p className="text-xs text-gray-500 mt-1">Client account name provided by Delhivery</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Environment</Label>
              <p className="text-sm text-gray-600">{config.isProduction ? "Production" : "Staging/Test"}</p>
            </div>
            <Switch
              checked={config.isProduction}
              onCheckedChange={(checked) => setConfig({ ...config, isProduction: checked })}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSaveConfig} className="bg-yellow-500 hover:bg-yellow-600">
              Save Configuration
            </Button>
            <Button
              onClick={testConnection}
              disabled={isTestingConnection || !config.apiKey || !config.clientName}
              variant="outline"
            >
              {isTestingConnection ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
          </div>

          {connectionStatus !== "idle" && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                {connectionStatus === "success" ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className="font-medium">
                  {connectionStatus === "success" ? "Connection Successful" : "Connection Failed"}
                </span>
              </div>

              {testResults && (
                <div className="bg-gray-50 p-3 rounded-md">
                  {connectionStatus === "success" ? (
                    <div>
                      <p className="text-sm">
                        <strong>Available Waybills:</strong> {testResults.waybills?.length || 0}
                      </p>
                      {testResults.waybills?.[0] && (
                        <p className="text-sm">
                          <strong>Sample Waybill:</strong> {testResults.waybills[0]}
                        </p>
                      )}
                      <p className="text-xs text-gray-500">
                        Tested at: {new Date(testResults.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-red-600">{testResults.error}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="calculator">
        <TabsList>
          <TabsTrigger value="calculator">Shipping Calculator</TabsTrigger>
          <TabsTrigger value="label">Label Generator</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Shipping Cost Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fromPin">From Pincode</Label>
                  <Input
                    id="fromPin"
                    value={shippingCalculator.fromPincode}
                    onChange={(e) => setShippingCalculator({ ...shippingCalculator, fromPincode: e.target.value })}
                    placeholder="695501"
                  />
                </div>
                <div>
                  <Label htmlFor="toPin">To Pincode</Label>
                  <Input
                    id="toPin"
                    value={shippingCalculator.toPincode}
                    onChange={(e) => setShippingCalculator({ ...shippingCalculator, toPincode: e.target.value })}
                    placeholder="Enter destination pincode"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={shippingCalculator.weight}
                    onChange={(e) =>
                      setShippingCalculator({ ...shippingCalculator, weight: Number.parseFloat(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="paymentMode">Payment Mode</Label>
                  <select
                    id="paymentMode"
                    value={shippingCalculator.paymentMode}
                    onChange={(e) =>
                      setShippingCalculator({
                        ...shippingCalculator,
                        paymentMode: e.target.value as "prepaid" | "cod",
                      })
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="prepaid">Prepaid</option>
                    <option value="cod">Cash on Delivery</option>
                  </select>
                </div>
                {shippingCalculator.paymentMode === "cod" && (
                  <div>
                    <Label htmlFor="codAmount">COD Amount (₹)</Label>
                    <Input
                      id="codAmount"
                      type="number"
                      value={shippingCalculator.codAmount}
                      onChange={(e) =>
                        setShippingCalculator({ ...shippingCalculator, codAmount: Number.parseInt(e.target.value) })
                      }
                    />
                  </div>
                )}
              </div>

              <Button
                onClick={calculateShippingCost}
                disabled={isCalculating || !shippingCalculator.toPincode}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isCalculating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Calculating...
                  </>
                ) : (
                  "Calculate Cost"
                )}
              </Button>

              {calculatedCost && (
                <div className="bg-blue-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Shipping Cost Breakdown</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Base Freight:</span>
                      <span>₹{calculatedCost.base_freight || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fuel Surcharge:</span>
                      <span>₹{calculatedCost.fuel_surcharge || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>COD Charges:</span>
                      <span>₹{calculatedCost.cod_charges || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST:</span>
                      <span>₹{calculatedCost.gst || 0}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Total Amount:</span>
                      <span>₹{calculatedCost.total_amount || 0}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="label">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Label Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium">Test Label Generation</span>
                </div>
                <p className="text-sm text-yellow-700">
                  This will generate a test shipping label using the waybill from the connection test. Make sure to test
                  the connection first.
                </p>
              </div>

              {testResults?.waybills?.[0] && (
                <div className="bg-green-50 p-3 rounded-md">
                  <p className="text-sm">
                    <strong>Available Waybill:</strong> {testResults.waybills[0]}
                  </p>
                </div>
              )}

              <Button
                onClick={downloadLabel}
                disabled={!testResults?.waybills?.[0]}
                className="bg-green-500 hover:bg-green-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Generate Test Label
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
