"use client"

import type React from "react"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useApp } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"
import { User, Package, Heart, Settings, Edit, Eye } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"

export default function ProfilePage() {
  const { user } = useAuth()
  const { state } = useApp()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  })

  const userOrders = state.orders.filter((order) => order.customer_email === user?.email)
  const userReviews = state.reviews.filter((review) => review.customer_name === user?.name)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSave = () => {
    // In a real app, this would update the user profile
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    })
    setIsEditing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "shipped":
        return "bg-purple-100 text-purple-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your account and view your orders</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Orders ({userOrders.length})
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Reviews ({userReviews.length})
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Personal Information
                    </CardTitle>
                    <Button
                      variant="outline"
                      onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                      className="flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      {isEditing ? "Save Changes" : "Edit Profile"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={profileData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        name="pincode"
                        value={profileData.pincode}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={profileData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={profileData.city}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        value={profileData.state}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <div className="space-y-4">
                {userOrders.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h3>
                      <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
                      <Button className="bg-yellow-500 hover:bg-yellow-600" asChild>
                        <a href="/products">Start Shopping</a>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  userOrders.map((order) => (
                    <Card key={order.id} className="hover-lift">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{order.id}</h3>
                              <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                            </div>
                            <p className="text-gray-600 mb-2">
                              {order.items.length} item(s) • ₹{order.total} • {order.payment_method.toUpperCase()}
                            </p>
                            <p className="text-sm text-gray-500">
                              Placed on {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            {order.status === "delivered" && (
                              <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600">
                                Write Review
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews">
              <div className="space-y-4">
                {userReviews.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
                      <p className="text-gray-600 mb-4">You haven't written any reviews yet.</p>
                      <Button className="bg-yellow-500 hover:bg-yellow-600" asChild>
                        <a href="/products">Shop & Review</a>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  userReviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{review.title}</h3>
                            <p className="text-gray-600 mb-2">{review.product_name}</p>
                            <p className="text-gray-700 mb-3">{review.comment}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span
                                    key={i}
                                    className={`text-lg ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                              <Badge className={getStatusColor(review.status)}>{review.status}</Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  )
}
