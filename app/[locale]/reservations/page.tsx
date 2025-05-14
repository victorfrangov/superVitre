"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { motion } from "framer-motion"
import { format, addDays, startOfWeek, addWeeks, isSameDay, isBefore } from "date-fns"
import { Calendar, Clock, ArrowLeft, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import NavigationBar from "@/components/navigation-bar";

import { collection, addDoc, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from '@/app/firebase/config';

// Mock data for available time slots
const generateMockTimeSlots = (date: Date) => {
  // Generate random availability for demonstration
  const day = date.getDay()

  // No slots on Sundays
  if (day === 0) return []

  // Create time slots from 9:00 AM to 4:00 PM in 30-minute increments
  const timeSlots = [
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
  ]

  // Fewer slots on Saturday
  const slots = day === 6 ? timeSlots.slice(0, 6) : timeSlots

  // Randomly mark some slots as unavailable
  return slots.map((time) => ({
    time,
    available: Math.random() > 0.3, // 70% chance of being available
  }))
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
    serviceType: "standard",
    windows: "1",
    stories: "1",
    specialInstructions: "",
    preferredContact: "email",
  })
  const [isSubmitting, setIsSubmitting] = useState(false); // Add a state for submission status
  const [submissionError, setSubmissionError] = useState<string | null>(null); // Add a state for submission error

  // Generate a 4-week calendar starting from the current week
  const today = new Date()
  const startDate = startOfWeek(currentMonth, { weekStartsOn: 1 }) // Start on Monday

  const calendarDays = Array.from({ length: 28 }, (_, i) => {
    const date = addDays(startDate, i)
    return {
      date,
      isToday: isSameDay(date, today),
      isPast: isBefore(date, today) && !isSameDay(date, today),
      timeSlots: generateMockTimeSlots(date),
    }
  })

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setSelectedTime(null)
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

  const handleRadioChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionError(null);

    // Manual validation for required fields
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
    ];

    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim() === "") {
        setSubmissionError(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
        setIsSubmitting(false);
        return;
      }
    }

    if (!selectedDate || !selectedTime) {
      setSubmissionError("Please select a date and time.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Temporary prices for services
      const servicePrices: Record<string, number> = {
        basic: 50,
        standard: 100,
        premium: 150,
      };

      const price = servicePrices[formData.serviceType] || 0;

      const reservationData = {
        ...formData,
        selectedDate: selectedDate.toISOString(), // Store date as ISO string
        selectedTime,
        bookingReference,
        status: "pending", // Default status
        submittedAt: new Date().toISOString(),
        price, // Add price to reservation data
      };

      // Add reservation to the "reservations" collection
      await addDoc(collection(db, "reservations"), reservationData);

      // Add or update customer in the "customers" collection
      const customerRef = doc(db, "customers", formData.email); // Use email as the document ID
      const customerSnapshot = await getDoc(customerRef);

      if (customerSnapshot.exists()) {
        // Update existing customer
        const customerData = customerSnapshot.data();
        await updateDoc(customerRef, {
          totalSpent: (customerData.totalSpent || 0) + price,
          lastService: selectedDate.toISOString(),
        });
      } else {
        // Create new customer
        const newCustomerData = {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
          totalSpent: price,
          lastService: selectedDate.toISOString(),
          createdAt: new Date().toISOString()
        };
        await setDoc(customerRef, newCustomerData);
      }

      // Move to confirmation step
      setStep(3);
    } catch (error) {
      console.error("Error adding document: ", error);
      setSubmissionError("Failed to submit reservation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToStep = (newStep: number) => {
    if (newStep === 2 && !selectedDate && !selectedTime) return
    setStep(newStep)
  }

  // Generate a mock booking reference
  const bookingReference = `WC${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}`

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
                <div className="mb-8">
                  <h1 className="text-3xl font-bold tracking-tight text-center mb-2">{t("title")}</h1>
                  <p className="text-center text-muted-foreground">{t("subtitle")}</p>
                </div>

                {/* Progress steps */}
                <div className="flex mb-8">
                  <div className="flex-1 bg-background border rounded-l-lg p-4 flex items-center justify-center gap-2 font-medium bg-primary/5">
                    <Calendar className="size-5" />
                    <span>Select Date & Time</span>
                  </div>
                  <div className="flex-1 bg-background border-t border-b border-r p-4 flex items-center justify-center gap-2 text-muted-foreground">
                    <span>2</span>
                    <span>Your Details</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Date selection */}
                  <div className="bg-background border rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-1">Select a Date</h2>
                    <p className="text-muted-foreground text-sm mb-4">Choose your preferred appointment date</p>

                    <div className="mb-4 flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePrevMonth}
                        disabled={isBefore(startDate, today)}
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

                      {calendarDays.slice(0, 35).map((day, i) => (
                        <div key={i} className="p-0">
                          <button
                            className={`w-full aspect-square rounded-md flex items-center justify-center text-sm
                  ${day.isPast ? "text-muted-foreground/50 cursor-not-allowed" : ""}
                  ${
                    isSameDay(day.date, selectedDate as Date)
                      ? "bg-primary text-primary-foreground"
                      : day.timeSlots.length > 0
                        ? "hover:bg-muted"
                        : "text-muted-foreground/50"
                  }
                  ${day.isToday ? "border border-primary" : ""}
                `}
                            onClick={() => !day.isPast && day.timeSlots.length > 0 && handleDateSelect(day.date)}
                            disabled={day.isPast || day.timeSlots.length === 0}
                          >
                            {format(day.date, "d")}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Time selection */}
                  <div className="bg-background border rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-1">Select a Time</h2>
                    {selectedDate ? (
                      <>
                        <p className="text-muted-foreground text-sm mb-4">
                          Available time slots for {format(selectedDate, "MMMM d, yyyy")}
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                          {calendarDays
                            .find((day) => isSameDay(day.date, selectedDate))
                            ?.timeSlots.map((slot, i) => (
                              <Button
                                key={i}
                                variant={selectedTime === slot.time ? "default" : "outline"}
                                className={`justify-start h-12 ${!slot.available ? "opacity-50" : ""}`}
                                onClick={() => slot.available && handleTimeSelect(slot.time)}
                                disabled={!slot.available}
                              >
                                <Clock className="mr-2 size-4" />
                                {slot.time}
                              </Button>
                            ))}
                        </div>

                        <Button className="w-full mt-6" onClick={() => goToStep(2)} disabled={!selectedTime}>
                          Continue to Details
                        </Button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        <Calendar className="size-10 mb-2 opacity-20" />
                        <p>Please select a date first</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-start">
                  <Button variant="outline" asChild size="sm">
                    <Link href="/">
                      <ArrowLeft className="mr-2 size-4" />
                      Back to Home
                    </Link>
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Contact Information */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold tracking-tight text-center mb-2">{t("title")}</h1>
                  <p className="text-center text-muted-foreground">{t("subtitle")}</p>
                </div>

                {/* Progress steps */}
                <div className="flex mb-8">
                  <div className="flex-1 bg-background border rounded-l-lg p-4 flex items-center justify-center gap-2 text-muted-foreground">
                    <span>1</span>
                    <span>Select Date & Time</span>
                  </div>
                  <div className="flex-1 bg-background border p-4 flex items-center justify-center gap-2 font-medium bg-primary/5">
                    <Clock className="size-5" />
                    <span>Your Details</span>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>{t("contactInfo")}</CardTitle>
                    <CardDescription>
                      {selectedDate && selectedTime && (
                        <span>
                          Booking for: <strong>{format(selectedDate, "EEEE, MMMM d, yyyy")}</strong> at{" "}
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
                              <Label htmlFor="Basic">{t("form.serviceTypes.basic")}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Standard" id="Standard" />
                              <Label htmlFor="Standard">{t("form.serviceTypes.standard")}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Premium" id="Premium" />
                              <Label htmlFor="Premium">{t("form.serviceTypes.premium")}</Label>
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
                      {isSubmitting ? "Submitting..." : t("buttons.submit")}
                    </Button>
                  </CardFooter>
                  {submissionError && <p className="text-red-500 text-sm mt-2 text-center">{submissionError}</p>}
                </Card>
              </motion.div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold tracking-tight text-center mb-2">{t("confirmation.title")}</h1>
                  <p className="text-center text-muted-foreground">{t("subtitle")}</p>
                </div>

                {/* Progress steps */}
                <div className="flex mb-8">
                  <div className="flex-1 bg-background border rounded-l-lg p-4 flex items-center justify-center gap-2 text-muted-foreground">
                    <span>1</span>
                    <span>Select Date & Time</span>
                  </div>
                  <div className="flex-1 bg-background border p-4 flex items-center justify-center gap-2 text-muted-foreground">
                    <span>2</span>
                    <span>Your Details</span>
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
                        Return to Home
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
