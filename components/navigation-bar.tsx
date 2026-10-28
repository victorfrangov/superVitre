"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ChevronRight, Menu, X, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";

export default function NavigationBar() {
  const navT = useTranslations("navigation");
  const ctaT = useTranslations("cta");
  const accessibilityT = useTranslations("accessibility");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();
  // The theme is only known in the browser; until then the toggle shows no icon
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Home page sections and pages; next-intl adds the locale prefix, so these work from every page
  const links = [
    { href: "/#pricing", label: navT("pricing") },
    { href: "/#faq", label: navT("faq") },
    { href: "/about", label: navT("about") },
  ];

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const themeButton = (
    <Button
      variant="ghost"
      size="icon"
      className="size-11 rounded-full"
      onClick={toggleTheme}
      aria-label={accessibilityT("toggleTheme")}
    >
      {mounted ? resolvedTheme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" /> : <span className="size-5" />}
    </Button>
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-lg shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo and Home Link */}
        <Link href="/" className="flex min-h-11 items-center gap-3 font-bold text-lg">
          <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground overflow-hidden">
            <Image src="/favicon.webp" alt="" width={32} height={32} className="w-full h-full object-cover" priority />
          </div>
          <span>SuperVitre</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex min-h-11 items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Language, theme and call-to-action */}
        <div className="hidden md:flex gap-2 items-center">
          <LanguageSwitcher />
          {themeButton}
          <Button asChild className="h-11 rounded-full">
            <Link href="/#contact">
              {ctaT("getStarted")}
              <ChevronRight className="size-4 -ml-1" />
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          {themeButton}
          <Button
            variant="ghost"
            size="icon"
            className="size-11"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            <span className="sr-only">{accessibilityT("toggleMenu")}</span>
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          id="mobile-menu"
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
              <Button asChild className="rounded-full w-full">
                <Link href="/#contact" onClick={() => setMobileMenuOpen(false)}>
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
