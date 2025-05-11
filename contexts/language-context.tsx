"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = {
  code: string
  name: string
  flag: string
}

export const languages: Language[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" }
]

type LanguageContextType = {
  language: Language
  setLanguage: (language: Language) => void
  languages: Language[]
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(languages[0])

  useEffect(() => {
    // You could load the user's preferred language from localStorage here
    const savedLanguage = localStorage.getItem("language")
    if (savedLanguage) {
      const parsedLanguage = JSON.parse(savedLanguage)
      setLanguage(parsedLanguage)
    }
  }, [])

  useEffect(() => {
    // Save language preference to localStorage when it changes
    localStorage.setItem("language", JSON.stringify(language))
    // You could also update the html lang attribute here
    document.documentElement.lang = language.code
  }, [language])

  return <LanguageContext.Provider value={{ language, setLanguage, languages }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
