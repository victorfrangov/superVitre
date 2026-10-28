// Business details used in the page copy, the metadata and the structured data.
// Keep them in sync with the Google Business Profile.
export const SITE_URL = "https://supervitre.net"
export const BUSINESS_NAME = "SuperVitre"

export const PHONE = { display: "+1 (438) 503-8171", tel: "+14385038171" }

// Towns named in areaServed. Add a town only where we really work (it should also appear in the FAQ and contact copy).
export const SERVICE_AREA = ["Saint-Lambert"]

// Same hours as contact.hours in messages/*.json
export const OPENING_HOURS = {
  days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  opens: "09:00",
  closes: "17:00",
}

// Average job for a mid-sized house, from pricing.footer in messages/*.json
export const PRICE_RANGE = "180–350 CAD"

// Day each page's copy last changed, for the sitemap's lastmod
export const PAGES = [
  { path: "", updated: "2026-10-28", priority: 1 },
  { path: "/about", updated: "2026-10-28", priority: 0.5 },
]
