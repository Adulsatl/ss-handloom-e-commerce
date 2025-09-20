"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Eye, Check, X, Star } from "lucide-react"
import { useApp } from "@/contexts/app-context"
import { useToast } from "@/hooks/use-toast"

export default function AdminReviewsPage() {
  const { state, updateReview } = useApp()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedReview, setSelectedReview] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const filteredReviews = state.reviews.filter(
    (review) =>
      review.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star key={index} className={`w-4 h-4 ${index < rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
    ))
  }

  const handleApprove = (reviewId: string) => {
    updateReview(reviewId, { status: "approved" })
    toast({
      title: "Review Approved",
      description: "Review has been approved and is now visible to customers.",
    })
  }

  const handleReject = (reviewId: string) => {
    updateReview(reviewId, { status: "rejected" })
    toast({
      title: "Review Rejected",
      description: "Review has been rejected and will not be visible.",
    })
  }

  const handleViewDetails = (review: any) => {
    setSelectedReview(review)
    setIsViewDialogOpen(true)
  }

  const reviewStats = {
    total: state.reviews.length,
    pending: state.reviews.filter((r) => r.status === "pending").length,
    approved: state.reviews.filter((r) => r.status === "approved").length,
    avgRating:
      state.reviews.length > 0
        ? (state.reviews.reduce((sum, r) => sum + r.rating, 0) / state.reviews.length).toFixed(1)
        : "0",
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Reviews</h1>
          <p className="text-muted-foreground">Moderate customer reviews and feedback</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Reviews", value: reviewStats.total.toString(), color: "text-blue-600" },
          { label: "Pending", value: reviewStats.pending.toString(), color: "text-yellow-600" },
          { label: "Approved", value: reviewStats.approved.toString(), color: "text-green-600" },
          { label: "Average Rating", value: reviewStats.avgRating, color: "text-purple-600" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 md:p-6">
              <div className="text-center">
                <div className={`text-2xl font-bold ${stat.color} flex items-center justify-center gap-1`}>
                  {stat.label === "Average Rating" && <Star className="w-6 h-6 fill-current" />}
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
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
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">No reviews found</p>
            </CardContent>
          </Card>
        ) : (
          filteredReviews.map((review) => (
            <Card key={review.id} className="hover-lift">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">{renderStars(review.rating)}</div>
                      <Badge className={getStatusColor(review.status)}>{review.status}</Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{review.title}</h3>
                    <p className="text-gray-600 mb-3 line-clamp-3">{review.comment}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-500">
                      <span>By {review.customer_name}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>Product: {review.product_name}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>{new Date(review.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {review.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(review.id)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleReject(review.id)}>
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(review)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {review.status === "approved" && (
                          <DropdownMenuItem className="text-red-600" onClick={() => handleReject(review.id)}>
                            <X className="w-4 h-4 mr-2" />
                            Hide Review
                          </DropdownMenuItem>
                        )}
                        {review.status === "rejected" && (
                          <DropdownMenuItem className="text-green-600" onClick={() => handleApprove(review.id)}>
                            <Check className="w-4 h-4 mr-2" />
                            Approve Review
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Customer</label>
                  <p className="font-medium">{selectedReview.customer_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Product</label>
                  <p className="font-medium">{selectedReview.product_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Rating</label>
                  <div className="flex items-center gap-2">
                    <div className="flex">{renderStars(selectedReview.rating)}</div>
                    <span className="font-medium">{selectedReview.rating}/5</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <Badge className={getStatusColor(selectedReview.status)}>{selectedReview.status}</Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Title</label>
                <p className="font-medium">{selectedReview.title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Review</label>
                <p className="mt-1 p-3 bg-gray-50 rounded-lg">{selectedReview.comment}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Date</label>
                <p className="font-medium">{new Date(selectedReview.date).toLocaleString()}</p>
              </div>

              {selectedReview.status === "pending" && (
                <div className="flex gap-2 pt-4">
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleApprove(selectedReview.id)
                      setIsViewDialogOpen(false)
                    }}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve Review
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleReject(selectedReview.id)
                      setIsViewDialogOpen(false)
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject Review
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
