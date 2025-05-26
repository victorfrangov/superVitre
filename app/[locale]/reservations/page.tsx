"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { motion } from "framer-motion"
import { format, addDays, startOfWeek, addWeeks, isSameDay, isBefore, parse, getHours } from "date-fns"
import { Calendar, Clock, ArrowLeft, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import NavigationBar from "@/components/navigation-bar"

import { collection, addDoc, doc, setDoc, getDoc, updateDoc, query, where, getDocs } from "firebase/firestore"
import { ref, uploadBytes } from "firebase/storage"
import { db, clientStorage } from "@/app/firebase/config"

interface Reservation {
  id?: string
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
  specialInstructions: string
  preferredContact: string
  selectedDate: string // YYYY-MM-DD format
  selectedTime: string // "h:mm a" format (e.g., "9:00 AM")
  bookingReference: string
  status: string
  submittedAt: string // YYYY-MM-DD format
  price: number
  specialInstructionsImageUrls?: string[];
}

// Generates hourly time slots for a given date
const generateHourlyTimeSlots = (date: Date): string[] => {
  const dayOfWeek = date.getDay() // Sunday = 0, Saturday = 6

  if (dayOfWeek === 0) return [] // No slots on Sunday

  const slots: string[] = []
  const startHour = 9
  // Saturday: 9 AM, 10 AM, 11 AM. Other weekdays: 9 AM - 4 PM.
  const endHour = dayOfWeek === 6 ? 11 : 16 // Hours are 0-23. 16 means up to 4:xx PM.

  for (let hour = startHour; hour <= endHour; hour++) {
    const slotTime = new Date(date)
    slotTime.setHours(hour, 0, 0, 0)
    slots.push(format(slotTime, "h:mm a"))
  }
  return slots
}

export default function ReservationsPage() {
  const t = useTranslations("reservations")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    propertyType: "residential",
    serviceType: "Standard",
    windows: "1",
    stories: "1",
    specialInstructions: "",
    preferredContact: "email",
  })
  const [specialInstructionsImages, setSpecialInstructionsImages] = useState<File[]>([]) // Changed to File[]
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoadingReservations, setIsLoadingReservations] = useState(true)

  // Fetch reservations for the current 28-day view
  useEffect(() => {
    const fetchReservationsForView = async () => {
      setIsLoadingReservations(true)
      const viewStartDate = startOfWeek(currentMonth, { weekStartsOn: 1 })
      const viewEndDate = addDays(viewStartDate, 27) // 28 days in view

      const q = query(
        collection(db, "reservations"),
        where("selectedDate", ">=", format(viewStartDate, "yyyy-MM-dd")),
        where("selectedDate", "<=", format(viewEndDate, "yyyy-MM-dd"))
      )

      try {
        const querySnapshot = await getDocs(q)
        const fetchedReservations = querySnapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Reservation)
        )
        setReservations(fetchedReservations)
      } catch (error) {
        console.error("Error fetching reservations: ", error)
        setSubmissionError("Failed to load existing appointments. Please try refreshing.")
      } finally {
        setIsLoadingReservations(false)
      }
    }
    fetchReservationsForView()
  }, [currentMonth])

  const calendarDays = useMemo(() => {
    const today = new Date()
    const startDate = startOfWeek(currentMonth, { weekStartsOn: 1 })
    const SERVICE_DURATION = 4; // Define service duration in hours

    return Array.from({ length: 28 }, (_, i) => {
      const date = addDays(startDate, i)
      const dateStrYYYYMMDD = format(date, "yyyy-MM-dd")

      const reservationsForThisDay = reservations.filter((r) => r.selectedDate === dateStrYYYYMMDD)
      const baseSlots = generateHourlyTimeSlots(date)

      const timeSlots = baseSlots.map((slotStr) => {
        const slotDateTime = parse(slotStr, "h:mm a", new Date(date))
        const currentSlotHour = getHours(slotDateTime)
        let isAvailable = true

        // Check against existing reservations for blocking
        for (const res of reservationsForThisDay) {
          const resSlotDateTime = parse(res.selectedTime, "h:mm a", new Date(date))
          const bookedHour = getHours(resSlotDateTime)
          
          if (currentSlotHour < bookedHour + SERVICE_DURATION &&
              currentSlotHour + SERVICE_DURATION > bookedHour) {
            isAvailable = false
            break
          }
        }

        // Check if the slot itself is in the past
        if (isAvailable && isBefore(slotDateTime, new Date())) {
          isAvailable = false
        }

        return { time: slotStr, available: isAvailable }
      })

      return {
        date,
        isToday: isSameDay(date, today),
        isPast: isBefore(date, today) && !isSameDay(date, today),
        timeSlots: timeSlots // Array of { time: string, available: boolean }
      }
    })
  }, [currentMonth, reservations])

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime(null) // Reset time when date changes
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
  }

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => addWeeks(prev, -4))
  }

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addWeeks(prev, 4))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Append new files to the existing array
      setSpecialInstructionsImages(prevImages => [...prevImages, ...Array.from(e.target.files!)])
    }
  }

  const handleRadioChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmissionError(null)

    const requiredFields: Array<keyof typeof formData> = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "city",
      "zipCode",
      "serviceType",
      "windows",
      "stories",
      "preferredContact",
    ]

    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim() === "") {
        setSubmissionError(`Please fill in the ${field.replace(/([A-Z])/g, " $1").toLowerCase()} field.`)
        setIsSubmitting(false)
        return
      }
    }

    if (!selectedDate || !selectedTime) {
      setSubmissionError("Please select a date and time.")
      setIsSubmitting(false)
      return
    }

    // Double check availability before submitting (optional, client-side check)
    const dayData = calendarDays.find(d => d.date && selectedDate && isSameDay(d.date, selectedDate));
    const slotData = dayData?.timeSlots.find(s => s.time === selectedTime);
    if (!slotData?.available) {
        setSubmissionError("The selected time slot is no longer available. Please choose another time.");
        setIsSubmitting(false);
        return;
    }

    try {
      const servicePrices: Record<string, number> = {
        Basic: 50,
        Standard: 100,
        Premium: 150,
      }
      const price = servicePrices[formData.serviceType] || 0

      const imageUrls: string[] = []
      if (specialInstructionsImages.length > 0) {
        for (const imageFile of specialInstructionsImages) {
          const imageRef = ref(clientStorage, `reservation_instructions/${bookingReference}/${imageFile.name}`)
          try {
            await uploadBytes(imageRef, imageFile)
          } catch (uploadError) {
            setSubmissionError(`Failed to upload image ${imageFile.name}. Please try again or submit without it.`)
            setIsSubmitting(false);
            return;
          }
        }
      }

      const reservationData: Reservation = {
        ...formData,
        selectedDate: format(selectedDate, "yyyy-MM-dd"), // Store date as YYYY-MM-DD
        selectedTime,
        bookingReference, // Ensure bookingReference is defined in your component
        status: "pending",
        submittedAt: format(new Date(), "yyyy-MM-dd"), // Store submission date as YYYY-MM-DD
        price,
        specialInstructionsImageUrls: imageUrls, // Store array of URLs
      }

      await addDoc(collection(db, "reservations"), reservationData)

      const customerRef = doc(db, "customers", formData.email)
      const customerSnapshot = await getDoc(customerRef)

      if (customerSnapshot.exists()) {
        const customerData = customerSnapshot.data()
        await updateDoc(customerRef, {
          totalSpent: (customerData.totalSpent || 0) + price,
          lastServiceDate: format(selectedDate, "yyyy-MM-dd"), // Store as YYYY-MM-DD
          lastServiceTime: selectedTime,
        })
      } else {
        const newCustomerData = {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
          totalSpent: price,
          lastServiceDate: format(selectedDate, "yyyy-MM-dd"), // Store as YYYY-MM-DD
          lastServiceTime: selectedTime,
          createdAt: format(new Date(), "yyyy-MM-dd"),
        }
        await setDoc(customerRef, newCustomerData)
      }
      
      // Manually add the new reservation to the local state to update UI immediately
      // or re-fetch. For simplicity, adding locally:
      setReservations(prevReservations => [...prevReservations, {...reservationData, id: "temp-" + Date.now()}]);


      setStep(3)
    } catch (error) {
      console.error("Error adding document: ", error)
      setSubmissionError("Failed to submit reservation. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const goToStep = (newStep: number) => {
    if (newStep === 2 && !selectedDate && !selectedTime) return
    setStep(newStep)
  }

  // Generate a mock booking reference
  const bookingReference = `SV${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(7, "0")}`

  return (
    <div className="flex min-h-screen flex-col">
      <NavigationBar />
      <main className="flex-1 py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="text-center space-y-3">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
              <p className="text-muted-foreground">{t("subtitle")}</p>
            </div>

            {/* Progress indicator */}
            <div className="relative mb-12">
              <div className="absolute inset-0 flex items-center">
              </div>
              <div className="relative flex justify-between">
                <div className="flex items-center">
                  <div
                    className={`size-10 flex items-center justify-center rounded-full ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    <Calendar className="size-5" />
                  </div>
                  <span className="ml-2 text-sm font-medium hidden sm:inline">{t("calendar.selectDate")}</span>
                </div>
                <div className="flex items-center">
                  <div
                    className={`size-10 flex items-center justify-center rounded-full ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    <Clock className="size-5" />
                  </div>
                  <span className="ml-2 text-sm font-medium hidden sm:inline">{t("contactInfo")}</span>
                </div>
                <div className="flex items-center">
                  <div
                    className={`size-10 flex items-center justify-center rounded-full ${step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    <CheckCircle2 className="size-5" />
                  </div>
                  <span className="ml-2 text-sm font-medium hidden sm:inline">{t("confirmation.title")}</span>
                </div>
              </div>
            </div>

            {/* Step 1: Date and Time Selection */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                {/* Progress steps */}
                <div className="flex mb-8">
                  <div className="flex-1 bg-background border rounded-l-lg p-4 flex items-center justify-center gap-2 font-medium bg-primary/5">
                    <Calendar className="size-5" />
                    <span>{t("selectMoment")}</span>
                  </div>
                  <div className="flex-1 bg-background border-t border-b border-r p-4 flex items-center justify-center gap-2 text-muted-foreground">
                    <span>2</span>
                    <span>{t("contactInfo")}</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Date selection */}
                  <div className="bg-background border rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-1">{t("calendar.selectDate")}</h2>
                    <p className="text-muted-foreground text-sm mb-4">{t("calendar.chooseDatePrompt")}</p>

                    <div className="mb-4 flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePrevMonth}
                        disabled={isBefore(startOfWeek(currentMonth, { weekStartsOn: 1 }), new Date()) && !isSameDay(startOfWeek(currentMonth, { weekStartsOn: 1 }), new Date())}
                      >
                        <ChevronLeft className="size-4" />
                      </Button>
                      <h3 className="text-base font-medium">{format(currentMonth, "MMMM yyyy")}</h3>
                      <Button variant="ghost" size="icon" onClick={handleNextMonth}>
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center">
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                        <div key={day} className="py-1 text-xs font-medium text-muted-foreground">
                          {day}
                        </div>
                      ))}

                      {calendarDays.map((day, i) => (
                        <div key={i} className="p-0">
                          <button
                            className={`w-full aspect-square rounded-md flex items-center justify-center text-sm
                                ${day.isPast || !day.timeSlots.some(ts => ts.available) ? "text-muted-foreground/50 cursor-not-allowed" : ""}
                                ${selectedDate && isSameDay(day.date, selectedDate) ? "bg-primary text-primary-foreground" : day.timeSlots.some(ts => ts.available) ? "hover:bg-muted" : "text-muted-foreground/50"}
                                ${day.isToday ? "border border-primary" : ""}`}
                            onClick={() => !day.isPast && day.timeSlots.some(ts => ts.available) && handleDateSelect(day.date)}
                            disabled={day.isPast || !day.timeSlots.some(ts => ts.available)}
                          >
                            {format(day.date, "d")}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Time selection */}
                  <div className="bg-background border rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-1">{t("calendar.selectTime")}</h2>
                    {selectedDate ? (
                      <>
                        <p className="text-muted-foreground text-sm mb-4">
                          {t("calendar.availableSlotsPrompt")} {format(selectedDate, "MMMM d, yyyy")}
                        </p>
                        {isLoadingReservations && (
                          <div className="flex justify-center items-center h-64">
                            <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <p className="ml-4 text-muted-foreground">{t("calendar.loadingSlots")}</p>
                          </div>
                        )}
                        {!isLoadingReservations && (
                          <div className="grid grid-cols-2 gap-3">
                            {calendarDays
                              .find((day) => selectedDate && isSameDay(day.date, selectedDate))
                              ?.timeSlots.map((slot, i) => (
                                <Button
                                  key={i}
                                  variant={selectedTime === slot.time ? "default" : "outline"}
                                  className={`justify-start h-12 ${!slot.available ? "opacity-50 cursor-not-allowed" : ""}`}
                                  onClick={() => slot.available && handleTimeSelect(slot.time)}
                                  disabled={!slot.available}
                                >
                                  <Clock className="mr-2 size-4" />
                                  {slot.time}
                                </Button>
                              ))}
                            {calendarDays.find((day) => selectedDate && isSameDay(day.date, selectedDate))?.timeSlots.every(slot => !slot.available) && (
                                <p className="col-span-2 text-center text-muted-foreground py-4">{t("calendar.noTimesAvailable")}</p>
                            )}
                          </div>
                        )}
                        <Button className="w-full mt-6" onClick={() => goToStep(2)} disabled={!selectedTime}>
                          {t("buttons.continueToDetails")}
                        </Button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        <Calendar className="size-10 mb-2 opacity-20" />
                        <p>{t("calendar.selectDatePrompt")}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-start">
                  <Button variant="outline" asChild size="sm">
                    <Link href="/">
                      <ArrowLeft className="mr-2 size-4" />
                      {t("buttons.backToHome")}
                    </Link>
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Contact Information */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <div className="flex mb-8">
                  <div className="flex-1 bg-background border rounded-l-lg p-4 flex items-center justify-center gap-2 text-muted-foreground">
                    <span>1</span>
                    <span>{t("selectMoment")}</span>
                  </div>
                  <div className="flex-1 bg-background border p-4 flex items-center justify-center gap-2 font-medium bg-primary/5">
                    <Clock className="size-5" />
                    <span>{t("contactInfo")}</span>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>{t("contactInfo")}</CardTitle>
                    <CardDescription>
                      {selectedDate && selectedTime && (
                        <span>
                          {t("form.reservationPour")} <strong>{format(selectedDate, "EEEE, MMMM d, yyyy")}</strong> at{" "}
                          <strong>{selectedTime}</strong>
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">{t("form.firstName")} <span className="text-destructive">*</span></Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">{t("form.lastName")} <span className="text-destructive">*</span></Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">{t("form.email")} <span className="text-destructive">*</span></Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">{t("form.phone")} <span className="text-destructive">*</span></Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">{t("form.address")} <span className="text-destructive">*</span></Label>
                        <Input
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">{t("form.city")} <span className="text-destructive">*</span></Label>
                          <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">{t("form.zipCode")} <span className="text-destructive">*</span></Label>
                          <Input
                            id="zipCode"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="mb-4">
                          <h3 className="text-xl font-bold tracking-tight">{t("serviceDetails")}</h3>
                          <p className="text-base text-muted-foreground">{t("serviceSubtitle")}</p>
                        </div>
                        <div className="space-y-2">
                          <Label>{t("form.serviceType")} <span className="text-destructive">*</span></Label>
                          <RadioGroup
                            defaultValue={formData.serviceType}
                            onValueChange={(value) => handleRadioChange("serviceType", value)}
                            className="grid grid-cols-1 sm:grid-cols-3 gap-2"
                            required
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Basic" id="Basic" />
                              <Label htmlFor="Basic">{t("form.serviceTypes.Basic")}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Standard" id="Standard" />
                              <Label htmlFor="Standard">{t("form.serviceTypes.Standard")}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Premium" id="Premium" />
                              <Label htmlFor="Premium">{t("form.serviceTypes.Premium")}</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="windows">{t("form.windows")} <span className="text-destructive">*</span></Label>
                            <Input
                              id="windows"
                              name="windows"
                              type="number"
                              min="1"
                              value={formData.windows}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="stories">{t("form.stories")} <span className="text-destructive">*</span></Label>
                            <Select
                              name="stories"
                              value={formData.stories}
                              onValueChange={(value) => handleRadioChange("stories", value)}
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select number of stories" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1</SelectItem>
                                <SelectItem value="2">2</SelectItem>
                                <SelectItem value="3">3</SelectItem>
                                <SelectItem value="4+">4+</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="specialInstructions">{t("form.specialInstructions")}</Label>
                          <Textarea
                            id="specialInstructions"
                            name="specialInstructions"
                            value={formData.specialInstructions}
                            onChange={handleInputChange}
                            rows={3}
                          />
                        </div>

                        {/* New Image Upload Field */}
                        <div className="space-y-2">
                          <Label htmlFor="specialInstructionsImage">{t("form.specialInstructionsImageLabel")}</Label>
                          <Input
                            id="specialInstructionsImage"
                            name="specialInstructionsImage"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className="pt-2"
                          />
                          {specialInstructionsImages.length > 0 && (
                            <div className="mt-2 space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">
                                {t("form.selectedImage", { count: specialInstructionsImages.length })}
                              </p>
                              <ul className="list-disc list-inside text-sm text-muted-foreground">
                                {specialInstructionsImages.map((file, index) => (
                                  <li key={index}>{file.name}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>{t("form.preferredContact")} <span className="text-destructive">*</span></Label>
                          <RadioGroup
                            defaultValue={formData.preferredContact}
                            onValueChange={(value) => handleRadioChange("preferredContact", value)}
                            className="flex space-x-4"
                            required
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="email" id="contact-email" />
                              <Label htmlFor="contact-email">{t("form.contactMethods.email")}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="phone" id="contact-phone" />
                              <Label htmlFor="contact-phone">{t("form.contactMethods.phone")}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="text" id="contact-text" />
                              <Label htmlFor="contact-text">{t("form.contactMethods.text")}</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => goToStep(1)}>
                      <ArrowLeft className="mr-2 size-4" />
                      {t("buttons.previous")}
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                      {isSubmitting ? t("buttons.submitting") : t("buttons.submit")}
                    </Button>
                  </CardFooter>
                  {submissionError && <p className="text-red-500 text-sm mt-2 text-center">{submissionError}</p>}
                </Card>
              </motion.div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

                {/* Progress steps */}
                <div className="flex mb-8">
                  <div className="flex-1 bg-background border rounded-l-lg p-4 flex items-center justify-center gap-2 text-muted-foreground">
                    <span>1</span>
                    <span>{t("selectMoment")}</span>
                  </div>
                  <div className="flex-1 bg-background border p-4 flex items-center justify-center gap-2 text-muted-foreground">
                    <span>2</span>
                    <span>{t("contactInfo")}</span>
                  </div>
                </div>

                <Card className="text-center">
                  <CardHeader>
                    <div className="mx-auto size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <CheckCircle2 className="size-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{t("confirmation.title")}</CardTitle>
                    <CardDescription>{t("confirmation.message")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="text-xl font-bold border border-border rounded-md py-3 bg-muted/30">
                        <p>{t("confirmation.reference")}</p>
                        <p className="text-primary">{bookingReference}</p>
                      </div>

                      <div className="text-left border border-border rounded-md p-4">
                        <h3 className="font-medium mb-3">{t("confirmation.details")}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">{t("confirmation.date")}</span>
                            <p className="font-medium">
                              {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : ""}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t("confirmation.time")}</span>
                            <p className="font-medium">{selectedTime}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t("confirmation.service")}</span>
                            <p className="font-medium">{t(`form.serviceTypes.${formData.serviceType}`)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Name:</span>
                            <p className="font-medium">
                              {formData.firstName} {formData.lastName}
                            </p>
                          </div>
                        </div>
                      </div>

                      <p className="text-muted-foreground">{t("confirmation.contact")}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-center">
                    <Button asChild>
                      <Link href="/">
                        <ArrowLeft className="mr-2 size-4" />
                        {t("buttons.backToHome")}
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
