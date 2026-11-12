import type { Metadata } from "next"
import Image from "next/image"
import { getTranslations, setRequestLocale } from "next-intl/server"
import {
  Check,
  ArrowRight,
  ChevronDown,
  Star,
  Zap,
  Shield,
  Droplets,
  Leaf,
  CalendarDays,
  Phone,
  Clock,
  MapPin,
  MessageSquare,
  Home,
  GraduationCap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import NavigationBar from "@/components/navigation-bar"
import { BeforeAfterGallery } from "@/components/before-after-gallery"
import { ScrollToTop } from "@/components/scroll-to-top"
import { SectionHeading } from "@/components/section-heading"
import { SiteFooter } from "@/components/site-footer"
import { Link } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { PHONE, SITE_URL } from "@/lib/business"
import { pageMetadata } from "@/lib/metadata"
import { BUSINESS_ID, JsonLd, WEBSITE_ID, faqPage, graph, localBusiness, offerCatalog, webSite } from "@/lib/schema"

type Params = Promise<{ locale: string }>
type FaqItem = { question: string; answer: string }

// Before/after photos in /public/avantapres; their alt text is beforeAfter.beforeAlts / afterAlts in messages/*.json
const BEFORE_COUNT = 8
const AFTER_COUNT = 9

// "Extérieur Seulement: " -> "Extérieur Seulement"
const label = (text: string) => text.replace(/\s*:\s*$/, "")

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "meta" })
  return pageMetadata({ locale, path: "", title: t("title"), description: t("description"), imageAlt: t("ogImageAlt") })
}

export default async function LandingPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)

  const metaT = await getTranslations("meta")
  const bnaT = await getTranslations("beforeAfter")
  const heroT = await getTranslations("hero")
  const statsT = await getTranslations("stats")
  const teamT = await getTranslations("team")
  const aboutT = await getTranslations("about")
  const ctaT = await getTranslations("cta")
  const featuresT = await getTranslations("features")
  const howItWorksT = await getTranslations("howItWorks")
  const pricingT = await getTranslations("pricing")
  const faqT = await getTranslations("faq")
  const accessibilityT = await getTranslations("accessibility")
  const contactT = await getTranslations("contact")

  const faqs = faqT.raw("questions") as FaqItem[]
  const teamPoints = teamT.raw("points") as string[]
  const beforeAlts = bnaT.raw("beforeAlts") as string[]
  const afterAlts = bnaT.raw("afterAlts") as string[]
  const beforeImages = Array.from({ length: BEFORE_COUNT }, (_, i) => ({ src: `/avantapres/avant-${i + 1}.webp`, alt: beforeAlts[i] }))
  const afterImages = Array.from({ length: AFTER_COUNT }, (_, i) => ({ src: `/avantapres/apres-${i + 1}.webp`, alt: afterAlts[i] }))

  // The H1 with the service area in the brand color
  const heroTitle = heroT("title")
  const highlight = heroT("titleHighlight")
  const highlightAt = heroTitle.indexOf(highlight)

  const heroStats = (["years", "houses", "price"] as const).map((key) => ({
    value: statsT(`${key}.value`),
    label: statsT(`${key}.label`),
  }))

  const features = [
    { key: "professionalCleaning", icon: Zap },
    { key: "streakFree", icon: Droplets },
    { key: "ecoFriendly", icon: Leaf },
    { key: "safetyFirst", icon: Shield },
    { key: "flexibleScheduling", icon: CalendarDays },
    { key: "satisfactionGuaranteed", icon: Star },
  ].map(({ key, icon }) => ({
    title: featuresT(`items.${key}.title`),
    description: featuresT(`items.${key}.description`),
    Icon: icon,
  }))

  const steps = (["step1", "step2", "step3"] as const).map((key) => ({
    title: howItWorksT(`steps.${key}.title`),
    description: howItWorksT(`steps.${key}.description`),
  }))

  const priceCards = [
    {
      title: pricingT("smallWindows.title"),
      description: pricingT("smallWindows.description"),
      rows: [
        [pricingT("exteriorOnly"), pricingT("smallWindows.extPrice")],
        [pricingT("interiorExterior"), pricingT("smallWindows.extIntPrice")],
        [pricingT("borders"), pricingT("included")],
      ],
    },
    {
      title: pricingT("largeWindows.title"),
      description: pricingT("largeWindows.description"),
      rows: [
        [pricingT("exteriorOnly"), pricingT("largeWindows.extPrice")],
        [pricingT("interiorExterior"), pricingT("largeWindows.extIntPrice")],
        [pricingT("borders"), pricingT("included")],
      ],
    },
    {
      title: pricingT("extras.title"),
      description: pricingT("extras.description"),
      rows: [
        [pricingT("extras.seal.title"), pricingT("extras.seal.price")],
        [pricingT("extras.screens.title"), pricingT("extras.screens.price")],
        [pricingT("extras.extraFloors.title"), pricingT("extras.extraFloors.price")],
        [pricingT("extras.gutters.title"), pricingT("extras.gutters.price")],
      ],
    },
  ]

  const pageUrl = `${SITE_URL}/${locale}`
  const jsonLd = graph(
    localBusiness(locale, metaT("description"), aboutT("team.member1.role")),
    webSite(),
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: metaT("title"),
      description: metaT("description"),
      inLanguage: locale,
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": BUSINESS_ID },
    },
    offerCatalog(
      pricingT("catalogName"),
      {
        smallExterior: `${pricingT("smallWindows.title")} – ${label(pricingT("exteriorOnly"))}`,
        smallInteriorExterior: `${pricingT("smallWindows.title")} – ${label(pricingT("interiorExterior"))}`,
        largeExterior: `${pricingT("largeWindows.title")} – ${label(pricingT("exteriorOnly"))}`,
        largeInteriorExterior: `${pricingT("largeWindows.title")} – ${label(pricingT("interiorExterior"))}`,
        screens: label(pricingT("extras.screens.title")),
        seal: label(pricingT("extras.seal.title")),
      },
      { window: pricingT("units.window"), screen: pricingT("units.screen") },
    ),
    faqPage(pageUrl, locale, faqs),
  )

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <JsonLd data={jsonLd} />
      <NavigationBar />
      <main className="flex-1">
        {/* Hero: no entrance animation, so the heading and photo paint before the JavaScript loads */}
        <section className="relative isolate w-full overflow-hidden">
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-secondary/80 via-background to-background" />
          <div
            aria-hidden
            className="absolute -top-40 right-[-10%] -z-10 size-[560px] rounded-full bg-sky/40 blur-3xl dark:bg-primary/15"
          />
          <div className="container grid items-center gap-12 px-4 pb-16 pt-12 md:px-6 md:pb-24 md:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-28">
            <div className="flex flex-col items-start">
              <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-background/80 px-3.5 py-1.5 text-sm font-medium text-muted-foreground shadow-sm ring-1 ring-border">
                <MapPin className="size-4 text-primary" />
                {heroT("eyebrow")}
              </span>
              <h1 className="mb-6 text-[2.6rem] font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl xl:text-[4.25rem]">
                {highlightAt < 0 ? (
                  heroTitle
                ) : (
                  <>
                    {heroTitle.slice(0, highlightAt)}
                    <span className="text-primary">{highlight}</span>
                    {heroTitle.slice(highlightAt + highlight.length)}
                  </>
                )}
              </h1>
              <p className="mb-8 max-w-xl text-lg text-muted-foreground md:text-xl">{heroT("description")}</p>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Button asChild size="lg" className="h-[3.25rem] rounded-full px-8 text-base font-semibold shadow-lg shadow-primary/20">
                  <a href="#contact">
                    {ctaT("reserve")}
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-[3.25rem] rounded-full px-6 text-base font-semibold">
                  <a href={`tel:${PHONE.tel}`}>
                    <Phone className="size-4 text-primary" />
                    {PHONE.display}
                  </a>
                </Button>
              </div>
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                {(["noCreditCard", "trial", "cancelAnytime"] as const).map((key) => (
                  <li key={key} className="flex items-center gap-1.5">
                    <Check className="size-4 text-primary" />
                    {heroT(`benefits.${key}`)}
                  </li>
                ))}
              </ul>
              <dl className="mt-10 grid w-full max-w-lg grid-cols-3 divide-x divide-border rounded-2xl bg-background/80 py-4 shadow-sm ring-1 ring-border">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="flex flex-col px-3 text-center sm:px-5">
                    <dt className="order-2 text-xs text-muted-foreground sm:text-sm">{stat.label}</dt>
                    <dd className="order-1 font-display text-xl font-extrabold tracking-tight sm:text-2xl">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
                <Image
                  src="/hero-2.webp"
                  fill
                  sizes="(min-width: 1024px) 45vw, (min-width: 448px) 448px, 100vw"
                  alt={heroT("imageAlt")}
                  className="object-cover"
                  priority
                />
              </div>
              {/* Floating badges */}
              <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl bg-background/95 p-3 pr-5 shadow-xl ring-1 ring-border backdrop-blur sm:-left-6">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Home className="size-5" />
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="font-display font-extrabold">{heroT("badgeTitle")}</span>
                  <span className="text-sm text-muted-foreground">{heroT("badgeText")}</span>
                </span>
              </div>
              <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-background/95 px-3.5 py-2 text-sm font-semibold shadow-lg ring-1 ring-border backdrop-blur sm:-right-4">
                <GraduationCap className="size-4 text-primary" />
                {heroT("teamChip")}
              </div>
            </div>
          </div>
        </section>

        {/* Before and after */}
        <section id="before-after" className="w-full overflow-hidden border-y bg-muted/60 py-20 md:py-28">
          <SectionHeading
            className="mb-12 px-4"
            eyebrow={bnaT("eyebrow")}
            title={bnaT("title")}
            description={bnaT("description")}
          />
          <BeforeAfterGallery
            beforeLabel={bnaT("before")}
            afterLabel={bnaT("after")}
            zoomLabel={bnaT("zoom")}
            before={beforeImages}
            after={afterImages}
          />
        </section>

        {/* Who we are: the team, with a link to the about page */}
        <section id="team" className="w-full py-20 md:py-28">
          <div className="container grid items-center gap-12 px-4 md:px-6 lg:grid-cols-2 lg:gap-20">
            <div className="reveal relative mx-auto w-full max-w-md lg:max-w-none">
              <div className="relative ml-auto aspect-[4/5] w-[78%] overflow-hidden rounded-[2rem] shadow-xl ring-1 ring-black/5 dark:ring-white/10">
                <Image
                  src="/img-1.webp"
                  fill
                  sizes="(min-width: 1024px) 36vw, 80vw"
                  alt={teamT("imageAlt")}
                  className="object-cover"
                />
              </div>
              <div className="absolute bottom-[-8%] left-0 aspect-square w-[46%] overflow-hidden rounded-3xl border-4 border-background shadow-xl">
                <Image
                  src="/img-2.webp"
                  fill
                  sizes="(min-width: 1024px) 22vw, 45vw"
                  alt={aboutT("crewImageAlt")}
                  className="object-cover object-top"
                />
              </div>
              <div className="absolute left-[4%] top-[8%] rounded-2xl bg-navy px-4 py-3 text-navy-foreground shadow-xl">
                <p className="font-display text-3xl font-extrabold leading-none">{statsT("years.value")}</p>
                <p className="mt-1 text-sm text-navy-foreground/80">{statsT("years.label")}</p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-6 pt-6 lg:pt-0">
              <SectionHeading align="left" eyebrow={teamT("badge")} title={teamT("title")} description={teamT("description")} />
              <ul className="reveal flex flex-col gap-3">
                {teamPoints.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-base">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                      <Check className="size-3.5" strokeWidth={3} />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" size="lg" className="reveal h-12 rounded-full px-6 font-semibold">
                <Link href="/about">
                  {teamT("link")}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="w-full bg-muted/60 py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <SectionHeading
              className="mb-14"
              eyebrow={featuresT("badge")}
              title={featuresT("title")}
              description={featuresT("description")}
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ title, description, Icon }) => (
                <div
                  key={title}
                  className="reveal group flex flex-col rounded-3xl bg-card p-7 shadow-sm ring-1 ring-border transition-shadow hover:shadow-lg"
                >
                  <span className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mb-2 text-lg font-bold">{title}</h3>
                  <p className="text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="w-full py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <SectionHeading
              className="mb-14"
              eyebrow={howItWorksT("badge")}
              title={howItWorksT("title")}
              description={howItWorksT("description")}
            />
            <ol className="relative grid gap-6 md:grid-cols-3 md:gap-8">
              {/* Line joining the three numbers on wide screens */}
              <span aria-hidden className="absolute left-[16%] right-[16%] top-8 hidden border-t-2 border-dashed border-border md:block" />
              {steps.map((step, i) => (
                <li key={step.title} className="reveal relative flex flex-col items-center text-center">
                  <span className="relative mb-6 flex size-16 items-center justify-center rounded-full bg-primary font-display text-xl font-extrabold text-primary-foreground shadow-lg shadow-primary/25 ring-8 ring-background">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mb-2 text-xl font-bold">{step.title}</h3>
                  <p className="max-w-xs text-muted-foreground">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="w-full border-y bg-muted/60 py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <SectionHeading className="mb-14" eyebrow={pricingT("eyebrow")} title={pricingT("title")} description={pricingT("description")} />
            <div className="mx-auto max-w-6xl">
              <div className="grid gap-5 md:grid-cols-3">
                {priceCards.map((card) => (
                  <div key={card.title} className="reveal flex flex-col rounded-3xl bg-card p-7 shadow-sm ring-1 ring-border">
                    <h3 className="text-2xl font-extrabold">{card.title}</h3>
                    <p className="mt-1 text-muted-foreground">{card.description}</p>
                    <ul className="mt-6 divide-y divide-border border-t">
                      {card.rows.map(([name, price]) => (
                        <li key={name} className="flex items-baseline justify-between gap-4 py-3.5">
                          <span className="text-muted-foreground">{label(name)}</span>
                          <span className="whitespace-nowrap text-right font-semibold">{price}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="reveal mt-6 flex flex-col items-start justify-between gap-6 rounded-3xl bg-navy p-7 text-navy-foreground dark:ring-1 dark:ring-white/10 md:flex-row md:items-center md:p-8">
                <div>
                  <p className="text-navy-foreground/80">{label(pricingT("footer.averageCost"))}</p>
                  <p className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">{pricingT("footer.averageRange")}</p>
                  <p className="mt-2 max-w-2xl text-sm text-navy-foreground/70">{pricingT("footer.note")}</p>
                </div>
                <Button
                  asChild
                  size="lg"
                  className="h-12 shrink-0 rounded-full bg-white px-7 font-semibold text-[hsl(210_79%_20%)] hover:bg-white/90"
                >
                  <a href="#contact">
                    {pricingT("footer.cta")}
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ: native <details>, so the answers are in the HTML even while closed */}
        <section id="faq" className="w-full py-20 md:py-28">
          <div className="container grid gap-12 px-4 md:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div className="flex flex-col gap-8 lg:sticky lg:top-28 lg:self-start">
              <SectionHeading align="left" eyebrow={faqT("badge")} title={faqT("title")} description={faqT("description")} />
              <div className="reveal rounded-3xl bg-secondary p-6">
                <p className="font-display text-lg font-bold">{faqT("moreTitle")}</p>
                <p className="mt-1 text-muted-foreground">{faqT("moreText")}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild className="h-11 rounded-full px-5 font-semibold">
                    <a href={`tel:${PHONE.tel}`}>
                      <Phone className="size-4" />
                      {ctaT("call")}
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="h-11 rounded-full px-5 font-semibold">
                    <a href={`sms:${PHONE.tel}`}>
                      <MessageSquare className="size-4" />
                      {contactT("sendSms")}
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {faqs.map((faq) => (
                <details
                  key={faq.question}
                  name="faq"
                  className="reveal group rounded-2xl bg-card ring-1 ring-border transition-shadow open:shadow-md"
                >
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-left [&::-webkit-details-marker]:hidden">
                    <h3 className="font-sans text-base font-semibold md:text-lg">{faq.question}</h3>
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary transition-transform duration-200 group-open:rotate-180">
                      <ChevronDown className="size-4" />
                    </span>
                  </summary>
                  <p className="px-6 pb-6 text-base leading-relaxed text-muted-foreground">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="w-full px-4 pb-20 md:px-6 md:pb-28">
          <div className="container relative overflow-hidden rounded-[2rem] bg-navy dark:ring-1 dark:ring-white/10 px-6 py-14 text-navy-foreground md:px-12 md:py-20">
            <div aria-hidden className="absolute -right-24 -top-24 size-80 rounded-full bg-sky/20 blur-3xl" />
            <div aria-hidden className="absolute -bottom-32 -left-16 size-80 rounded-full bg-primary/40 blur-3xl" />
            <div className="relative grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
              <div className="flex flex-col items-start gap-6">
                <SectionHeading align="left" invert eyebrow={contactT("badge")} title={contactT("title")} description={contactT("subtitle")} />
                <a
                  href={`tel:${PHONE.tel}`}
                  className="reveal font-display text-3xl font-extrabold tracking-tight underline-offset-8 hover:underline sm:text-4xl md:text-5xl"
                >
                  {PHONE.display}
                </a>
                <div className="reveal flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                  <Button
                    asChild
                    size="lg"
                    className="h-[3.25rem] rounded-full bg-white px-8 text-base font-semibold text-[hsl(210_79%_20%)] hover:bg-white/90"
                  >
                    <a href={`tel:${PHONE.tel}`}>
                      <Phone className="size-4" />
                      {contactT("callNow")}
                    </a>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-[3.25rem] rounded-full border-white/40 bg-transparent px-8 text-base font-semibold text-navy-foreground hover:bg-white/10 hover:text-navy-foreground"
                  >
                    <a href={`sms:${PHONE.tel}`}>
                      <MessageSquare className="size-4" />
                      {contactT("sendSms")}
                    </a>
                  </Button>
                </div>
              </div>

              <div className="reveal flex flex-col gap-3">
                {[
                  { Icon: Clock, title: contactT("businessHours"), text: contactT("hours") },
                  { Icon: MapPin, title: contactT("serviceArea"), text: contactT("serviceAreaValue") },
                  { Icon: GraduationCap, title: statsT("team.value"), text: teamPoints[0] },
                ].map(({ Icon, title, text }) => (
                  <div key={title} className="flex items-start gap-4 rounded-2xl bg-white/[0.07] p-5 ring-1 ring-white/15">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-sky">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <p className="text-sm text-navy-foreground/70">{title}</p>
                      <p className="font-semibold">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <ScrollToTop label={accessibilityT("scrollToTop")} />
    </div>
  )
}
