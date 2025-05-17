"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Calendar, Check, Filter, MessageSquare, Search, Star, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { collection, query, getDocs, orderBy, doc, updateDoc } from "firebase/firestore"
import { db } from "@/app/firebase/config"

export default function FeedbackPage() {
  const t = useTranslations("admin.feedback")
  const [feedbackList, setFeedbackList] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const fetchFeedbacks = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const q = query(collection(db, "feedbacks"), orderBy("submittedAt", "desc"))
        const querySnapshot = await getDocs(q)
        const feedbackData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setFeedbackList(feedbackData)
      } catch (err) {
        console.error("Error fetching feedback:", err)
        setError(t("error.errorFetching"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeedbacks()
  }, [t])

  const handleApproveFeedback = async (id: string) => {
    try {
      const feedbackRef = doc(db, "feedbacks", id)
      await updateDoc(feedbackRef, { status: "approved" })
      setFeedbackList((prev) =>
        prev.map((feedback) => (feedback.id === id ? { ...feedback, status: "approved" } : feedback))
      )
      setIsDialogOpen(false)
    } catch (err) {
      console.error("Error approving feedback:", err)
    }
  }

  const handleRejectFeedback = async (id: string) => {
    try {
      const feedbackRef = doc(db, "feedbacks", id)
      await updateDoc(feedbackRef, { status: "rejected" })
      setFeedbackList((prev) =>
        prev.map((feedback) => (feedback.id === id ? { ...feedback, status: "rejected" } : feedback))
      )
      setIsDialogOpen(false)
    } catch (err) {
      console.error("Error rejecting feedback:", err)
    }
  }

  const filteredFeedback = feedbackList.filter((feedback) => {
    const matchesSearch =
      searchQuery === "" ||
      feedback.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      feedback.message?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || feedback.status === statusFilter

    let matchesDate = true
    if (dateFilter === "today") {
      matchesDate = feedback.submittedAt?.startsWith("2025-05-10")
    } else if (dateFilter === "yesterday") {
      matchesDate = feedback.submittedAt?.startsWith("2025-05-09")
    } else if (dateFilter === "thisWeek") {
      matchesDate = ["2025-05-04", "2025-05-05", "2025-05-06", "2025-05-07", "2025-05-08", "2025-05-09", "2025-05-10"].some(
        (date) => feedback.submittedAt?.startsWith(date)
      )
    }

    return matchesSearch && matchesStatus && matchesDate
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="ml-2">{t("loading")}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-destructive">
        <p>{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          {t("error.retry")}
        </Button>
      </div>
    )
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
                      <TableCell>{feedback.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`size-4 ${
                                i < feedback.rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{feedback.submittedAt}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            feedback.status === "approved"
                              ? "default"
                              : feedback.status === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {t(`status.${feedback.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>{feedback.allowPublic ? t("yes") : t("no")}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedFeedback(feedback)
                            setIsDialogOpen(true)
                          }}
                        >
                          <MessageSquare className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
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
                {t("from")} {selectedFeedback.customer} ({selectedFeedback.submittedAt})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center">
                <span className="font-medium mr-2">{t("table.rating")}:</span>
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${
                        i < selectedFeedback.rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
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
                <Badge
                  variant={
                    selectedFeedback.status === "approved"
                      ? "default"
                      : selectedFeedback.status === "pending"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {t(`status.${selectedFeedback.status}`)}
                </Badge>
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
