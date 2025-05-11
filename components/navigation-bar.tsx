"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight, Menu, X, UserRoundCog, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigationTranslations } from "@/utils/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";

// Firebase and FirebaseUI imports (using compat for FirebaseUI)
import firebase from 'firebase/compat/app'; // Import the compat app
import 'firebase/compat/auth';          // Import the compat auth module
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';  // Import FirebaseUI CSS

// Import your Firebase configuration
import { firebaseConfig } from '@/lib/firebase'; // Ensure this path is correct

// Initialize Firebase compat app if it hasn't been already
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default function NavigationBar() {
  const { navT, ctaT, accessibilityT } = useNavigationTranslations();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const firebaseuiContainerId = "firebaseui-auth-container";

  const [currentUser, setCurrentUser] = useState<firebase.User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Listener for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged(user => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  // Effect to initialize FirebaseUI when the user is logged out and auth state is resolved
  useEffect(() => {
    if (!currentUser && !isAuthLoading) {
      const container = document.getElementById(firebaseuiContainerId);
      if (container) { // Ensure the container element is in the DOM
        const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth());
        // Check if the container is empty to prevent re-initializing over existing UI
        if (container.innerHTML.trim() === '') {
          ui.start(`#${firebaseuiContainerId}`, {
            signInSuccessUrl: '/admin', // Redirect to /admin on successful sign-in
            signInOptions: [
              firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            ],
            credentialHelper: firebaseui.auth.CredentialHelper.NONE, // Recommended for SPAs
          });
        }
      }
    }
  }, [currentUser, isAuthLoading]); // Rerun when auth state changes

  const handleSignOut = async () => {
    try {
      await firebase.auth().signOut();
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const links = [
    { href: "/reservations", label: navT("reservations") },
    { href: "/contact", label: navT("contact") },
    { href: "/#pricing", label: navT("pricing") },
    { href: "/feedback", label: navT("feedback") },
    { href: "/#faq", label: navT("faq") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-lg shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo and Home Link */}
        <Link href="/" className="flex items-center gap-3 font-bold text-lg">
          <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground">
            S
          </div>
          <span>SuperVitre</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth Area & Call-to-Action Button */}
        <div className="hidden md:flex gap-2 items-center">
          <LanguageSwitcher />
          {isAuthLoading ? (
            <div className="h-9 w-32 animate-pulse rounded-md bg-muted"></div>
          ) : currentUser ? (
            <>
              <Link
                href="/admin"
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={navT("adminPanel") || "Admin Panel"}
              >
                <UserRoundCog className="size-5" />
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground"
                aria-label={navT("signOut") || "Sign Out"}
              >
                <LogOut className="size-5" />
              </Button>
            </>
          ) : (
            <div id={firebaseuiContainerId} className="flex items-center"></div>
          )}
          <Button className="rounded-full">
            {ctaT("getStarted")}
            <ChevronRight className="size-4 -ml-1" />
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-4 md:hidden">
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            <span className="sr-only">{accessibilityT("toggleMenu")}</span>
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden absolute top-16 inset-x-0 bg-background/95 backdrop-blur-lg border-b"
        >
          <div className="container py-4 flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-2 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-2 border-t">
              {isAuthLoading ? (
                <div className="py-2 text-sm font-medium text-muted-foreground">Loading...</div>
              ) : currentUser ? (
                <>
                  <Link href="/admin" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                    {navT("adminPanel") || "Admin Panel"}
                  </Link>
                  <Button variant="ghost" onClick={() => { handleSignOut(); setMobileMenuOpen(false); }} className="justify-start py-2 text-sm font-medium">
                    {navT("signOut") || "Sign Out"}
                  </Button>
                </>
              ) : (
                <Link href="#" className="py-2 text-sm font-medium" onClick={(e) => {
                  e.preventDefault();
                  setMobileMenuOpen(false);
                  alert("Please login on desktop or implement mobile login UI.");
                }}>
                  {navT("login")}
                </Link>
              )}
              <Button className="rounded-full">
                {ctaT("getStarted")}
                <ChevronRight className="ml-1 size-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}