"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useApp } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, RefreshCw, Trash2 } from "lucide-react"

export default function AdminDebugPage() {
  const { state, addActivity } = useApp()
  const { toast } = useToast()
  const [localStorageData, setLocalStorageData] = useState<any>(null)
  const [isFixing, setIsFixing] = useState(false)

  useEffect(() => {
    refreshLocalStorageData()
  }, [])

  const refreshLocalStorageData = () => {
    try {
      const data = localStorage.getItem("appData")
      if (data) {
        setLocalStorageData(JSON.parse(data))
      } else {
        setLocalStorageData(null)
      }
    } catch (error) {
      console.error("Error parsing localStorage data:", error)
      setLocalStorageData(null)
    }
  }

  const fixLocalStorage = () => {
    setIsFixing(true)
    try {
      // Ensure we have the latest state
      localStorage.setItem("appData", JSON.stringify(state))
      toast({
        title: "Storage Fixed",
        description: "Local storage has been synchronized with application state.",
      })
      refreshLocalStorageData()

      addActivity({
        type: "automation",
        action: "System Maintenance",
        details: "Data storage synchronized and fixed",
      })
    } catch (error) {
      console.error("Error fixing localStorage:", error)
      toast({
        title: "Error",
        description: "Failed to fix local storage. See console for details.",
        variant: "destructive",
      })
    } finally {
      setIsFixing(false)
    }
  }

  const clearLocalStorage = () => {
    if (confirm("Are you sure you want to clear all local storage data? This action cannot be undone.")) {
      try {
        localStorage.removeItem("appData")
        toast({
          title: "Storage Cleared",
          description: "All local storage data has been cleared. Please refresh the page.",
        })
        refreshLocalStorageData()
      } catch (error) {
        console.error("Error clearing localStorage:", error)
        toast({
          title: "Error",
          description: "Failed to clear local storage.",
          variant: "destructive",
        })
      }
    }
  }

  const getDataHealth = () => {
    const issues = []

    // Check if orders exist in state but not in localStorage
    if (
      state.orders.length > 0 &&
      (!localStorageData || !localStorageData.orders || localStorageData.orders.length === 0)
    ) {
      issues.push("Orders exist in state but not in localStorage")
    }

    // Check if orders exist in localStorage but not in state
    if (
      localStorageData &&
      localStorageData.orders &&
      localStorageData.orders.length > 0 &&
      state.orders.length === 0
    ) {
      issues.push("Orders exist in localStorage but not in state")
    }

    // Check for data inconsistencies
    if (localStorageData) {
      if (state.orders.length !== localStorageData.orders?.length) {
        issues.push(
          `Order count mismatch: State (${state.orders.length}) vs Storage (${localStorageData.orders?.length || 0})`,
        )
      }

      if (state.customers.length !== localStorageData.customers?.length) {
        issues.push(
          `Customer count mismatch: State (${state.customers.length}) vs Storage (${localStorageData.customers?.length || 0})`,
        )
      }
    }

    return {
      healthy: issues.length === 0,
      issues,
    }
  }

  const health = getDataHealth()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">System Diagnostics</h1>
          <p className="text-muted-foreground">Debug and fix data issues</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshLocalStorageData} disabled={isFixing}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={fixLocalStorage} disabled={isFixing}>
            {isFixing ? "Fixing..." : "Fix Data Issues"}
          </Button>
        </div>
      </div>

      {/* Health Status */}
      <Alert variant={health.healthy ? "default" : "destructive"}>
        {health.healthy ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
        <AlertTitle>{health.healthy ? "System Healthy" : "Issues Detected"}</AlertTitle>
        <AlertDescription>
          {health.healthy ? (
            "All data systems are functioning correctly."
          ) : (
            <div>
              <p>The following issues were detected:</p>
              <ul className="list-disc pl-5 mt-2">
                {health.issues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="summary">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="storage">Local Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Orders</div>
                  <div className="text-2xl font-bold">{state.orders.length}</div>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Customers</div>
                  <div className="text-2xl font-bold">{state.customers.length}</div>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Products</div>
                  <div className="text-2xl font-bold">{state.products.length}</div>
                </div>
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Activities</div>
                  <div className="text-2xl font-bold">{state.activities.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Storage Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Local Storage:</span>
                  <span>{localStorageData ? "Available" : "Not Available"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Orders in Storage:</span>
                  <span>{localStorageData?.orders?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customers in Storage:</span>
                  <span>{localStorageData?.customers?.length || 0}</span>
                </div>
              </div>

              <div className="mt-4">
                <Button variant="destructive" size="sm" onClick={clearLocalStorage}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Local Storage
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Orders Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">State Orders ({state.orders.length})</h3>
                  <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-60 text-xs">
                    {JSON.stringify(state.orders, null, 2)}
                  </pre>
                </div>

                <div>
                  <h3 className="font-medium">Storage Orders ({localStorageData?.orders?.length || 0})</h3>
                  <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-60 text-xs">
                    {localStorageData?.orders ? JSON.stringify(localStorageData.orders, null, 2) : "No data"}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customers Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">State Customers ({state.customers.length})</h3>
                  <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-60 text-xs">
                    {JSON.stringify(state.customers, null, 2)}
                  </pre>
                </div>

                <div>
                  <h3 className="font-medium">Storage Customers ({localStorageData?.customers?.length || 0})</h3>
                  <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-60 text-xs">
                    {localStorageData?.customers ? JSON.stringify(localStorageData.customers, null, 2) : "No data"}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle>Raw Local Storage Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-[500px] text-xs">
                {localStorageData ? JSON.stringify(localStorageData, null, 2) : "No data in localStorage"}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
