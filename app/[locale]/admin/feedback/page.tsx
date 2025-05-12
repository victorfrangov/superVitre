"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Calendar, Check, Download, Filter, MessageSquare, Search, Star, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"

export default function FeedbackPage() {
  const t = useTranslations("admin.feedback")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Mock data for feedback
  const feedbackList = [
    {
      id: "FDB-1001",
      customer: "John Smith",
      email: "john@example.com",
      rating: 5,
      message:
        "Absolutely fantastic service! The team was professional, thorough, and left my windows spotless. Will definitely use again.",
      date: "2025-05-10",
      status: "pending",
      allowPublic: true,
    },
    {
      id: "FDB-1002",
      customer: "Sarah Johnson",
      email: "sarah@example.com",
      rating: 4,
      message:
        "Great job overall. The windows look amazing and the team was very polite. Only reason for 4 stars is they were about 30 minutes late.",
      date: "2025-05-09",
      status: "approved",
      allowPublic: true,
    },
    {
      id: "FDB-1003",
      customer: "Acme Corporation",
      email: "info@acmecorp.com",
      rating: 5,
      message:
        "We've been using CrystalClear for our office building for over a year now. Consistently excellent results and reliable service.",
      date: "2025-05-08",
      status: "approved",
      allowPublic: true,
    },
    {
      id: "FDB-1004",
      customer: "Emily Davis",
      email: "emily@example.com",
      rating: 3,
      message:
        "The windows look clean, but there were a few spots missed on the second floor. The technician was friendly though.",
      date: "2025-05-07",
      status: "rejected",
      allowPublic: false,
    },
    {
      id: "FDB-1005",
      customer: "Tech Innovations Inc",
      email: "contact@techinnovations.com",
      rating: 5,
      message:
        "Excellent service for our commercial property. The team was efficient and professional. Our storefront windows have never looked better!",
      date: "2025-05-06",
      status: "pending",
      allowPublic: true,
    },
    {
      id: "FDB-1006",
      customer: "Robert Wilson",
      email: "robert@example.com",
      rating: 5,
      message:
        "I've tried several window cleaning services in the area, and CrystalClear is by far the best. Attention to detail is impressive.",
      date: "2025-05-05",
      status: "approved",
      allowPublic: true,
    },
    {
      id: "FDB-1007",
      customer: "Sunshine Cafe",
      email: "manager@sunshinecafe.com",
      rating: 4,
      message:
        "Our cafe windows look amazing! Customers have been commenting on how clear they are. Will be scheduling regular service.",
      date: "2025-05-04",
      status: "pending",
      allowPublic: true,
    },
    {
      id: "FDB-1008",
      customer: "Jennifer Lee",
      email: "jennifer@example.com",
      rating: 2,
      message:
        "Service was okay but they left water spots on my hardwood floors. Had to clean up after them which was disappointing.",
      date: "2025-05-03",
      status: "rejected",
      allowPublic: false,
    },
  ]

  // Filter feedback based on search query and filters
  const filteredFeedback = feedbackList.filter((feedback) => {
    const matchesSearch =
      searchQuery === "" ||
      feedback.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.message.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || feedback.status === statusFilter

    // Simple date filter for demo purposes
    let matchesDate = true
    if (dateFilter === "today") {
      matchesDate = feedback.date === "2025-05-10"
    } else if (dateFilter === "yesterday") {
      matchesDate = feedback.date === "2025-05-09"
    } else if (dateFilter === "thisWeek") {
      matchesDate = [
        "2025-05-04",
        "2025-05-05",
        "2025-05-06",
        "2025-05-07",
        "2025-05-08",
        "2025-05-09",
        "2025-05-10",
      ].includes(feedback.date)
    }
    return matchesSearch && matchesStatus && matchesDate
  })

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default"
    const label = t(`status.${status}`)

    if (status === "approved") {
      variant = "default"
    } else if (status === "pending") {
      variant = "secondary"
    } else if (status === "rejected") {
      variant = "destructive"
    }
    return <Badge variant={variant}>{label}</Badge>
  }

  // Rating component
  const RatingStars = ({ rating }: { rating: number }) => {
    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`size-4 ${i < rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`}
          />
        ))}
      </div>
    )
  }

  const handleViewFeedback = (feedback: any) => {
    setSelectedFeedback(feedback)
    setIsDialogOpen(true)
  }

  const handleApproveFeedback = (id: string) => {
    // In a real app, this would be an API call
    toast({
      title: t("feedbackApproved"),
      description: t("feedbackApprovedDescription"),
    })
    setIsDialogOpen(false)
  }

  const handleRejectFeedback = (id: string) => {
    // In a real app, this would be an API call
    toast({
      title: t("feedbackRejected"),
      description: t("feedbackRejectedDescription"),
    })
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("allFeedback")}</CardTitle>
          <CardDescription>{t("allFeedbackDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("searchPlaceholder")}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 size-4" />
                  <SelectValue placeholder={t("filterByStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allStatuses")}</SelectItem>
                  <SelectItem value="pending">{t("status.pending")}</SelectItem>
                  <SelectItem value="approved">{t("status.approved")}</SelectItem>
                  <SelectItem value="rejected">{t("status.rejected")}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="mr-2 size-4" />
                  <SelectValue placeholder={t("filterByDate")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allDates")}</SelectItem>
                  <SelectItem value="today">{t("today")}</SelectItem>
                  <SelectItem value="yesterday">{t("yesterday")}</SelectItem>
                  <SelectItem value="thisWeek">{t("thisWeek")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.id")}</TableHead>
                  <TableHead>{t("table.customer")}</TableHead>
                  <TableHead>{t("table.rating")}</TableHead>
                  <TableHead>{t("table.date")}</TableHead>
                  <TableHead>{t("table.status")}</TableHead>
                  <TableHead>{t("table.allowPublic")}</TableHead>
                  <TableHead className="text-right">{t("table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFeedback.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {t("noFeedbackFound")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFeedback.map((feedback) => (
                    <TableRow key={feedback.id}>
                      <TableCell className="font-medium">{feedback.id}</TableCell>
                      <TableCell>{feedback.customer}</TableCell>
                      <TableCell>
                        <RatingStars rating={feedback.rating} />
                      </TableCell>
                      <TableCell>{feedback.date}</TableCell>
                      <TableCell>
                        <StatusBadge status={feedback.status} />
                      </TableCell>
                      <TableCell>{feedback.allowPublic ? t("yes") : t("no")}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleViewFeedback(feedback)}>
                          <MessageSquare className="size-4" />
                          <span className="sr-only">{t("viewFeedback")}</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      {/* Feedback Detail Dialog */}
      {selectedFeedback && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("feedbackDetails")}</DialogTitle>
              <DialogDescription>
                {t("from")} {selectedFeedback.customer} ({selectedFeedback.date})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center">
                <span className="font-medium mr-2">{t("table.rating")}:</span>
                <RatingStars rating={selectedFeedback.rating} />
              </div>
              <div>
                <span className="font-medium">{t("info.message")}:</span>
                <p className="mt-1 text-sm border rounded-md p-3 bg-muted/30">{selectedFeedback.message}</p>
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-2">{t("table.allowPublic")}:</span>
                <span>{selectedFeedback.allowPublic ? t("yes") : t("no")}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium mr-2">{t("table.status")}:</span>
                <StatusBadge status={selectedFeedback.status} />
              </div>
            </div>
            <DialogFooter className="flex sm:justify-between">
              {selectedFeedback.status === "pending" && (
                <>
                  <Button variant="destructive" onClick={() => handleRejectFeedback(selectedFeedback.id)}>
                    <X className="mr-2 size-4" />
                    {t("info.reject")}
                  </Button>
                  <Button onClick={() => handleApproveFeedback(selectedFeedback.id)}>
                    <Check className="mr-2 size-4" />
                    {t("info.approve")}
                  </Button>
                </>
              )}
              {selectedFeedback.status === "approved" && (
                <Button variant="destructive" onClick={() => handleRejectFeedback(selectedFeedback.id)}>
                  <X className="mr-2 size-4" />
                  {t("info.removeApproval")}
                </Button>
              )}
              {selectedFeedback.status === "rejected" && (
                <Button onClick={() => handleApproveFeedback(selectedFeedback.id)}>
                  <Check className="mr-2 size-4" />
                  {t("info.approve")}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
