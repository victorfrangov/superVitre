import type React from "react"
import type { Metadata } from "next"
import "@/styles/globals.css"
import { notFound } from "next/navigation"
import { routing } from "@/i18n/routing"
import { NextIntlClientProvider, hasLocale } from "next-intl"
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server"

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "meta" })

  return {
    title: t("title"),
    description: t("description"),
  }
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

  const messages = await getMessages({ locale });
 
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
    </NextIntlClientProvider>
  );
}
