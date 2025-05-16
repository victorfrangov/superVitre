"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle, Send, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

import NavigationBar from "@/components/navigation-bar"

import { collection, addDoc } from "firebase/firestore"
import { db } from '@/app/firebase/config'

export default function FeedbackPage() {
  const t = useTranslations("feedback")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    allowPublic: false,
  })
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formError) setFormError(null)
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, allowPublic: checked }))
    if (formError) setFormError(null)
  }

  const handleRatingChange = (newRating: number) => {
    setRating(newRating)
    if (formError) setFormError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (rating === 0) {
      setFormError(t("form.validationError.ratingRequired"))
      return
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setFormError(t("form.validationError.fieldsRequired"))
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setFormError(t("form.validationError.invalidEmail"))
      return
    }

    setIsSubmitting(true)

    try {
      const feedbackData = {
        ...formData,
        rating,
        status: "pending",
        submittedAt: new Date().toISOString().split("T")[0],
      }

      await addDoc(collection(db, "feedbacks"), feedbackData)

      setIsSubmitted(true)
    } catch (error) {
        console.error("Error adding document: ", error)
        setFormError(t("form.errorMessage"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <NavigationBar />
      <main className="flex-1 py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-2xl space-y-8">
            <div className="text-center space-y-3">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
              <p className="text-muted-foreground">{t("subtitle")}</p>
            </div>

            {!isSubmitted ? (
              <Card>
                <CardHeader>
                  <CardTitle>{t("shareYourExperience")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label>{t("rating")} <span className="text-destructive">*</span></Label>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            className="focus:outline-none"
                            onClick={() => handleRatingChange(i + 1)}
                            onMouseEnter={() => setHoveredRating(i + 1)}
                            onMouseLeave={() => setHoveredRating(0)}
                          >
                            <Star
                              className={`size-8 transition-colors ${
                                i < (hoveredRating || rating)
                                  ? "text-amber-500 fill-amber-500"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t("name")} <span className="text-destructive">*</span></Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t("email")} <span className="text-destructive">*</span></Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">{t("feedback")} <span className="text-destructive">*</span></Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={5}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allowPublic"
                        checked={formData.allowPublic}
                        onCheckedChange={handleCheckboxChange}
                      />
                      <Label htmlFor="allowPublic" className="text-sm font-normal">
                        {t("allowPublicDisplay")}
                      </Label>
                    </div>
                    {formError && (
                      <p className="text-sm font-medium text-destructive text-center">{formError}</p>
                    )}
                  </form>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" asChild>
                    <Link href="/">
                      <ArrowLeft className="mr-2 size-4" />
                      {t("returnToHome")}
                    </Link>
                  </Button>
                  <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                        {t("submitting")}
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Send className="mr-2 size-4" />
                        {t("submitFeedback")}
                      </div>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Card className="text-center">
                  <CardHeader>
                    <div className="mx-auto size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <CheckCircle className="size-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{t("thankYou")}</CardTitle>
                    <CardDescription>{t("feedbackReceived")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{t("appreciateYourFeedback")}</p>
                  </CardContent>
                  <CardFooter className="justify-center">
                    <Button asChild>
                      <Link href="/">
                        <ArrowLeft className="mr-2 size-4" />
                        {t("returnToHome")}
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
