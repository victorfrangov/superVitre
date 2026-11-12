import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Plus_Jakarta_Sans } from "next/font/google"
import "@/styles/globals.css"
import { notFound } from "next/navigation"
import { Analytics } from "@vercel/analytics/react"
import { NextIntlClientProvider, hasLocale } from "next-intl"
import { setRequestLocale } from "next-intl/server"
import { ThemeProvider } from "@/components/theme-provider"
import { routing } from "@/i18n/routing"
import { SITE_URL } from "@/lib/business"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
// Headings
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-display" })

// Resolves the relative Open Graph image URLs set by each page
export const metadata: Metadata = { metadataBase: new URL(SITE_URL) }

// Browser UI color on phones, matching the page background
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#08121f" },
  ],
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Page copy is rendered on the server; the browser only gets what the client components use
  const messages = (await import(`@/messages/${locale}.json`)).default;
  const clientMessages = { navigation: messages.navigation, cta: messages.cta, accessibility: messages.accessibility };

  return (
    <html lang={locale} className={`${inter.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NextIntlClientProvider locale={locale} messages={clientMessages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
