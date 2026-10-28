import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import NavigationBar from "@/components/navigation-bar"
import { SiteFooter } from "@/components/site-footer"
import { Link } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { PHONE, SITE_URL } from "@/lib/business"
import { pageMetadata } from "@/lib/metadata"
import { BUSINESS_ID, WEBSITE_ID, breadcrumbList, graph, localBusiness } from "@/lib/schema"

type Params = Promise<{ locale: string }>

// Team members shown, by their key in about.team (messages/*.json). No photos yet: the cards show initials.
const TEAM = ["member1", "member3"] as const

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "meta" })
  return pageMetadata({
    locale,
    path: "/about",
    title: t("aboutTitle"),
    description: t("aboutDescription"),
    imageAlt: t("ogImageAlt"),
  })
}

function initials(name: string) {
  return name
    .split(/[\s-]+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
}

export default async function AboutPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations("about")
  const metaT = await getTranslations("meta")
  const navT = await getTranslations("navigation")
  const ctaT = await getTranslations("cta")
  const contactT = await getTranslations("contact")

  const pageUrl = `${SITE_URL}/${locale}/about`
  const jsonLd = graph(
    localBusiness(locale, metaT("description")),
    {
      "@type": "AboutPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: metaT("aboutTitle"),
      description: metaT("aboutDescription"),
      inLanguage: locale,
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": BUSINESS_ID },
    },
    breadcrumbList([
      { name: navT("home"), url: `${SITE_URL}/${locale}` },
      { name: navT("about"), url: pageUrl },
    ]),
  )

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <NavigationBar />
      <main className="flex-1 py-20 md:py-32 bg-muted/30">
        <div className="container px-4 md:px-6 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-12">
            {/* Team cards side by side with names/roles */}
            <div className="flex flex-row gap-4 md:gap-8 w-full md:max-w-xs md:min-w-[220px] flex-shrink-0 justify-center md:justify-end">
              {TEAM.map((member) => (
                <div key={member} className="flex flex-col items-center p-2 md:p-5">
                  <Card className="w-32 h-40 md:w-40 md:h-52 shadow-lg">
                    <CardHeader className="p-0 h-full">
                      <div
                        aria-hidden
                        className="flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-4xl font-bold text-primary-foreground"
                      >
                        {initials(t(`team.${member}.name`))}
                      </div>
                    </CardHeader>
                  </Card>
                  <div className="mt-2 text-center">
                    <div className="font-bold">{t(`team.${member}.name`)}</div>
                    <div className="text-sm text-muted-foreground">{t(`team.${member}.role`)}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Text content */}
            <div className="flex-1 flex flex-col justify-center">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                {t("title")}
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                {t("description")}
              </p>
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2">{t("ourValuesTitle")}</h2>
              </div>
              <p className="text-muted-foreground mb-2">
                <span className="font-medium text-foreground">{contactT("serviceArea")}</span>
                <br />
                {contactT("serviceAreaValue")}
              </p>
              <p className="text-muted-foreground mb-6">{t("cta")}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="rounded-full h-12 px-8 text-base">
                  <Link href="/#contact">
                    {ctaT("reserve")}
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full h-12 px-8 text-base">
                  <a href={`tel:${PHONE.tel}`}>{PHONE.display}</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
