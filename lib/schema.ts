import { BUSINESS_NAME, OPENING_HOURS, PHONE, PRICE_RANGE, SERVICE_AREA, SITE_URL } from "@/lib/business"

// schema.org helpers. Google reads each page's structured data on its own, so every page carries the business node.
export const BUSINESS_ID = `${SITE_URL}/#business`
export const WEBSITE_ID = `${SITE_URL}/#website`

export function localBusiness(locale: string, description: string) {
  return {
    "@type": "LocalBusiness",
    "@id": BUSINESS_ID,
    name: BUSINESS_NAME,
    description,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.webp`,
    image: [`${SITE_URL}/og-${locale}.jpg`, `${SITE_URL}/hero-2.webp`],
    telephone: PHONE.tel,
    priceRange: PRICE_RANGE,
    currenciesAccepted: "CAD",
    paymentAccepted: "Cash, Interac e-Transfer",
    // Service-area business: no public street address
    address: { "@type": "PostalAddress", addressRegion: "QC", addressCountry: "CA" },
    areaServed: [
      ...SERVICE_AREA.map((town) => ({ "@type": "City", name: town })),
      { "@type": "Place", name: "Rive-Sud de Montréal" },
    ],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: OPENING_HOURS.days,
      opens: OPENING_HOURS.opens,
      closes: OPENING_HOURS.closes,
    },
    knowsLanguage: ["fr", "en"],
  }
}

export function webSite() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: BUSINESS_NAME,
    inLanguage: ["fr", "en"],
    publisher: { "@id": BUSINESS_ID },
  }
}

export function faqPage(url: string, locale: string, items: { question: string; answer: string }[]) {
  return {
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    inLanguage: locale,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  }
}

export function breadcrumbList(items: { name: string; url: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: item.url })),
  }
}

export function graph(...nodes: unknown[]) {
  return { "@context": "https://schema.org", "@graph": nodes }
}
