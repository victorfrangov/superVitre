"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { motion } from "framer-motion"
import { format, addDays, startOfWeek, addWeeks, isSameDay, isBefore } from "date-fns"
import {
  Calendar,
  Clock,
  ArrowLeft,
  ArrowRight,
  Home,
  Building2,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

// Mock data for available time slots
const generateMockTimeSlots = (date: Date) => {
  // Generate random availability for demonstration
  const day = date.getDay()

  // No slots on Sundays
  if (day === 0) return []

  // Fewer slots on Saturday
  const slots =
    day === 6 ? ["09:00", "10:00", "11:00"] : ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"]

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
    windows: "",
    stories: "1",
    specialInstructions: "",
    preferredContact: "email",
  })

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In the future, this would connect to Firebase
    // For now, just move to confirmation step
    setStep(3)
  }

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
                <div className="w-full border-t border-border"></div>
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
                <Card>
                  <CardHeader>
                    <CardTitle>{t("calendar.selectDate")}</CardTitle>
                    <CardDescription>{t("instructions")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Calendar navigation */}
                      <div className="flex items-center justify-between mb-4">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handlePrevMonth}
                          disabled={isBefore(startDate, today)}
                        >
                          <ChevronLeft className="size-4" />
                          <span className="sr-only">Previous month</span>
                        </Button>
                        <h3 className="text-lg font-medium">{format(startDate, "MMMM yyyy")}</h3>
                        <Button variant="outline" size="icon" onClick={handleNextMonth}>
                          <ChevronRight className="size-4" />
                          <span className="sr-only">Next month</span>
                        </Button>
                      </div>

                      {/* Calendar grid */}
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                          <div key={day} className="py-2 text-sm font-medium text-muted-foreground">
                            {day}
                          </div>
                        ))}

                        {calendarDays.map((day, i) => (
                          <div key={i} className="p-1">
                            <button
                              className={`w-full aspect-square rounded-md flex items-center justify-center text-sm
                                ${day.isPast ? "text-muted-foreground opacity-50 cursor-not-allowed" : ""}
                                ${isSameDay(day.date, selectedDate as Date) ? "bg-primary text-primary-foreground" : "hover:bg-muted"}
                                ${day.isToday ? "border border-primary" : ""}
                                ${day.timeSlots.length === 0 ? "text-muted-foreground" : ""}
                              `}
                              onClick={() => !day.isPast && day.timeSlots.length > 0 && handleDateSelect(day.date)}
                              disabled={day.isPast || day.timeSlots.length === 0}
                            >
                              {format(day.date, "d")}
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Time slots */}
                      {selectedDate && (
                        <div className="mt-6">
                          <h4 className="text-sm font-medium mb-3">{t("calendar.selectTime")}</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="col-span-2 sm:col-span-4">
                              <Badge variant="outline" className="mb-2">
                                {format(selectedDate, "EEEE, MMMM d, yyyy")}
                              </Badge>
                            </div>

                            <div className="col-span-2">
                              <h5 className="text-xs font-medium mb-2 text-muted-foreground">
                                {t("calendar.morning")}
                              </h5>
                              <div className="grid grid-cols-2 gap-2">
                                {calendarDays
                                  .find((day) => isSameDay(day.date, selectedDate))
                                  ?.timeSlots.filter((slot) => Number.parseInt(slot.time.split(":")[0]) < 12)
                                  .map((slot, i) => (
                                    <Button
                                      key={i}
                                      variant={selectedTime === slot.time ? "default" : "outline"}
                                      className="text-sm"
                                      onClick={() => slot.available && handleTimeSelect(slot.time)}
                                      disabled={!slot.available}
                                    >
                                      {slot.time}
                                    </Button>
                                  ))}
                              </div>
                            </div>

                            <div className="col-span-2">
                              <h5 className="text-xs font-medium mb-2 text-muted-foreground">
                                {t("calendar.afternoon")}
                              </h5>
                              <div className="grid grid-cols-2 gap-2">
                                {calendarDays
                                  .find((day) => isSameDay(day.date, selectedDate))
                                  ?.timeSlots.filter((slot) => Number.parseInt(slot.time.split(":")[0]) >= 12)
                                  .map((slot, i) => (
                                    <Button
                                      key={i}
                                      variant={selectedTime === slot.time ? "default" : "outline"}
                                      className="text-sm"
                                      onClick={() => slot.available && handleTimeSelect(slot.time)}
                                      disabled={!slot.available}
                                    >
                                      {slot.time}
                                    </Button>
                                  ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" asChild>
                      <Link href="/">
                        <ArrowLeft className="mr-2 size-4" />
                        Back to Home
                      </Link>
                    </Button>
                    <Button onClick={() => goToStep(2)} disabled={!selectedDate || !selectedTime}>
                      {t("buttons.next")}
                      <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Contact Information */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
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
                          <Label htmlFor="firstName">{t("form.firstName")}</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">{t("form.lastName")}</Label>
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
                          <Label htmlFor="email">{t("form.email")}</Label>
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
                          <Label htmlFor="phone">{t("form.phone")}</Label>
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
                        <Label htmlFor="address">{t("form.address")}</Label>
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
                          <Label htmlFor="city">{t("form.city")}</Label>
                          <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">{t("form.zipCode")}</Label>
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
                        <h3 className="text-lg font-medium">{t("serviceDetails")}</h3>

                        <div className="space-y-2">
                          <Label>{t("form.propertyType")}</Label>
                          <RadioGroup
                            defaultValue={formData.propertyType}
                            onValueChange={(value) => handleRadioChange("propertyType", value)}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="residential" id="residential" />
                              <Label htmlFor="residential" className="flex items-center">
                                <Home className="mr-2 size-4" />
                                {t("form.propertyTypes.residential")}
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="commercial" id="commercial" />
                              <Label htmlFor="commercial" className="flex items-center">
                                <Building2 className="mr-2 size-4" />
                                {t("form.propertyTypes.commercial")}
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label>{t("form.serviceType")}</Label>
                          <RadioGroup
                            defaultValue={formData.serviceType}
                            onValueChange={(value) => handleRadioChange("serviceType", value)}
                            className="grid grid-cols-1 sm:grid-cols-3 gap-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="basic" id="basic" />
                              <Label htmlFor="basic">{t("form.serviceTypes.basic")}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="standard" id="standard" />
                              <Label htmlFor="standard">{t("form.serviceTypes.standard")}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="premium" id="premium" />
                              <Label htmlFor="premium">{t("form.serviceTypes.premium")}</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="windows">{t("form.windows")}</Label>
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
                            <Label htmlFor="stories">{t("form.stories")}</Label>
                            <Select
                              name="stories"
                              value={formData.stories}
                              onValueChange={(value) => handleRadioChange("stories", value)}
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
                          <Label>{t("form.preferredContact")}</Label>
                          <RadioGroup
                            defaultValue={formData.preferredContact}
                            onValueChange={(value) => handleRadioChange("preferredContact", value)}
                            className="flex space-x-4"
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
                    <Button onClick={handleSubmit}>{t("buttons.submit")}</Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
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
