import LandingPageClient from "./landing-page-client"
import { routing } from "@/i18n/routing"

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default function LandingPage() {
  return <LandingPageClient />
}
