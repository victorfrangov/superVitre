"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

import { auth } from '@/app/firebase/config'
import { GoogleAuthProvider, signInWithPopup, browserPopupRedirectResolver, signOut, getIdTokenResult } from "firebase/auth"; 

// Google Icon
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.13-3.13C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    <path d="M1 1h22v22H1z" fill="none" />
  </svg>
);

export default function AdminLoginPage() {
  const t = useTranslations("admin.login")
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const userCredential = await signInWithPopup(auth, provider, browserPopupRedirectResolver);
      const user = userCredential.user;

      if (user) {
        // Force refresh to get the latest claims if they were recently set
        const idTokenResult = await getIdTokenResult(user, true); 
        
        if (idTokenResult.claims.admin === true) {
          router.push("/admin"); // Redirect to admin dashboard
        } else {
          // Not an admin, or admin claim is not true
          console.log("User is not an admin. Signing out."); // For development
          await signOut(auth); // Sign out the non-admin user
        }
      } else {
        // This case should ideally not be reached if signInWithPopup resolves successfully with a user.
        console.error("User object was null after Google Sign-In attempt.");
        if (auth.currentUser) { // Ensure sign out if somehow a session exists
            await signOut(auth);
        }
      }
    } catch (error: any) {
      // No UI errors shown as per request. Log for development.
      console.error("Google Sign-In Error:", error);
      // Attempt to sign out the user if any error occurred during the process
      if (auth.currentUser) {
        try {
          await signOut(auth);
        } catch (signOutError) {
          console.error("Error signing out after failed login attempt:", signOutError);
        }
      }
    } finally {
      setIsLoading(false);
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
            <div className="flex justify-center mb-3">
              <div className="flex items-center gap-2 font-bold">
                <div className="size-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground">
                  S
                </div>
                <span className="text-xl">SuperVitre</span>
              </div>
            </div>
            <CardTitle className="text-2xl">{t("title")}</CardTitle>
            <CardDescription>{t("subtitleGoogle", {defaultValue: "Sign in with your Google account to access the admin panel."})}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6 pb-6">
            <Button 
              onClick={handleGoogleSignIn} 
              className="w-full" 
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                  {t("loggingIn")}
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <GoogleIcon />
                  <span className="ml-2">{t("loginWithGoogle", {defaultValue: "Sign in with Google"})}</span>
                </div>
              )}
            </Button>
          </CardContent>
          <CardFooter className="border-t p-4">
            <Button variant="outline" className="w-full" asChild>
              <a href="/">{t("backToWebsite")}</a>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
