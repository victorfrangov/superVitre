import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/styles/globals.css"
import { notFound } from "next/navigation"
import { Analytics } from "@vercel/analytics/react"
import { NextIntlClientProvider, hasLocale } from "next-intl"
import { setRequestLocale } from "next-intl/server"
import { ThemeProvider } from "@/components/theme-provider"
import { routing } from "@/i18n/routing"
import { SITE_URL } from "@/lib/business"

const inter = Inter({ subsets: ["latin"] })

// Resolves the relative Open Graph image URLs set by each page
export const metadata: Metadata = { metadataBase: new URL(SITE_URL) }

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
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
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
