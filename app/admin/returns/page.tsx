"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Eye, Check, X, CreditCard, Clock, Zap } from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"

export default function AdminReturnsPage() {
  const { state, updateReturn, processRefund } = useApp()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedReturn, setSelectedReturn] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const filteredReturns = state.returns.filter(
    (returnItem) =>
      returnItem.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnItem.product_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "processed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleApprove = (returnId: string) => {
    updateReturn(returnId, {
      status: "approved",
      approved_date: new Date().toISOString(),
    })
    toast({
      title: "Return Approved",
      description: "Return request has been approved and will be processed automatically.",
    })
  }

  const handleReject = (returnId: string) => {
    updateReturn(returnId, { status: "rejected" })
    toast({
      title: "Return Rejected",
      description: "Return request has been rejected.",
    })
  }

  const handleProcessRefund = (returnId: string) => {
    processRefund(returnId)
    toast({
      title: "Refund Processed",
      description: "Refund has been processed successfully.",
    })
  }

  const handleViewDetails = (returnItem: any) => {
    setSelectedReturn(returnItem)
    setIsViewDialogOpen(true)
  }

  const returnStats = {
    total: state.returns.length,
    pending: state.returns.filter((r) => r.status === "pending").length,
    approved: state.returns.filter((r) => r.status === "approved").length,
    processed: state.returns.filter((r) => r.status === "processed").length,
    autoProcessed: state.returns.filter((r) => r.status === "processed" && r.refund_id?.startsWith("REF-")).length,
  }

  const automationEfficiency =
    returnStats.total > 0 ? ((returnStats.autoProcessed / returnStats.total) * 100).toFixed(1) : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Returns & Refunds</h1>
          <p className="text-muted-foreground">Automated return processing and refund management</p>
        </div>

        {/* Automation Status */}
        {state.automationEnabled && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-900">Auto-Processing Active</p>
                  <p className="text-xs text-green-700">{automationEfficiency}% automated</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Returns",
            value: returnStats.total.toString(),
            color: "text-blue-600",
            icon: <MoreHorizontal className="w-4 h-4" />,
          },
          {
            label: "Pending",
            value: returnStats.pending.toString(),
            color: "text-yellow-600",
            icon: <Clock className="w-4 h-4" />,
          },
          {
            label: "Approved",
            value: returnStats.approved.toString(),
            color: "text-green-600",
            icon: <Check className="w-4 h-4" />,
          },
          {
            label: "Auto-Processed",
            value: returnStats.autoProcessed.toString(),
            color: "text-purple-600",
            icon: <Zap className="w-4 h-4" />,
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
                <div className={stat.color}>{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search returns by order ID, customer, or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Returns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Return Requests ({filteredReturns.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredReturns.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500">No return requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-4 font-medium">Return ID</th>
                    <th className="p-4 font-medium">Customer</th>
                    <th className="p-4 font-medium hidden sm:table-cell">Product</th>
                    <th className="p-4 font-medium hidden md:table-cell">Reason</th>
                    <th className="p-4 font-medium">Amount</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReturns.map((returnItem) => (
                    <tr key={returnItem.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium">{returnItem.id}</div>
                        <div className="text-sm text-gray-600">{returnItem.order_id}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{returnItem.customer_name}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(returnItem.request_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <div className="font-medium">{returnItem.product_name}</div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="text-sm">{returnItem.reason}</span>
                      </td>
                      <td className="p-4 font-medium">₹{returnItem.amount}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(returnItem.status)}>{returnItem.status}</Badge>
                          {returnItem.refund_id?.startsWith("REF-") && (
                            <Zap className="w-3 h-3 text-green-600" title="Auto-processed" />
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(returnItem)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {returnItem.status === "pending" && (
                              <>
                                <DropdownMenuItem
                                  className="text-green-600"
                                  onClick={() => handleApprove(returnItem.id)}
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={() => handleReject(returnItem.id)}>
                                  <X className="w-4 h-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            {returnItem.status === "approved" && (
                              <DropdownMenuItem
                                className="text-blue-600"
                                onClick={() => handleProcessRefund(returnItem.id)}
                              >
                                <CreditCard className="w-4 h-4 mr-2" />
                                Process Refund
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Return Request Details</DialogTitle>
          </DialogHeader>
          {selectedReturn && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Return ID</label>
                  <p className="font-medium">{selectedReturn.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Order ID</label>
                  <p className="font-medium">{selectedReturn.order_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Customer</label>
                  <p className="font-medium">{selectedReturn.customer_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Product</label>
                  <p className="font-medium">{selectedReturn.product_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Amount</label>
                  <p className="font-medium">₹{selectedReturn.amount}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(selectedReturn.status)}>{selectedReturn.status}</Badge>
                    {selectedReturn.refund_id?.startsWith("REF-") && (
                      <Badge variant="outline" className="text-green-600">
                        <Zap className="w-3 h-3 mr-1" />
                        Auto-processed
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Reason</label>
                <p className="mt-1 p-3 bg-gray-50 rounded-lg">{selectedReturn.reason}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Request Date</label>
                  <p className="font-medium">{new Date(selectedReturn.request_date).toLocaleString()}</p>
                </div>
                {selectedReturn.approved_date && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Approved Date</label>
                    <p className="font-medium">{new Date(selectedReturn.approved_date).toLocaleString()}</p>
                  </div>
                )}
              </div>
              {selectedReturn.processed_date && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Processed Date</label>
                    <p className="font-medium">{new Date(selectedReturn.processed_date).toLocaleString()}</p>
                  </div>
                  {selectedReturn.refund_id && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Refund ID</label>
                      <p className="font-medium font-mono">{selectedReturn.refund_id}</p>
                    </div>
                  )}
                </div>
              )}

              {selectedReturn.status === "pending" && (
                <div className="flex gap-2 pt-4">
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleApprove(selectedReturn.id)
                      setIsViewDialogOpen(false)
                    }}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve Return
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleReject(selectedReturn.id)
                      setIsViewDialogOpen(false)
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject Return
                  </Button>
                </div>
              )}

              {selectedReturn.status === "approved" && (
                <div className="pt-4">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      handleProcessRefund(selectedReturn.id)
                      setIsViewDialogOpen(false)
                    }}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Process Refund ₹{selectedReturn.amount}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
