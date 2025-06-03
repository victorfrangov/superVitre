"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight, Menu, X, UserRoundCog, Sun, Moon, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { ref, getDownloadURL } from "firebase/storage";
import { assetStorage } from "@/app/firebase/config";

export default function NavigationBar() {
  const navT = useTranslations("navigation");
  const ctaT = useTranslations("cta");
  const accessibilityT = useTranslations("accessibility");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoLoading, setLogoLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const fetchLogo = async () => {
      try {
        const logoRef = ref(assetStorage, 'favicon.webp');
        const url = await getDownloadURL(logoRef);
        setLogoUrl(url);
      } catch (error) {
        console.error("Error fetching logo from Firebase Storage:", error);
      } finally {
        setLogoLoading(false);
      }
    };

    fetchLogo();
  }, []);

  const links = [
    { href: "/reservations", label: navT("reservations") },
    { href: "/contact", label: navT("contact") },
    { href: "/#pricing", label: navT("pricing") },
    { href: "/feedback", label: navT("feedback") },
    { href: "/#faq", label: navT("faq") },
  ];

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  if (!mounted) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-lg shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo and Home Link */}
        <Link href="/" className="flex items-center gap-3 font-bold text-lg">
          <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground overflow-hidden">
            {logoLoading ? (
              <ImageIcon className="size-4 animate-pulse" /> // Placeholder while loading
            ) : logoUrl ? (
              <img src={logoUrl} alt="SuperVitre Logo" className="w-full h-full object-cover" />
            ) : (
              "S" // Fallback if image fails to load or no URL
            )}
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
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={toggleTheme}
              aria-label={accessibilityT("toggleTheme") || "Toggle theme"}
            >
              {resolvedTheme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </Button>
          )}
          <Link
            href="/login"
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={navT("adminLogin") || "Admin Login"}
          >
            <UserRoundCog className="size-5" />
          </Link>
          <Button asChild className="rounded-full">
            <Link href="/reservations">
              {ctaT("getStarted")}
              <ChevronRight className="size-4 -ml-1" />
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={toggleTheme}
              aria-label={accessibilityT("toggleTheme") || "Toggle theme"}
            >
              {resolvedTheme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </Button>
          )}
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
              <Link
                href="/login"
                className="py-2 text-sm font-medium flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <UserRoundCog className="size-4 mr-2" />
                {navT("adminLogin") || "Admin Login"}
              </Link>
              <Button asChild className="rounded-full w-full">
                <Link href="/reservations" onClick={() => setMobileMenuOpen(false)}>
                  {ctaT("getStarted")}
                  <ChevronRight className="-ml-1 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}
