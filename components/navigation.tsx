"use client"

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight, Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigationTranslations } from "@/utils/navigation";
import { LanguageSwitcher } from "@/components/language-switcher"

export default function NavigationBar(){
  const { navT, ctaT, accessibilityT } = useNavigationTranslations();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { href: "/reservations", label: navT("reservations") },
    { href: "/contact", label: navT("contact") },
    { href: "#pricing", label: navT("pricing") },
    { href: "#faq", label: navT("faq") },
  ];

    return(
        <header
        className={`sticky top-0 z-50 w-full backdrop-blur-lg transition-all duration-300`}
      >
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground">
              S
            </div>
            <span>SuperVitre</span>
          </div>
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
          <div className="hidden md:flex gap-4 items-center">
            <LanguageSwitcher />
            {/* <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {mounted ? (theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />) : <Moon className="size-[18px]" />}
              <span className="sr-only">{accessibilityT("toggleTheme")}</span>
            </Button> */}
            <Link
              href="#"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {navT("login")}
            </Link>
            <Button className="rounded-full">
              {ctaT("getStarted")}
              <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
          <div className="flex items-center gap-4 md:hidden">
            <LanguageSwitcher />
            {/* <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {mounted ? (theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />) : <Moon className="size-[18px]" />}
            </Button> */}
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
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
                <Link href="#" className="py-2 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                  {navT("login")}
                </Link>
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