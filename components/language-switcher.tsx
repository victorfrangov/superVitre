"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { locales } from "@/config/locales"
import { useLocale, useTranslations } from "next-intl"
import { Link, usePathname } from "@/config/navigation"

export function LanguageSwitcher() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations("accessibility")

  // Find the current locale object
  const currentLocale = locales.find((l) => l.code === locale) || locales[0]

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full relative">
          <Globe className="size-[18px]" />
          <span className="absolute -bottom-1 -right-1 text-xs">{currentLocale.flag}</span>
          <span className="sr-only">{t("changeLanguage")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {locales.map((lang) => (
          <DropdownMenuItem key={lang.code} asChild>
            <Link
              href={pathname}
              locale={lang.code}
              className={`flex items-center gap-2 cursor-pointer ${locale === lang.code ? "bg-muted" : ""}`}
              onClick={() => setOpen(false)}
            >
              <span>{lang.flag}</span>
              <span>{lang.name}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
