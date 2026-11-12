import type { Metadata } from "next"
import Image from "next/image"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { ArrowRight, Check, ChevronRight, MapPin, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import NavigationBar from "@/components/navigation-bar"
import { SectionHeading } from "@/components/section-heading"
import { SiteFooter } from "@/components/site-footer"
import { Link } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { PHONE, SERVICE_AREA, SITE_URL } from "@/lib/business"
import { pageMetadata } from "@/lib/metadata"
import { BUSINESS_ID, JsonLd, WEBSITE_ID, breadcrumbList, graph, localBusiness } from "@/lib/schema"

type Params = Promise<{ locale: string }>
type Promise_ = { title: string; text: string }

// Team members shown, by their key in about.team (messages/*.json). No portraits yet: the cards show initials.
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
  const statsT = await getTranslations("stats")

  const story = t.raw("story") as string[]
  const promises = t.raw("promises") as Promise_[]
  const stats = (["years", "houses", "team", "area"] as const).map((key) => ({
    value: statsT(`${key}.value`),
    label: statsT(`${key}.label`),
  }))

  const pageUrl = `${SITE_URL}/${locale}/about`
  const jsonLd = graph(
    localBusiness(locale, metaT("description"), t("team.member1.role")),
    {
      "@type": "AboutPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: metaT("aboutTitle"),
      description: metaT("aboutDescription"),
      inLanguage: locale,
      isPartOf: { "@id": WEBSITE_ID },
      about: { "@id": BUSINESS_ID },
      mainEntity: { "@id": BUSINESS_ID },
    },
    breadcrumbList([
      { name: navT("home"), url: `${SITE_URL}/${locale}` },
      { name: navT("about"), url: pageUrl },
    ]),
  )

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <JsonLd data={jsonLd} />
      <NavigationBar />
      <main className="flex-1">
        {/* Intro */}
        <section className="relative isolate w-full overflow-hidden">
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-secondary/80 via-background to-background" />
          <div aria-hidden className="absolute -top-40 left-[-10%] -z-10 size-[520px] rounded-full bg-sky/40 blur-3xl dark:bg-primary/15" />
          <div className="container px-4 pb-16 pt-10 md:px-6 md:pb-20 md:pt-14">
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex items-center gap-1 text-sm text-muted-foreground">
                <li>
                  <Link href="/" className="inline-flex min-h-11 items-center hover:text-foreground">
                    {navT("home")}
                  </Link>
                </li>
                <li aria-hidden>
                  <ChevronRight className="size-4" />
                </li>
                <li aria-current="page" className="font-medium text-foreground">
                  {navT("about")}
                </li>
              </ol>
            </nav>
            <div className="max-w-3xl">
              <h1 className="mb-6 text-[2.6rem] font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">{t("title")}</h1>
              <p className="text-lg text-muted-foreground md:text-xl">{t("lead")}</p>
            </div>
            <dl className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col rounded-2xl bg-background/80 p-5 shadow-sm ring-1 ring-border md:p-6">
                  <dt className="order-2 text-sm text-muted-foreground">{stat.label}</dt>
                  <dd className="order-1 font-display text-2xl font-extrabold tracking-tight md:text-3xl">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Story */}
        <section className="w-full py-16 md:py-24">
          <div className="container grid items-center gap-12 px-4 md:px-6 lg:grid-cols-2 lg:gap-20">
            <div className="flex flex-col gap-5">
              <SectionHeading align="left" title={t("storyTitle")} />
              {story.map((paragraph) => (
                <p key={paragraph} className="reveal text-lg leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="reveal relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] lg:aspect-[5/4] shadow-xl ring-1 ring-black/5 dark:ring-white/10 lg:max-w-none">
              <Image
                src="/hero-1.webp"
                fill
                sizes="(min-width: 1024px) 45vw, (min-width: 448px) 448px, 100vw"
                alt={t("storyImageAlt")}
                className="object-cover object-[center_65%]"
                priority
              />
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="w-full border-y bg-muted/60 py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <SectionHeading className="mb-12" title={t("teamTitle")} description={t("teamDescription")} />
            <ul className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {TEAM.map((member) => (
                <li key={member} className="reveal flex flex-col items-center rounded-3xl bg-card p-8 text-center shadow-sm ring-1 ring-border">
                  <span
                    aria-hidden
                    className="mb-5 flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-primary to-navy font-display text-3xl font-extrabold text-white shadow-lg"
                  >
                    {initials(t(`team.${member}.name`))}
                  </span>
                  <h3 className="text-xl font-bold">{t(`team.${member}.name`)}</h3>
                  <p className="mt-1 text-muted-foreground">{t(`team.${member}.role`)}</p>
                </li>
              ))}
              <li className="reveal relative isolate flex min-h-64 flex-col justify-end overflow-hidden rounded-3xl p-8 text-white shadow-sm sm:col-span-2 lg:col-span-1">
                <Image
                  src="/img-2.webp"
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 90vw, 100vw"
                  alt={t("crewImageAlt")}
                  className="-z-10 object-cover object-[center_75%]"
                />
                <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/50 to-black/0" />
                <h3 className="text-xl font-bold">{t("team.crew.name")}</h3>
                <p className="mt-1 text-white/85">{t("team.crew.role")}</p>
              </li>
            </ul>
          </div>
        </section>

        {/* Promises */}
        <section className="w-full py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <SectionHeading className="mb-12" title={t("promisesTitle")} />
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {promises.map((promise) => (
                <li key={promise.title} className="reveal rounded-3xl bg-card p-7 shadow-sm ring-1 ring-border">
                  <span className="mb-5 flex size-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                    <Check className="size-5" strokeWidth={3} />
                  </span>
                  <h3 className="mb-2 text-lg font-bold">{promise.title}</h3>
                  <p className="text-muted-foreground">{promise.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Service area */}
        <section className="w-full border-y bg-muted/60 py-16 md:py-24">
          <div className="container grid gap-10 px-4 md:px-6 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <SectionHeading align="left" title={t("areaTitle")} description={t("areaText")} />
            <div className="reveal flex flex-col gap-6">
              <ul className="flex flex-wrap gap-2">
                {SERVICE_AREA.map((town) => (
                  <li
                    key={town}
                    className="inline-flex items-center gap-1.5 rounded-full bg-card px-4 py-2 font-medium shadow-sm ring-1 ring-border"
                  >
                    <MapPin className="size-4 text-primary" />
                    {town}
                  </li>
                ))}
              </ul>
              <p className="text-muted-foreground">{t("areaMore")}</p>
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="w-full px-4 py-16 md:px-6 md:py-24">
          <div className="container relative overflow-hidden rounded-[2rem] bg-navy dark:ring-1 dark:ring-white/10 px-6 py-14 text-navy-foreground md:px-12 md:py-16">
            <div aria-hidden className="absolute -right-24 -top-24 size-80 rounded-full bg-sky/20 blur-3xl" />
            <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
              <SectionHeading align="left" invert title={t("ctaTitle")} description={t("cta")} />
              <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-[3.25rem] rounded-full bg-white px-8 text-base font-semibold text-[hsl(210_79%_20%)] hover:bg-white/90"
                >
                  <Link href="/#contact">
                    {ctaT("reserve")}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-[3.25rem] rounded-full border-white/40 bg-transparent px-7 text-base font-semibold text-navy-foreground hover:bg-white/10 hover:text-navy-foreground"
                >
                  <a href={`tel:${PHONE.tel}`}>
                    <Phone className="size-4" />
                    {PHONE.display}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
