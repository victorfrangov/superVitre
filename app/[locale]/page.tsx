import LandingPageClient from "./landing-page-client"
import { routing } from "@/i18n/routing"
import { setRequestLocale } from "next-intl/server"

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LandingPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return <LandingPageClient />
}
