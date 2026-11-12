"use client";

import Image from "next/image";
import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ChevronRight, Menu, X, Sun, Moon, Phone } from "lucide-react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { PHONE } from "@/lib/business";

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
    { href: "/#before-after", label: navT("results") },
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
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        {/* Logo and Home Link */}
        <Link href="/" className="flex min-h-11 items-center gap-2.5 font-display text-lg font-extrabold tracking-tight">
          <span className="flex size-9 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-border">
            <Image src="/favicon.webp" alt="" width={36} height={36} className="size-full object-cover" priority />
          </span>
          <span>SuperVitre</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex min-h-11 items-center rounded-full px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Language, theme and call-to-action */}
        <div className="hidden lg:flex gap-1 items-center">
          <LanguageSwitcher />
          {themeButton}
          <a
            href={`tel:${PHONE.tel}`}
            className="ml-2 hidden min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold transition-colors hover:bg-accent xl:flex"
          >
            <Phone className="size-4 text-primary" />
            {PHONE.display}
          </a>
          <Button asChild className="ml-1 h-11 rounded-full px-5 font-semibold">
            <Link href="/#contact">
              {ctaT("getStarted")}
              <ChevronRight className="size-4 -ml-1" />
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-1 lg:hidden">
          <LanguageSwitcher />
          {themeButton}
          <Button
            variant="ghost"
            size="icon"
            className="size-11 rounded-full"
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
        <div
          id="mobile-menu"
          className="lg:hidden absolute top-16 inset-x-0 border-b bg-background/95 backdrop-blur-lg shadow-lg animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="container flex flex-col gap-1 px-4 py-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex min-h-11 items-center rounded-xl px-3 text-base font-medium hover:bg-accent"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t pt-4">
              <Button asChild variant="outline" className="h-12 rounded-full">
                <a href={`tel:${PHONE.tel}`}>
                  <Phone className="size-4" />
                  {ctaT("call")}
                </a>
              </Button>
              <Button asChild className="h-12 rounded-full font-semibold">
                <Link href="/#contact" onClick={() => setMobileMenuOpen(false)}>
                  {ctaT("getStarted")}
                  <ChevronRight className="-ml-1 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
