"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore"
import { db } from "@/app/firebase/config"
import { ArrowLeft, Mail, Phone, MessageSquare, User, Tag, Edit3, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface Contact {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  serviceType: string
  message: string
  status: "new" | "responded" | "closed" | string
  submittedAt: string | Timestamp // Can be ISO string or Firestore Timestamp
}

// Helper to format date
const formatDate = (dateString: string | Timestamp | undefined): string => {
  if (!dateString) return "N/A"
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString.toDate();
    // Check if dateString is just YYYY-MM-DD, if so, time might not be relevant or accurate
    if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    }
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) + " " + date.toLocaleTimeString();
  } catch (error) {
    console.error("Error formatting date:", dateString, error)
    return typeof dateString === 'string' ? dateString : "Invalid Date";
  }
}

export default function ContactDetailPage() {
  const params = useParams()
  const router = useRouter()
  const t = useTranslations("admin.contacts")

  const contactId = params.id as string
  const locale = params.locale as string

  const [contact, setContact] = useState<Contact | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentStatus, setCurrentStatus] = useState<string>("")
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  useEffect(() => {
    if (contactId) {
      const fetchContact = async () => {
        setIsLoading(true)
        setError(null)
        try {
          const contactRef = doc(db, "contacts", contactId)
          const contactSnap = await getDoc(contactRef)

          if (contactSnap.exists()) {
            const contactData = { id: contactSnap.id, ...contactSnap.data() } as Contact
            setContact(contactData)
            setCurrentStatus(contactData.status)
          } else {
            setError(t("detail.notFound", {defaultValue: "Contact not found."}))
          }
        } catch (err) {
          console.error("Error fetching contact:", err)
          setError(t("detail.errorFetching", {defaultValue: "Error fetching contact details."}))
        } finally {
          setIsLoading(false)
        }
      }
      fetchContact()
    }
  }, [contactId, t])

  const handleStatusChange = async () => {
    if (!contact || !currentStatus || currentStatus === contact.status) return

    setIsUpdatingStatus(true)
    setError(null); // Clear previous errors
    try {
      const contactRef = doc(db, "contacts", contact.id)
      await updateDoc(contactRef, {
        status: currentStatus,
      })
      setContact((prevContact) => prevContact ? { ...prevContact, status: currentStatus } : null)
      // Consider adding a success toast/message here
    } catch (err) {
      console.error("Error updating status:", err)
      setError(t("detail.errorUpdatingStatus", {defaultValue: "Failed to update status."}))
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">{t("loading")}</p>
      </div>
    )
  }

  if (error && !contact) { // Show error prominently if contact couldn't be loaded
    return (
      <div className="flex flex-col justify-center items-center h-screen text-destructive">
        <p>{error}</p>
        <Button onClick={() => router.push(`/${locale}/admin/contacts`)} className="mt-4">
          {t("detail.backToList", {defaultValue: "Back to Contacts List"})}
        </Button>
      </div>
    )
  }
  
  if (!contact) { // Fallback if contact is null after loading and no major error was set
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p>{t("detail.notFound", {defaultValue: "Contact not found."})}</p>
        <Button onClick={() => router.push(`/${locale}/admin/contacts`)} className="mt-4">
          {t("detail.backToList", {defaultValue: "Back to Contacts List"})}
        </Button>
      </div>
    )
  }

  const statusOptions = [
    { value: "new", label: t("status.new", {defaultValue: "New"}) },
    { value: "responded", label: t("status.responded", {defaultValue: "Responded"}) },
    { value: "closed", label: t("status.closed", {defaultValue: "Closed"}) },
  ];

  const getStatusLabel = (statusValue: string) => {
    return statusOptions.find(s => s.value === statusValue)?.label || statusValue;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t("detail.title", {defaultValue: "Contact Details"})}</h1>
        <Button variant="outline" onClick={() => router.push(`/${locale}/admin/contacts`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("detail.backToList", {defaultValue: "Back to Contacts List"})}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <User className="mr-2 h-5 w-5" /> {t("detail.contactInfo", {defaultValue: "Contact Information"})}
            </CardTitle>
            <CardDescription>
              {t("detail.submittedOn", {defaultValue: "Submitted on"})}: {formatDate(contact.submittedAt)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-start">
              <User className="mr-4 mt-1 h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <span className="font-medium">{contact.firstName} {contact.lastName}</span>
              </div>
            </div>
            <div className="flex items-start">
              <Mail className="mr-4 mt-1 h-4 w-4 text-muted-foreground flex-shrink-0" />
              <a href={`mailto:${contact.email}`} className="text-primary hover:underline break-all">
                {contact.email}
              </a>
            </div>
            {contact.phone && (
              <div className="flex items-start">
                <Phone className="mr-4 mt-1 h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span>{contact.phone}</span>
              </div>
            )}
            <div className="flex items-start">
              <Tag className="mr-4 mt-1 h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <span className="font-medium">{t("detail.serviceTypeLabel", {defaultValue: "Service Type"})}:</span> {contact.serviceType}
              </div>
            </div>
            <div className="flex items-center">
              <Label className="mr-2 text-muted-foreground">{t("table.status", {defaultValue: "Status"})}:</Label>
              <Badge variant={contact.status === "new" ? "default" : contact.status === "responded" ? "secondary" : "outline"}>
                {getStatusLabel(contact.status)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <MessageSquare className="mr-2 h-5 w-5" /> {t("detail.customerMessage", {defaultValue: "Customer Message"})}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={contact.message}
              readOnly
              className="min-h-[200px] lg:min-h-[calc(100%-4rem)] bg-muted/20 border p-4 rounded-md text-sm leading-relaxed"
              rows={10}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <Edit3 className="mr-2 h-5 w-5" /> {t("detail.manageStatus", {defaultValue: "Manage Status"})}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-grow w-full sm:w-auto">
            <Label htmlFor="status-select" className="mb-1 block text-sm font-medium">{t("detail.updateStatusTo", {defaultValue: "Update status to"})}</Label>
            <Select value={currentStatus} onValueChange={setCurrentStatus}>
              <SelectTrigger id="status-select" className="w-full md:w-[220px]">
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
          <Button onClick={handleStatusChange} disabled={isUpdatingStatus || currentStatus === contact.status} className="w-full sm:w-auto">
            {isUpdatingStatus ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {t("detail.saveStatus", {defaultValue: "Save Status"})}
          </Button>
        </CardContent>
        {error && currentStatus !== contact.status && <p className="px-6 pb-4 text-sm text-destructive">{error}</p>}
      </Card>
    </div>
  )
}