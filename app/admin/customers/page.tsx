"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  Search,
  MoreHorizontal,
  Eye,
  Mail,
  Ban,
  UserCheck,
  Trash2,
  RefreshCw,
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
} from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"

export default function AdminCustomersPage() {
  const { state, addActivity } = useApp()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null)

  const filteredCustomers = state.customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calculate analytics
  const analytics = {
    totalCustomers: state.customers.length,
    newThisMonth: state.customers.filter((customer) => {
      const joinDate = new Date(customer.joinDate)
      const now = new Date()
      return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear()
    }).length,
    vipCustomers: state.customers.filter((customer) => customer.status === "vip").length,
    totalRevenue: state.customers.reduce((sum, customer) => sum + customer.totalSpent, 0),
    averageOrderValue:
      state.customers.length > 0
        ? state.customers.reduce((sum, customer) => sum + customer.totalSpent, 0) /
            state.customers.reduce((sum, customer) => sum + customer.orders, 0) || 0
        : 0,
    topSpenders: state.customers.sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5),
    recentCustomers: state.customers
      .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
      .slice(0, 5),
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "vip":
        return "bg-purple-100 text-purple-800"
      case "active":
        return "bg-green-100 text-green-800"
      case "new":
        return "bg-blue-100 text-blue-800"
      case "blocked":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDeleteCustomer = (customerId: string) => {
    setCustomerToDelete(customerId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteCustomer = () => {
    if (customerToDelete) {
      const customer = state.customers.find((c) => c.id === customerToDelete)
      if (customer) {
        // In a real app, you'd call a delete function from context
        // For now, we'll just show a toast
        addActivity({
          type: "customer",
          action: "Customer Deleted",
          details: `Customer ${customer.name} (${customer.email}) was deleted`,
        })

        toast({
          title: "Customer Deleted",
          description: `${customer.name} has been removed from the system.`,
        })
      }
    }
    setIsDeleteDialogOpen(false)
    setCustomerToDelete(null)
  }

  const clearAllCustomers = () => {
    // In a real app, you'd implement this in the context
    addActivity({
      type: "customer",
      action: "All Customers Cleared",
      details: "All customer data has been cleared from the system",
    })

    toast({
      title: "All Customers Cleared",
      description: "All customer data has been removed from the system.",
    })
  }

  const refreshCustomerData = () => {
    // In a real app, you'd fetch fresh data from the server
    addActivity({
      type: "customer",
      action: "Customer Data Refreshed",
      details: "Customer data has been refreshed from the server",
    })

    toast({
      title: "Data Refreshed",
      description: "Customer data has been updated.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">Manage your customer base and analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshCustomerData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="destructive" onClick={clearAllCustomers}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-blue-600">{analytics.totalCustomers}</div>
                <div className="text-sm text-gray-600">Total Customers</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-green-600">{analytics.newThisMonth}</div>
                <div className="text-sm text-gray-600">New This Month</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-purple-600">{analytics.vipCustomers}</div>
                <div className="text-sm text-gray-600">VIP Customers</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-yellow-600">₹{analytics.totalRevenue.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <div className="text-2xl font-bold text-orange-600">
                  ₹{Math.round(analytics.averageOrderValue).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Avg Order Value</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Spenders and Recent Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Spenders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topSpenders.map((customer, index) => (
                <div key={customer.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-gray-600">{customer.orders} orders</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">₹{customer.totalSpent.toLocaleString()}</div>
                    <Badge className={getStatusColor(customer.status)}>{customer.status.toUpperCase()}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recentCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-gray-600">{customer.email}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Joined: {customer.joinDate}</div>
                    <Badge className={getStatusColor(customer.status)}>{customer.status.toUpperCase()}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Customers ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium hidden sm:table-cell">Contact</th>
                  <th className="p-4 font-medium">Orders</th>
                  <th className="p-4 font-medium hidden md:table-cell">Total Spent</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-gray-600">{customer.email}</div>
                        <div className="text-sm text-gray-600 sm:hidden">{customer.phone}</div>
                      </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <div className="text-sm">
                        <div>{customer.phone}</div>
                        <div className="text-gray-600">Joined: {customer.joinDate}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{customer.orders}</div>
                      <div className="text-sm text-gray-600">
                        Last: {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : "Never"}
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell font-medium">₹{customer.totalSpent.toLocaleString()}</td>
                    <td className="p-4">
                      <Badge className={getStatusColor(customer.status)}>{customer.status.toUpperCase()}</Badge>
                    </td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="w-4 h-4 mr-2" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <UserCheck className="w-4 h-4 mr-2" />
                            Make VIP
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteCustomer(customer.id)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Customer
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Ban className="w-4 h-4 mr-2" />
                            Block Customer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this customer? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteCustomer}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
