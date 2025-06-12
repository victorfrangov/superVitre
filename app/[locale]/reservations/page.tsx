"use client"

declare global {
  interface Window {
    grecaptcha?: any;
  }
}

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Link } from "@/i18n/navigation"
import { motion } from "framer-motion"
import { format, addDays, startOfWeek, addWeeks, isSameDay, isBefore, parse, getHours } from "date-fns"
import { Calendar, Clock, ArrowLeft, CheckCircle2, ChevronRight, ChevronLeft, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import NavigationBar from "@/components/navigation-bar"
import { useForm } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox"

import { collection, addDoc, query, where, getDocs } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
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
  windows: string
  stories: string
  includeInterior: boolean;
  specialInstructions: string
  preferredContact: string
  selectedDate: string
  selectedTime: string
  bookingReference: string
  status: string
  submittedAt: string
  estimatedPriceRange?: string;
  specialInstructionsImageUrls?: string[];
  locale?: string;
}

const MAX_IMAGES = 5; // Define the maximum number of images

// Generates hourly time slots for a given date
const generateHourlyTimeSlots = (date: Date): string[] => {
  const dayOfWeek = date.getDay() // Sunday = 0, Monday = 1, ..., Saturday = 6

  const slots: string[] = []
  const startHour = 10 // All days start at 10 AM

  let endHour;

  // Determine end hour based on contact page hours
  // Last slot should start one hour before closing if slots are 1hr.
  // The SERVICE_DURATION logic will handle blocking for longer services.
  if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
    endHour = 18
  } else { // Saturday (6) or Sunday (0)
    endHour = 16
  }

  for (let hour = startHour; hour <= endHour; hour++) {
    const slotTime = new Date(date)
    slotTime.setHours(hour, 0, 0, 0)
    slots.push(format(slotTime, "h:mm a"))
  }
  return slots
}

export default function ReservationsPage() {
  const t = useTranslations("reservations")
  const tPricing = useTranslations("pricing");
  const locale = useLocale(); // Get the current locale
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
    windows: "10",
    stories: "1",
    includeInterior: true,
    specialInstructions: "",
    preferredContact: "email",
  })
  const [specialInstructionsImages, setSpecialInstructionsImages] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [confirmedBookingReference, setConfirmedBookingReference] = useState<string | null>(null); 
  const [estimatedPrice, setEstimatedPrice] = useState<string | null>(null);

  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoadingReservations, setIsLoadingReservations] = useState(true)

  const { register, handleSubmit, formState: { errors } } = useForm<Reservation>();

  // Helper function to parse price strings like "X$ - Y$"
  const parsePriceRange = (priceString: string): { min: number; max: number } => {
    const parts = priceString.match(/(\d+)\$\s*-\s*(\d+)\$/);
    if (parts && parts.length === 3) {
      return { min: parseInt(parts[1], 10), max: parseInt(parts[2], 10) };
    }
    const singlePrice = priceString.match(/(\d+)\$/); // For cases like "X$"
    if (singlePrice && singlePrice.length === 2) {
      const val = parseInt(singlePrice[1], 10);
      return { min: val, max: val };
    }
    return { min: 0, max: 0 }; // Default or error
  };

  useEffect(() => {
    const numWindows = parseInt(formData.windows, 10);
    let numStories = formData.stories === "4+" ? 4 : parseInt(formData.stories, 10); // Treat "4+" as 4 for calculation

    if (isNaN(numWindows) || numWindows <= 0 || isNaN(numStories) || numStories <= 0) {
      setEstimatedPrice(null);
      return;
    }

    let minPricePerWindow: number;
    let maxPricePerWindow: number;

    if (formData.includeInterior) {
      // Interior & Exterior selected
      const smallWindowIntExtPriceString = tPricing("smallWindows.extIntPrice"); // e.g., "8$ - 12$"
      const largeWindowIntExtPriceString = tPricing("largeWindows.extIntPrice"); // e.g., "16$ - 20$"
      
      minPricePerWindow = parsePriceRange(smallWindowIntExtPriceString).min;
      maxPricePerWindow = parsePriceRange(largeWindowIntExtPriceString).max;
    } else {
      // Exterior Only selected
      const smallWindowExtPriceString = tPricing("smallWindows.extPrice"); // e.g., "5$ - 8$"
      const largeWindowExtPriceString = tPricing("largeWindows.extPrice"); // e.g., "8$ - 12$"

      minPricePerWindow = parsePriceRange(smallWindowExtPriceString).min;
      maxPricePerWindow = parsePriceRange(largeWindowExtPriceString).max;
    }

    let totalWindowMinCost = numWindows * minPricePerWindow;
    let totalWindowMaxCost = numWindows * maxPricePerWindow;

    let totalFloorMinCost = 0;
    let totalFloorMaxCost = 0;

    if (numStories > 1) {
      const extraFloors = numStories - 1;
      const floorPriceString = tPricing("extras.extraFloors.hiddenPrice"); // "20$ - 30$ par étage supplémentaire"
      const { min: floorMinPricePerExtra, max: floorMaxPricePerExtra } = parsePriceRange(floorPriceString);
      totalFloorMinCost = extraFloors * floorMinPricePerExtra;
      totalFloorMaxCost = extraFloors * floorMaxPricePerExtra;
    }

    const estimatedMinTotal = totalWindowMinCost + totalFloorMinCost;
    const estimatedMaxTotal = totalWindowMaxCost + totalFloorMaxCost;

    if (estimatedMinTotal > 0 || estimatedMaxTotal > 0) {
      // Ensure min is not greater than max if window count is low and ranges overlap significantly
      if (estimatedMinTotal > estimatedMaxTotal && numWindows === 1) { // Or some other logic for single window
         setEstimatedPrice(`$${Math.min(estimatedMinTotal, estimatedMaxTotal)} - $${Math.max(estimatedMinTotal, estimatedMaxTotal)}`);
      } else {
         setEstimatedPrice(`$${estimatedMinTotal} - $${estimatedMaxTotal}`);
      }
    } else {
      setEstimatedPrice(t("form.unableToEstimatePrice"));
    }
  }, [formData.windows, formData.stories, formData.includeInterior, tPricing, t]);


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
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      // Assuming the checkbox is for 'includeInterior'
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (specialInstructionsImages.length >= MAX_IMAGES) {
        setSubmissionError(t("form.maxImagesError", { count: MAX_IMAGES }));
        // Clear the file input value so the same files can't be "re-selected" immediately
        e.target.value = "";
        return;
      }

      const filesToAdd = Array.from(e.target.files);
      const remainingSlots = MAX_IMAGES - specialInstructionsImages.length;
      
      let newImages = filesToAdd;
      if (filesToAdd.length > remainingSlots) {
        newImages = filesToAdd.slice(0, remainingSlots);
        setSubmissionError(t("form.maxImagesReachedDuringSelection", { count: MAX_IMAGES }));
      }
      
      setSpecialInstructionsImages(prevImages => [...prevImages, ...newImages]);
      // Clear the file input value after processing to allow selecting the same file again if needed after removal (if you implement removal)
      e.target.value = ""; 
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    setSpecialInstructionsImages(prevImages => prevImages.filter((_, index) => index !== indexToRemove));
    // If an error message related to max images was shown, clear it as there's now space.
    if (submissionError?.includes(t("form.maxImagesError", { count: MAX_IMAGES })) || submissionError?.includes(t("form.maxImagesReachedDuringSelection", { count: MAX_IMAGES }))) {
      setSubmissionError(null);
    }
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmissionError(null)

    let recaptchaToken = null;

    if (typeof window !== 'undefined' && window.grecaptcha && process.env.NEXT_PUBLIC_SITE_CAPTCHA_ENTERPRISE_KEY) {
      try {
        await new Promise<void>((resolve, reject) => {
          window.grecaptcha.ready(() => {
            resolve();
          });
          setTimeout(() => {
            reject(new Error("reCAPTCHA ready timeout"));
          }, 5000);
        });
        
        recaptchaToken = await window.grecaptcha.execute(process.env.NEXT_PUBLIC_SITE_CAPTCHA_ENTERPRISE_KEY, { action: 'submit_reservation' });
        if (!recaptchaToken) {
          throw new Error("reCAPTCHA token was not generated.");
        }

        // ---- Verify token with backend ----
        const verificationResponse = await fetch('/api/recaptcha', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: recaptchaToken,
            recaptchaAction: "submit_reservation",
          }),
        });

        const verificationData = await verificationResponse.json();

        if (!verificationResponse.ok || !verificationData.success) {
          setSubmissionError(t("form.recaptchaVerificationFailed") + (verificationData.error ? `: ${verificationData.error}` : ''));
          setIsSubmitting(false);
          return;
        }
        // Optional: You could log verificationData.score or use it for further checks if needed
        console.log("reCAPTCHA verification successful, score:", verificationData.score);
        // ---- End verification ----

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setSubmissionError(t("form.recaptchaError") + (errorMessage ? `: ${errorMessage}` : ""));
        setIsSubmitting(false);
        return; 
      }
    } else {
      setSubmissionError(t("form.recaptchaNotReadyError")); 
      setIsSubmitting(false);
      return; 
    }

    const requiredFields: Array<keyof Omit<typeof formData, 'specialInstructions' | 'includeInterior' /* serviceType removed */>> = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "city",
      "zipCode",
      "windows",
      "stories",
      "preferredContact",
    ]

    for (const field of requiredFields) {
      if (!formData[field] || String(formData[field]).trim() === "") {
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

    const dayData = calendarDays.find(d => d.date && selectedDate && isSameDay(d.date, selectedDate));
    const slotData = dayData?.timeSlots.find(s => s.time === selectedTime);
    if (!slotData?.available) {
        setSubmissionError("The selected time slot is no longer available. Please choose another time.");
        setIsSubmitting(false);
        return;
    }

    // Generate bookingReference here, once per submission attempt
    const currentBookingReference = `SV${Math.floor(Math.random() * 100000000)
      .toString()
      .padStart(7, "0")}`;

    try {
      const imageUrls: string[] = []
      if (specialInstructionsImages.length > 0) {
        for (const imageFile of specialInstructionsImages) {
          const imageRef = ref(clientStorage, `reservation_instructions/${currentBookingReference}/${Date.now()}_${imageFile.name}`)
          try {
            const snapshot = await uploadBytes(imageRef, imageFile)
            const downloadUrl = await getDownloadURL(snapshot.ref);
            imageUrls.push(downloadUrl);
          } catch (uploadError) {
            setSubmissionError(t("form.imageUploadError"))
            setIsSubmitting(false);
            return;
          }
        }
      }

      const reservationData: Reservation = {
        ...formData,
        selectedDate: format(selectedDate!, "yyyy-MM-dd"),
        selectedTime: selectedTime!,
        bookingReference: currentBookingReference, 
        status: "pending",
        submittedAt: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        estimatedPriceRange: estimatedPrice || undefined,
        specialInstructionsImageUrls: imageUrls,
        locale: locale, 
      }

      await addDoc(collection(db, "reservations"), reservationData)
      
      setConfirmedBookingReference(currentBookingReference); // Store the confirmed reference in state
      
      setReservations(prevReservations => [...prevReservations, {...reservationData, id: "temp-" + Date.now()}]);

      setSpecialInstructionsImages([]); 
      setStep(3)
    } catch (error) {
      console.error("Error adding document: ", error)
      setSubmissionError(t("form.submitErrorGeneric"))
    } finally {
      setIsSubmitting(false)
    }
  }

  const goToStep = (newStep: number) => {
    if (newStep === 2 && !selectedDate && !selectedTime) return
    setStep(newStep)
  }

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
                <Card>
                  <CardHeader>
                    <CardTitle>{t("contactInfo")}</CardTitle>
                    <CardDescription>
                      {selectedDate && selectedTime && (
                        <span>
                          {t("form.reservationPour")} <strong>{format(selectedDate, "EEEE, MMMM d, yyyy")}</strong> {t("form.atTime")} <strong>{selectedTime}</strong>
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitForm} className="space-y-6">
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
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={t("form.selectStoriesPlaceholder")} />
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
                        
                        <div className="flex items-center space-x-2 mt-4">
                          <Checkbox
                            id="includeInterior"
                            name="includeInterior"
                            checked={formData.includeInterior}
                            onCheckedChange={(checked) => {
                              setFormData((prev) => ({ ...prev, includeInterior: Boolean(checked) }));
                            }}
                          />
                          <Label htmlFor="includeInterior" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            {t("form.includeInteriorLabel")}
                          </Label>
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
                          <Label htmlFor="specialInstructionsImage">{t("form.specialInstructionsImageLabel", { count: MAX_IMAGES })}</Label>
                          <Input
                            id="specialInstructionsImage"
                            name="specialInstructionsImage"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className="pt-2"
                            disabled={specialInstructionsImages.length >= MAX_IMAGES} // Disable input if limit reached
                          />
                          {specialInstructionsImages.length >= MAX_IMAGES && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {t("form.maxImagesError", { count: MAX_IMAGES })}
                            </p>
                          )}
                          {specialInstructionsImages.length > 0 && (
                            <div className="mt-2 space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">
                                {t("form.selectedImage", { count: specialInstructionsImages.length })}
                              </p>
                              <ul className="list-disc list-inside text-sm text-muted-foreground">
                                {specialInstructionsImages.map((file, index) => (
                                  <li key={index} className="flex items-center justify-between">
                                    <span>{file.name}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveImage(index)}
                                      aria-label={t("form.removeImageAriaLabel", { fileName: file.name })}
                                      className="ml-2 p-1 h-auto" // Adjusted padding and height for a smaller button
                                    >
                                      <X className="size-4" />
                                    </Button>
                                  </li>
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
                    <Button onClick={handleSubmitForm} disabled={isSubmitting}>
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
                {/* ... progress steps ... */}
                <Card className="text-center">
                  <CardHeader>
                    <CardTitle className="text-2xl">{t("confirmation.title")}</CardTitle>
                    <CardDescription>{t("confirmation.message")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="text-xl font-bold border border-border rounded-md py-3 bg-muted/30">
                        <p>{t("confirmation.reference")}</p>
                        <p className="text-primary">{confirmedBookingReference}</p>
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
                            <span className="text-muted-foreground">{t("form.windows")}</span>
                            <p className="font-medium">{formData.windows}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t("form.stories")}</span>
                            <p className="font-medium">{formData.stories}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t("form.cleaningTypeLabel")}</span>
                            <p className="font-medium">
                              {formData.includeInterior ? t("form.interiorExterior") : t("form.exteriorOnly")}
                            </p>
                          </div>
                          {estimatedPrice && (
                            <div>
                              <span className="text-muted-foreground">{t("form.estimatedPriceLabel")}</span>
                              <p className="font-medium">{estimatedPrice}</p>
                            </div>
                          )}
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
