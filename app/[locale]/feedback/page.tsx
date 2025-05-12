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
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import NavigationBar from "@/components/navigation-bar"

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, allowPublic: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast({
        title: t("ratingRequired"),
        description: t("pleaseSelectRating"),
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // This is where you would connect to your backend
      // const response = await fetch('/api/feedback', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ...formData, rating })
      // });

      setIsSubmitted(true)
      toast({
        title: t("feedbackSubmitted"),
        description: t("thankYouForFeedback"),
      })
    } catch (error) {
      toast({
        title: t("errorSubmitting"),
        description: t("pleaseTryAgain"),
        variant: "destructive",
      })
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
                      <Label>{t("rating")}</Label>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            className="focus:outline-none"
                            onClick={() => setRating(i + 1)}
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
                        <Label htmlFor="name">{t("name")}</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t("email")}</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">{t("feedback")}</Label>
                      <Textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={5}
                        required
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
                    {formData.allowPublic && (
                      <div className="mt-4 p-4 bg-muted/30 rounded-md">
                        <p className="text-sm">{t("testimonialInfo")}</p>
                      </div>
                    )}
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
      <Toaster />
    </div>
  )
}
