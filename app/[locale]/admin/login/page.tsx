"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff, Lock, LogIn, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function AdminLoginPage() {
  const t = useTranslations("admin.login")
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // For demo purposes, hardcode a successful login with specific credentials
      if (formData.email === "admin@crystalclear.com" && formData.password === "password") {
        toast({
          title: t("successTitle"),
          description: t("successMessage"),
        })

        // Redirect to admin dashboard
        router.push("/admin")
      } else {
        toast({
          title: t("errorTitle"),
          description: t("errorMessage"),
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: t("errorTitle"),
        description: t("errorMessage"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-border/40 shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center gap-2 font-bold">
                <div className="size-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground">
                  C
                </div>
                <span className="text-xl">CrystalClear</span>
              </div>
            </div>
            <CardTitle className="text-2xl">{t("title")}</CardTitle>
            <CardDescription>{t("subtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    className="pl-10"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t("password")}</Label>
                  <Button variant="link" className="p-0 h-auto text-xs" type="button">
                    {t("forgotPassword")}
                  </Button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("passwordPlaceholder")}
                    className="pl-10"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    className="absolute right-0 top-0 h-full px-3 py-2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4 text-muted-foreground" />
                    ) : (
                      <Eye className="size-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">{showPassword ? t("hidePassword") : t("showPassword")}</span>
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                    {t("loggingIn")}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <LogIn className="mr-2 size-4" />
                    {t("login")}
                  </div>
                )}
              </Button>
            </form>
            <div className="text-center text-sm text-muted-foreground">
              <p>{t("demoCredentials")}</p>
              <p className="font-mono mt-1">admin@crystalclear.com / password</p>
            </div>
          </CardContent>
          <CardFooter className="border-t p-4">
            <Button variant="outline" className="w-full" asChild>
              <a href="/">{t("backToWebsite")}</a>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
      <Toaster />
    </div>
  )
}
