"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { format, parseISO } from "date-fns"
import {
  ArrowLeft,
  Edit3,
  Info,
  Loader2,
  MessageSquare,
  Save,
  User,
  ListChecks,
  Hash,
  Maximize2,
  AlertTriangle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/app/firebase/config"

// Define the Reservation interface (ensure it matches your Firestore data structure)
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
  windows: string
  stories: string
  specialInstructions?: string
  specialInstructionsImageUrls?: string[]
  price?: number
  estimatedPriceRange?: string
  preferredContact: string
  selectedDate: string
  selectedTime: string
  status: "pending" | "confirmed" | "cancelled" | "completed" | string
  submittedAt?: string
  includeInterior?: boolean
}

const formatDateDisplay = (dateString?: string, dateFormat: string = "PPP, p") => {
  if (!dateString) return "N/A"
  try {
    return format(parseISO(dateString), dateFormat)
  } catch (error) {
    console.error("Error parsing date:", dateString, error)
    return "Invalid Date"
  }
}

export default function AppointmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations("admin.appointments")
  const commonT = useTranslations("common")

  const appointmentId = params.id as string
  const locale = params.locale as string

  const [appointment, setAppointment] = useState<Reservation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentStatus, setCurrentStatus] = useState<string>("")
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  useEffect(() => {
    if (appointmentId) {
      const fetchAppointment = async () => {
        setIsLoading(true)
        setError(null)
        try {
          const appointmentRef = doc(db, "reservations", appointmentId)
          const appointmentSnap = await getDoc(appointmentRef)

          if (appointmentSnap.exists()) {
            const appointmentData = { id: appointmentSnap.id, ...appointmentSnap.data() } as Reservation
            setAppointment(appointmentData)
            setCurrentStatus(appointmentData.status)
          } else {
            setError(t("detail.notFound", { defaultValue: "Appointment not found." }))
          }
        } catch (err) {
          console.error("Error fetching appointment:", err)
          setError(t("detail.errorFetching", { defaultValue: "Error fetching appointment details." }))
        } finally {
          setIsLoading(false)
        }
      }
      fetchAppointment()
    }
  }, [appointmentId, t])

  const handleStatusChange = async () => {
    if (!appointment || !currentStatus || currentStatus === appointment.status) return

    setIsUpdatingStatus(true)
    setError(null)
    try {
      const appointmentRef = doc(db, "reservations", appointment.id)
      await updateDoc(appointmentRef, {
        status: currentStatus,
      })
      setAppointment((prevAppointment) => prevAppointment ? { ...prevAppointment, status: currentStatus } : null)
    } catch (err) {
      console.error("Error updating status:", err)
      setError(t("error.statusUpdateError", { defaultValue: "Failed to update status." }))
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const StatusBadgeComponent = ({ status }: { status: string }) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default"
    const statusKey = status?.toLowerCase() || "unknown"
    const label = t(`status.${statusKey}`, { defaultValue: status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown" })

    switch (statusKey) {
      case "confirmed":
      case "completed":
        variant = "default" // Greenish in shadcn default theme
        break
      case "pending":
        variant = "secondary" // Bluish/Grayish
        break
      case "cancelled":
        variant = "destructive" // Reddish
        break
      default:
        variant = "outline"
    }
    return <Badge variant={variant}>{label}</Badge>
  }
  
  const statusOptions = [
    { value: "pending", label: t("status.pending", {defaultValue: "Pending"}) },
    { value: "confirmed", label: t("status.confirmed", {defaultValue: "Confirmed"}) },
    { value: "completed", label: t("status.completed", {defaultValue: "Completed"}) },
    { value: "cancelled", label: t("status.cancelled", {defaultValue: "Cancelled"}) },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">{commonT("loading", {defaultValue: "Loading..."})}</p>
      </div>
    )
  }

  if (error && !appointment) { // Show error prominently if appointment couldn't be loaded
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-xl font-semibold text-destructive mb-2">{t("detail.errorTitle", {defaultValue: "Error"})}</p>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => router.push(`/${locale}/admin/appointments`)} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("detail.backToList", {defaultValue: "Back to Appointments List"})}
        </Button>
      </div>
    )
  }

  if (!appointment) { // Should be caught by error state, but as a fallback
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4 text-center">
        <Info className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-xl font-semibold mb-2">{t("detail.notFoundTitle", {defaultValue: "Not Found"})}</p>
        <p className="text-muted-foreground mb-6">{t("detail.notFound", {defaultValue: "Appointment not found."})}</p>
        <Button onClick={() => router.push(`/${locale}/admin/appointments`)} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("detail.backToList", {defaultValue: "Back to Appointments List"})}
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t("detail.title", {defaultValue: "Appointment Details"})}</h1>
        <Button variant="outline" onClick={() => router.push(`/${locale}/admin/appointments`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("detail.backToList", {defaultValue: "Back to Appointments List"})}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Hash className="mr-3 h-5 w-5 text-primary" /> {t("detail.appointmentInfo", {defaultValue: "Appointment Information"})}
              </CardTitle>
              <CardDescription>
                {t("table.id", {defaultValue: "Booking ID"})}: {appointment.bookingReference} <br />
                {t("table.submittedAt", {defaultValue: "Submitted"})}: {formatDateDisplay(appointment.submittedAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                <div><strong className="font-medium text-muted-foreground">{t("table.date", {defaultValue: "Date"})}:</strong> {formatDateDisplay(appointment.selectedDate, "PPP")}</div>
                <div><strong className="font-medium text-muted-foreground">{t("table.time", {defaultValue: "Time"})}:</strong> {appointment.selectedTime}</div>
                {appointment.price !== undefined && <div><strong className="font-medium text-muted-foreground">{t("table.price", {defaultValue: "Price"})}:</strong> ${appointment.price.toFixed(2)}</div>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <User className="mr-3 h-5 w-5 text-primary" />{t("detail.customerInfo", {defaultValue: "Customer Information"})}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                <div><strong className="font-medium text-muted-foreground">{t("table.customer", {defaultValue: "Name"})}:</strong> {appointment.firstName} {appointment.lastName}</div>
                <div><strong className="font-medium text-muted-foreground">{t("table.email", {defaultValue: "Email"})}:</strong> <a href={`mailto:${appointment.email}`} className="text-primary hover:underline break-all">{appointment.email}</a></div>
                <div><strong className="font-medium text-muted-foreground">{t("table.phone", {defaultValue: "Phone"})}:</strong> {appointment.phone}</div>
                <div><strong className="font-medium text-muted-foreground">{t("table.address", {defaultValue: "Address"})}:</strong> {`${appointment.address}, ${appointment.city}, ${appointment.zipCode}`}</div>
                <div><strong className="font-medium text-muted-foreground">{t("table.preferredContact", {defaultValue: "Preferred Contact"})}:</strong> {appointment.preferredContact}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <ListChecks className="mr-3 h-5 w-5 text-primary" />{t("detail.serviceInfo", {defaultValue: "Service Details"})}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                <div><strong className="font-medium text-muted-foreground">{t("table.price", { defaultValue: "Estimated Price Range" })}:</strong>{" "}{appointment.estimatedPriceRange ? appointment.estimatedPriceRange : "-"}</div>
                <div><strong className="font-medium text-muted-foreground">{t("table.propertyType", { defaultValue: "Property Type" })}:</strong>{" "}{appointment.propertyType}</div>
                <div><strong className="font-medium text-muted-foreground">{t("table.windows", { defaultValue: "Windows" })}:</strong>{" "}{appointment.windows}</div>
                <div><strong className="font-medium text-muted-foreground">{t("table.stories", { defaultValue: "Stories" })}:</strong>{" "}{appointment.stories}</div>
                <div><strong className="font-medium text-muted-foreground">{t("table.interiorCleaning", { defaultValue: "Interior Cleaning" })}:</strong>{" "}{appointment.includeInterior? t("table.yes", { defaultValue: "Yes" }): t("table.no", { defaultValue: "No" })}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <MessageSquare className="mr-3 h-5 w-5 text-primary" /> {t("detail.instructionsAndImages", {defaultValue: "Special Instructions & Images"})}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appointment.specialInstructions ? (
                <>
                  <Label className="text-xs font-semibold uppercase text-muted-foreground">{t("table.specialInstructions", {defaultValue: "Instructions"})}</Label>
                  <Textarea
                    value={appointment.specialInstructions}
                    readOnly
                    className="mt-1 min-h-[100px] bg-muted/30 border p-3 rounded-md text-sm leading-relaxed mb-4"
                    rows={4}
                  />
                </>
              ) : (
                <p className="text-sm text-muted-foreground mb-4">{t("detail.noInstructions", {defaultValue: "No special instructions provided."})}</p>
              )}
              
              <Label className="text-xs font-semibold uppercase text-muted-foreground">{t("detail.attachedImages", {defaultValue: "Attached Images"})}</Label>
              {appointment.specialInstructionsImageUrls && appointment.specialInstructionsImageUrls.length > 0 ? (
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {appointment.specialInstructionsImageUrls.map((url, index) => (
                    <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="group aspect-square block border rounded-lg overflow-hidden relative hover:shadow-md transition-all duration-200">
                      <img src={url} alt={`${t("detail.instructionImageAlt", {defaultValue: "Instruction image"})} ${index + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-opacity duration-300">
                        <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-sm text-muted-foreground">{t("detail.noImages", {defaultValue: "No images provided."})}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column for Status Management */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24"> {/* Sticky for longer main content */}
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Edit3 className="mr-3 h-5 w-5 text-primary" /> {t("detail.manageStatus", {defaultValue: "Manage Status"})}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-1">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground">{t("table.status", {defaultValue: "Current Status"})}</Label>
                    <div><StatusBadgeComponent status={appointment.status} /></div>
                </div>
                <div className="space-y-1">
                    <Label htmlFor="status-select" className="text-xs font-semibold uppercase text-muted-foreground">{t("detail.updateStatusTo", {defaultValue: "Update status to"})}</Label>
                    <Select value={currentStatus} onValueChange={setCurrentStatus}>
                    <SelectTrigger id="status-select" className="w-full">
                        <SelectValue placeholder={t("detail.selectStatus", {defaultValue: "Select status"})} />
                    </SelectTrigger>
                    <SelectContent>
                        {statusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleStatusChange} disabled={isUpdatingStatus || currentStatus === appointment.status} className="w-full">
                {isUpdatingStatus ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Save className="mr-2 h-4 w-4" />
                )}
                {t("detail.saveStatus", {defaultValue: "Save Status"})}
                </Button>
                {error && currentStatus !== appointment.status && <p className="text-xs text-destructive mt-1">{error}</p>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}