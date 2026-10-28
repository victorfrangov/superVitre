import type { Metadata } from "next"
import { routing } from "@/i18n/routing"
import { BUSINESS_NAME, SITE_URL } from "@/lib/business"

// Canonical, hreflang, Open Graph and Twitter tags for a page that exists in every locale.
// path is the part after the locale ("" for the home page, "/about", ...).
// x-default is the unprefixed URL, which the middleware redirects by browser language (same as its Link header).
export function pageMetadata({
  locale,
  path,
  title,
  description,
  imageAlt,
}: {
  locale: string
  path: string
  title: string
  description: string
  imageAlt: string
}): Metadata {
  const url = `${SITE_URL}/${locale}${path}`
  const image = `/og-${locale}.jpg`
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(routing.locales.map((other) => [other, `${SITE_URL}/${other}${path}`])),
        "x-default": `${SITE_URL}${path || "/"}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: BUSINESS_NAME,
      locale: `${locale}_CA`,
      alternateLocale: routing.locales.filter((other) => other !== locale).map((other) => `${other}_CA`),
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: imageAlt }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  }
}
