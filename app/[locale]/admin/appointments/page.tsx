"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { format, parseISO, isToday, isTomorrow, isThisWeek } from "date-fns"
import { Calendar, Download, Filter, MoreHorizontal, Plus, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"

import { collection, getDocs, query, orderBy, doc, updateDoc } from "firebase/firestore" // Added doc and updateDoc
import { db } from '@/app/firebase/config'

interface Reservation {
  id: string
  bookingReference: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  zipCode: string
  propertyType: string
  serviceType: string
  windows: string
  stories: string
  specialInstructions?: string
  preferredContact: string
  selectedDate: string
  selectedTime: string
  status: "pending" | "confirmed" | "cancelled" | "completed" | string 
  submittedAt?: string
}

const formatDate = (isoDateString: string) => {
  if (!isoDateString) return "N/A"
  try {
    return format(parseISO(isoDateString), "yyyy-MM-dd")
  } catch (error) {
    console.error("Error parsing date:", isoDateString, error)
    return "Invalid Date"
  }
}

export default function AppointmentsPage() {
  const t = useTranslations("admin.appointments")
  const [allAppointments, setAllAppointments] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [selectedAppointment, setSelectedAppointment] = useState<Reservation | null>(null)
  const [isAppointmentDetailDialogOpen, setIsAppointmentDetailDialogOpen] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  useEffect(() => {
    const fetchAppointments = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const q = query(collection(db, "reservations"), orderBy("submittedAt", "desc"))
        const querySnapshot = await getDocs(q)
        const appointmentsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Reservation))
        setAllAppointments(appointmentsData)
      } catch (err) {
        console.error("Error fetching appointments: ", err)
        if (err instanceof Error && (err.message.includes("Missing or insufficient permissions") || err.message.includes("permission-denied"))) {
          setError(t("error.permissionDeniedError"))
        } else {
          setError(t("error.errorFetching"))
        }
      } finally {
          setIsLoading(false)
      }
    }

    fetchAppointments()
  }, [t])

  const filteredAppointments = allAppointments.filter((appointment) => {
    const customerName = `${appointment.firstName} ${appointment.lastName}`
    const matchesSearch =
      searchQuery === "" ||
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.bookingReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.phone.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter

    let matchesDate = true
    if (dateFilter !== "all") {
      try {
        const appointmentDate = parseISO(appointment.selectedDate)
        if (dateFilter === "today") {
          matchesDate = isToday(appointmentDate)
        } else if (dateFilter === "tomorrow") {
          matchesDate = isTomorrow(appointmentDate)
        } else if (dateFilter === "thisWeek") {
          matchesDate = isThisWeek(appointmentDate, { weekStartsOn: 1 })
        }
      } catch (e) {
        console.error("Error parsing appointment date for filtering:", appointment.selectedDate, e)
        matchesDate = false
      }
    }
    return matchesSearch && matchesStatus && matchesDate
  })

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage)
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleOpenAppointmentDialog = (appointment: Reservation) => {
    setSelectedAppointment(appointment)
    setIsAppointmentDetailDialogOpen(true)
  }

  const StatusBadge = ({ status }: { status: string }) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default"
    const labelKey = `status.${status.toLowerCase()}`
    const label = t.rich(labelKey, {
        defaultValue: status.charAt(0).toUpperCase() + status.slice(1)
    })

    if (status === "confirmed" || status === "completed") {
      variant = "default"
    } else if (status === "pending") {
      variant = "secondary"
    } else if (status === "cancelled") {
      variant = "destructive"
    } else {
      variant = "outline"
    }

    return <Badge variant={variant}>{label}</Badge>
  }

  const handleUpdateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    if (!selectedAppointment || selectedAppointment.id !== appointmentId) return;

    setIsUpdatingStatus(true);
    const oldError = error;
    setError(null);

    try {
      const appointmentRef = doc(db, "reservations", appointmentId);
      await updateDoc(appointmentRef, {
        status: newStatus,
      });

      // Update local state for immediate UI feedback
      const updatedAppointments = allAppointments.map(app =>
        app.id === appointmentId ? { ...app, status: newStatus } : app
      );
      setAllAppointments(updatedAppointments);

      if (selectedAppointment.id === appointmentId) {
        setSelectedAppointment(prevSelected =>
          prevSelected ? { ...prevSelected, status: newStatus } : null
        );
      }
    } catch (err) {
      console.error("Error updating appointment status:", err);
      setError(t("error.statusUpdateError", { defaultValue: "Failed to update status." }));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="ml-2">{t("loadingAppointments")}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-destructive">
        <p>{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">{t("error.retry")}</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("allAppointments")}</CardTitle>
          <CardDescription>
            {t("allAppointmentsDescription", { count: filteredAppointments.length })}
          </CardDescription>
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
                  <SelectItem value="confirmed">{t("status.confirmed")}</SelectItem>
                  <SelectItem value="pending">{t("status.pending")}</SelectItem>
                  <SelectItem value="cancelled">{t("status.cancelled")}</SelectItem>
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
                  <SelectItem value="tomorrow">{t("tomorrow")}</SelectItem>
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
                  <TableHead>{t("table.service")}</TableHead>
                  <TableHead>{t("table.date")}</TableHead>
                  <TableHead>{t("table.time")}</TableHead>
                  <TableHead>{t("table.status")}</TableHead>
                  <TableHead className="text-right">{t("table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {t("noAppointmentsFound")}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">{appointment.bookingReference}</TableCell>
                      <TableCell>{`${appointment.firstName} ${appointment.lastName}`}</TableCell>
                      <TableCell>{appointment.serviceType}</TableCell>
                      <TableCell>{formatDate(appointment.selectedDate)}</TableCell>
                      <TableCell>{appointment.selectedTime}</TableCell>
                      <TableCell>
                        <StatusBadge status={appointment.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenAppointmentDialog(appointment)}>
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">{t("viewDetails")}</span>
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
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => { e.preventDefault(); if (currentPage > 1) handlePageChange(currentPage - 1); }}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => { e.preventDefault(); handlePageChange(page); }}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) handlePageChange(currentPage + 1); }}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedAppointment && (
        <Dialog open={isAppointmentDetailDialogOpen} onOpenChange={setIsAppointmentDetailDialogOpen}>
          <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl">
            <DialogHeader>
              <DialogTitle>{t("viewDetails")}</DialogTitle>
              <DialogDescription>
                {t("table.id")}: {selectedAppointment.bookingReference}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 py-4 max-h-[70vh] overflow-y-auto">
              {/* Column 1 */}
              <div className="space-y-8">
                <div className="grid grid-cols-[140px_1fr] items-start gap-x-4">
                  <span className="text-sm font-medium text-muted-foreground">{t("table.customer")}</span>
                  <span>{`${selectedAppointment.firstName} ${selectedAppointment.lastName}`}</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] items-start gap-x-4">
                  <span className="text-sm font-medium text-muted-foreground">{t("table.email")}</span>
                  <span className="break-all">{selectedAppointment.email}</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] items-start gap-x-4">
                  <span className="text-sm font-medium text-muted-foreground">{t("table.phone")}</span>
                  <span>{selectedAppointment.phone}</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] items-start gap-x-4">
                  <span className="text-sm font-medium text-muted-foreground">{t("table.address")}</span>
                  <span className="whitespace-pre-wrap">{`${selectedAppointment.address}, ${selectedAppointment.city}, ${selectedAppointment.zipCode}`}</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] items-start gap-x-4">
                  <span className="text-sm font-medium text-muted-foreground">{t("table.service")}</span>
                  <span>{selectedAppointment.serviceType}</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] items-start gap-x-4">
                  <span className="text-sm font-medium text-muted-foreground">{t("table.preferredContact")}</span>
                  <span>{selectedAppointment.preferredContact}</span>
                </div>
                {selectedAppointment.specialInstructions && (
                  <div className="grid grid-cols-[140px_1fr] items-start gap-x-4">
                    <span className="text-sm font-medium text-muted-foreground">{t("table.specialInstructions")}</span>
                    <span className="whitespace-pre-wrap">{selectedAppointment.specialInstructions}</span>
                  </div>
                )}
              </div>

              {/* Column 2 */}
              <div className="space-y-8"> {/* Increased space-y for better separation */}
                <div className="grid grid-cols-[140px_1fr] items-start gap-x-4"> {/* Adjusted label width */}
                  <span className="text-sm font-medium text-muted-foreground">{t("table.date")}</span>
                  <span>{formatDate(selectedAppointment.selectedDate)}</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] items-start gap-x-4">
                  <span className="text-sm font-medium text-muted-foreground">{t("table.time")}</span>
                  <span>{selectedAppointment.selectedTime}</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] items-start gap-x-4">
                  <span className="text-sm font-medium text-muted-foreground">{t("table.status")}</span>
                  <div>
                    <StatusBadge status={selectedAppointment.status} />
                  </div>
                </div>
                <div className="grid grid-cols-[140px_1fr] items-start gap-x-4">
                  <span className="text-sm font-medium text-muted-foreground">{t("table.propertyType")}</span>
                  <span>{selectedAppointment.propertyType}</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] items-start gap-x-4">
                  <span className="text-sm font-medium text-muted-foreground">{t("table.windows")}</span>
                  <span>{selectedAppointment.windows}</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] items-start gap-x-4">
                  <span className="text-sm font-medium text-muted-foreground">{t("table.stories")}</span>
                  <span>{selectedAppointment.stories}</span>
                </div>
                <div className="grid grid-cols-[140px_1fr] items-start gap-x-4">
                  <span className="text-sm font-medium text-muted-foreground">{t("table.createdAt")}</span>
                  {/* Ensure selectedAppointment.submittedAt is available if that's the intended field */}
                  <span>{formatDate(selectedAppointment.submittedAt || selectedAppointment.createdAt)}</span>
                </div>
              </div>
            </div>
            <DialogFooter className="sm:justify-start gap-2 pt-4">
              {selectedAppointment.status === "pending" && (
                <>
                  <Button
                    variant="default"
                    onClick={() => handleUpdateAppointmentStatus(selectedAppointment.id, "completed")}
                    disabled={isUpdatingStatus}
                  >
                    {isUpdatingStatus && <Loader2 className="mr-2 size-4 animate-spin" />}
                    {t("status.markCompleted", { defaultValue: "Mark as Completed" })}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleUpdateAppointmentStatus(selectedAppointment.id, "cancelled")}
                    disabled={isUpdatingStatus}
                  >
                    {isUpdatingStatus && <Loader2 className="mr-2 size-4 animate-spin" />}
                    {t("status.markCancelled", { defaultValue: "Cancel Appointment" })}
                  </Button>
                </>
              )}
              {selectedAppointment.status === "completed" && (
                 <Button
                    variant="outline"
                    onClick={() => handleUpdateAppointmentStatus(selectedAppointment.id, "pending")}
                    disabled={isUpdatingStatus}
                  >
                    {isUpdatingStatus && <Loader2 className="mr-2 size-4 animate-spin" />}
                    {t("status.markPending", { defaultValue: "Mark as Pending" })}
                  </Button>
              )}
               {selectedAppointment.status === "confirmed" && (
                 <>
                  <Button
                      variant="destructive"
                      onClick={() => handleUpdateAppointmentStatus(selectedAppointment.id, "cancelled")}
                      disabled={isUpdatingStatus}
                    >
                      {isUpdatingStatus && <Loader2 className="mr-2 size-4 animate-spin" />}
                      {t("status.markCancelled", { defaultValue: "Cancel Appointment" })}
                    </Button>
                    <Button // Option to mark a confirmed appointment as completed
                      variant="default"
                      onClick={() => handleUpdateAppointmentStatus(selectedAppointment.id, "completed")}
                      disabled={isUpdatingStatus}
                    >
                      {isUpdatingStatus && <Loader2 className="mr-2 size-4 animate-spin" />}
                      {t("actions.markCompleted", { defaultValue: "Mark as Completed" })}
                  </Button>status
                 </>
              )}
              <Button variant="outline" onClick={() => setIsAppointmentDetailDialogOpen(false)} disabled={isUpdatingStatus}>
                {t("table.close", { defaultValue: "Close" })}
              </Button>
            </DialogFooter>
            {error && <p className="pt-2 text-sm text-destructive text-center">{error}</p>}
          </DialogContent>
        </Dialog>
      )}
</div>
  )
}
