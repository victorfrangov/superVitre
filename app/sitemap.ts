import type { MetadataRoute } from "next"
import { routing } from "@/i18n/routing"
import { PAGES, SITE_URL } from "@/lib/business"

// Every page in every locale, with the same hreflang alternates as the pages themselves
export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap((page) => {
    const languages = {
      ...Object.fromEntries(routing.locales.map((locale) => [locale, `${SITE_URL}/${locale}${page.path}`])),
      "x-default": `${SITE_URL}${page.path || "/"}`,
    }
    return routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${page.path}`,
      lastModified: page.updated,
      changeFrequency: "monthly" as const,
      priority: page.priority,
      alternates: { languages },
    }))
  })
}
