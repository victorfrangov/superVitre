"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { Link } from "@/i18n/navigation"
import { ArrowLeft, CheckCircle, Mail, Phone, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import NavigationBar from "@/components/navigation-bar"

import { collection, addDoc } from "firebase/firestore";
import { db, clientStorage } from '@/app/firebase/config'; // Added clientStorage
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Added Firebase Storage functions

export default function ContactPage() {
  const t = useTranslations("contact");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    serviceType: "residential",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [contactImages, setContactImages] = useState<File[]>([]); // New state for images

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError(null);
  };

  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({ ...prev, serviceType: value }));
    if (formError) setFormError(null);
  };

  // New handler for image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setContactImages(prevImages => [...prevImages, ...Array.from(e.target.files!)]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.message.trim()) {
      setFormError(t("form.validationError.fieldsRequired"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError(t("form.validationError.invalidEmail"));
      return;
    }

    setIsSubmitting(true);

    try {
      const imageUrls: string[] = [];
      if (contactImages.length > 0) {
        const submissionId = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        for (const imageFile of contactImages) {
          const imageRef = ref(clientStorage, `contact_images/${submissionId}/${imageFile.name}`);
          try {
            await uploadBytes(imageRef, imageFile);
            const downloadUrl = await getDownloadURL(imageRef);
            imageUrls.push(downloadUrl);
          } catch (uploadError) {
            console.error(`Error uploading image ${imageFile.name}:`, uploadError);
            setFormError(t("form.errorImageUpload", { fileName: imageFile.name }));
            setIsSubmitting(false);
            return;
          }
        }
      }

      const contactData = {
        ...formData,
        status: "new",
        submittedAt: new Date().toISOString().split("T")[0],
        imageUrls: imageUrls, // Add image URLs
      };

      await addDoc(collection(db, "contacts"), contactData);
      setIsSubmitted(true);
      setContactImages([]); // Clear images after successful submission
    } catch (error) {
      console.error("Error adding document: ", error);
      if (!formError) { // Avoid overwriting specific image upload error
        setFormError(t("form.errorMessage"));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <NavigationBar />
      <main className="flex-1 py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-5xl space-y-8">
            <div className="text-center space-y-3">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t("title")}</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">{t("subtitle")}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Contact Information */}
              <div className="md:col-span-1 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("contactInfo.title")}</CardTitle>
                    <CardDescription>{t("contactInfo.subtitle")}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Phone className="size-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">{t("contactInfo.phone")}</h3>
                        <p className="text-sm text-muted-foreground">(555) 123-4567</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Mail className="size-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-medium">{t("contactInfo.email")}</h3>
                        <p className="text-sm text-muted-foreground">contact@supervitre.com</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t("hours.title")}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">{t("hours.monday")}</span>
                      <span>10:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">{t("hours.tuesday")}</span>
                      <span>10:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">{t("hours.wednesday")}</span>
                      <span>10:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">{t("hours.thursday")}</span>
                      <span>10:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">{t("hours.friday")}</span>
                      <span>10:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">{t("hours.saturday")}</span>
                      <span>10:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">{t("hours.sunday")}</span>
                      <span>{t("hours.closed")}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Form */}
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("form.title")}</CardTitle>
                    <CardDescription>{t("form.subtitle")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!isSubmitted ? (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">{t("form.firstName")} <span className="text-destructive">*</span></Label>
                            <Input
                              id="firstName"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">{t("form.lastName")} <span className="text-destructive">*</span></Label>
                            <Input
                              id="lastName"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
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
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>{t("form.serviceType")} <span className="text-destructive">*</span></Label>
                          <RadioGroup
                            defaultValue={formData.serviceType}
                            onValueChange={handleRadioChange}
                            className="grid grid-cols-1 sm:grid-cols-3 gap-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="residential" id="residential" />
                              <Label htmlFor="residential">{t("form.serviceTypes.residential")}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="commercial" id="commercial" />
                              <Label htmlFor="commercial">{t("form.serviceTypes.commercial")}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="other" id="other" />
                              <Label htmlFor="other">{t("form.serviceTypes.other")}</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="message">{t("form.message")} <span className="text-destructive">*</span></Label>
                          <Textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            rows={5}
                          />
                        </div>

                        {/* New Image Upload Field */}
                        <div className="space-y-2">
                          <Label htmlFor="contactImages">{t("form.uploadImagesLabel")}</Label>
                          <Input
                            id="contactImages"
                            name="contactImages"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className="pt-2"
                          />
                          {contactImages.length > 0 && (
                            <div className="mt-2 space-y-1">
                              <p className="text-sm font-medium text-muted-foreground">
                                {t("form.selectedImagesText", { count: contactImages.length })}
                              </p>
                              <ul className="list-disc list-inside text-sm text-muted-foreground">
                                {contactImages.map((file, index) => (
                                  <li key={index}>{file.name}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {formError && (
                          <p className="text-sm font-medium text-destructive text-center">{formError}</p>
                        )}
                      </form>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-12 text-center space-y-4"
                      >
                        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <CheckCircle className="size-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">{t("form.thankYou")}</h3>
                        <p className="text-muted-foreground max-w-md">{t("form.responseMessage")}</p>
                      </motion.div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" asChild>
                      <Link href="/">
                        <ArrowLeft className="mr-2 size-4" />
                        {t("form.backHome")}
                      </Link>
                    </Button>
                    {!isSubmitted && (
                      <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? t("form.sending") : t("form.send")}
                        <Send className="ml-2 size-4" />
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
