import type React from "react"
import { Inter } from "next/font/google"
import type { Metadata } from "next"
import Script from "next/script"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/contexts/language-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SuperVitre",
  description: "Lavage de vitre résidentiel à Saint-Lambert."
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
          <Script
            src="https://www.google.com/recaptcha/api.js?render=6LcbwE4rAAAAAP6XFo9RcgaCZzeT2CDlGEqK6bVv"
            strategy="beforeInteractive"
          />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
