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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import NavigationBar from "@/components/navigation-bar"
import { BeforeAfterGallery } from "@/components/before-after-gallery"
import { MotionDiv } from "@/components/motion"
import { ScrollToTop } from "@/components/scroll-to-top"
import { SiteFooter } from "@/components/site-footer"
import { routing } from "@/i18n/routing"
import { PHONE, SITE_URL } from "@/lib/business"
import { pageMetadata } from "@/lib/metadata"
import { BUSINESS_ID, WEBSITE_ID, faqPage, graph, localBusiness, webSite } from "@/lib/schema"

type Params = Promise<{ locale: string }>
type FaqItem = { question: string; answer: string }

// Before/after photos in /public/avantapres; their alt text is beforeAfter.beforeAlts / afterAlts in messages/*.json
const BEFORE_COUNT = 8
const AFTER_COUNT = 9

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "meta" })
  return pageMetadata({ locale, path: "", title: t("title"), description: t("description"), imageAlt: t("ogImageAlt") })
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default async function LandingPage({ params }: { params: Params }) {
  const { locale } = await params
  setRequestLocale(locale)

  const metaT = await getTranslations("meta")
  const navT = await getTranslations("navigation")
  const bnaT = await getTranslations("beforeAfter")
  const heroT = await getTranslations("hero")
  const ctaT = await getTranslations("cta")
  const featuresT = await getTranslations("features")
  const howItWorksT = await getTranslations("howItWorks")
  const pricingT = await getTranslations("pricing")
  const faqT = await getTranslations("faq")
  const accessibilityT = await getTranslations("accessibility")
  const contactT = await getTranslations("contact")

  const faqs = faqT.raw("questions") as FaqItem[]
  const beforeAlts = bnaT.raw("beforeAlts") as string[]
  const afterAlts = bnaT.raw("afterAlts") as string[]
  const beforeImages = Array.from({ length: BEFORE_COUNT }, (_, i) => ({ src: `/avantapres/avant-${i + 1}.webp`, alt: beforeAlts[i] }))
  const afterImages = Array.from({ length: AFTER_COUNT }, (_, i) => ({ src: `/avantapres/apres-${i + 1}.webp`, alt: afterAlts[i] }))

  const features = [
    {
      title: featuresT("items.professionalCleaning.title"),
      description: featuresT("items.professionalCleaning.description"),
      icon: <Zap className="size-5" />,
    },
    {
      title: featuresT("items.streakFree.title"),
      description: featuresT("items.streakFree.description"),
      icon: <Droplets className="size-5" />,
    },
    {
      title: featuresT("items.ecoFriendly.title"),
      description: featuresT("items.ecoFriendly.description"),
      icon: <Leaf className="size-5" />,
    },
    {
      title: featuresT("items.safetyFirst.title"),
      description: featuresT("items.safetyFirst.description"),
      icon: <Shield className="size-5" />,
    },
    {
      title: featuresT("items.flexibleScheduling.title"),
      description: featuresT("items.flexibleScheduling.description"),
      icon: <CalendarDays className="size-5" />,
    },
    {
      title: featuresT("items.satisfactionGuaranteed.title"),
      description: featuresT("items.satisfactionGuaranteed.description"),
      icon: <Star className="size-5" />,
    },
  ]

  const pageUrl = `${SITE_URL}/${locale}`
  const jsonLd = graph(
    localBusiness(locale, metaT("description")),
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
    faqPage(pageUrl, locale, faqs),
  )

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <NavigationBar />
      <main className="flex-1">
        {/* Hero Section: no entrance animation, so the heading and photo paint before the JavaScript loads */}
        <section className="w-full py-20 md:py-32 lg:py-40 overflow-hidden">
          <div className="container px-4 md:px-6 relative flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12 xl:gap-16">
            <div className="lg:w-1/2 xl:w-[45%] lg:max-w-2xl text-center lg:text-left mx-auto lg:mx-0 mb-12 lg:mb-0 flex flex-col items-center lg:items-start">
              <h1 className="text-4xl md:text-5xl lg:text-6xl lg:leading-tight font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                {heroT("title")}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">{heroT("description")}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button asChild size="lg" className="rounded-full h-12 px-8 text-base">
                  <a href="#contact">
                    {ctaT("reserve")}
                    <ArrowRight className="ml-2 size-4" />
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full h-12 px-8 text-base">
                  <a href="#faq">{ctaT("haveAQuestion")}</a>
                </Button>
              </div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Check className="size-4 text-primary" />
                  <span>{heroT("benefits.noCreditCard")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="size-4 text-primary" />
                  <span>{heroT("benefits.trial")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="size-4 text-primary" />
                  <span>{heroT("benefits.cancelAnytime")}</span>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 xl:w-[55%] relative w-full mx-auto lg:mx-0 lg:-mt-16">
              <div className="rounded-xl overflow-hidden shadow-2xl border border-border/40 bg-gradient-to-b from-background to-muted/20 aspect-[1/1]">
                <Image
                  src="/hero-2.webp"
                  width={960}
                  height={1280}
                  sizes="(min-width: 1280px) 55vw, (min-width: 1024px) 50vw, 100vw"
                  alt={heroT("imageAlt")}
                  className="w-full h-full object-cover"
                  priority
                />
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/10 dark:ring-white/10"></div>
              </div>
              {/* Decorative blurs - their positioning is relative to this div, so should adapt */}
              <div className="absolute -bottom-6 -right-6 -z-10 h-[200px] w-[200px] md:h-[300px] md:w-[300px] rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 blur-3xl opacity-50 lg:opacity-70"></div>
              <div className="absolute -top-6 -left-6 -z-10 h-[200px] w-[200px] md:h-[300px] md:w-[300px] rounded-full bg-gradient-to-br from-secondary/30 to-primary/30 blur-3xl opacity-50 lg:opacity-70"></div>
            </div>
          </div>
        </section>

        {/* Before and After Section with Seamless Auto-Scroll */}
        <section id="before-after" className="w-full py-20 md:py-32 bg-muted/30">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{bnaT("title")}</h2>
            <p className="max-w-[800px] text-muted-foreground md:text-lg">{bnaT("description")}</p>
          </div>
          <BeforeAfterGallery
            beforeLabel={bnaT("before")}
            afterLabel={bnaT("after")}
            zoomLabel={bnaT("zoom")}
            before={beforeImages}
            after={afterImages}
          />
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
                {featuresT("badge")}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{featuresT("title")}</h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg">{featuresT("description")}</p>
            </MotionDiv>
            <MotionDiv
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {features.map((feature, i) => (
                <MotionDiv key={i} variants={item}>
                  <Card className="h-full overflow-hidden border border-black/10 dark:border-white/30 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="size-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-4">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </MotionDiv>
              ))}
            </MotionDiv>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-20 md:py-32 bg-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_40%,transparent_100%)]"></div>

          <div className="container px-4 md:px-6 relative">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-16"
            >
              <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
                {howItWorksT("badge")}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{howItWorksT("title")}</h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg">{howItWorksT("description")}</p>
            </MotionDiv>

            <div className="grid md:grid-cols-3 gap-8 md:gap-12 relative">
              {[
                {
                  step: "01",
                  title: howItWorksT("steps.step1.title"),
                  description: howItWorksT("steps.step1.description"),
                },
                {
                  step: "02",
                  title: howItWorksT("steps.step2.title"),
                  description: howItWorksT("steps.step2.description"),
                },
                {
                  step: "03",
                  title: howItWorksT("steps.step3.title"),
                  description: howItWorksT("steps.step3.description"),
                },
              ].map((step, i) => (
                <MotionDiv
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative z-10 flex flex-col items-center text-center space-y-4"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-xl font-bold shadow-lg">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </MotionDiv>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-20 md:py-32 bg-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_40%,transparent_100%)]"></div>
          <div className="container px-4 md:px-6 relative">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{pricingT("title")}</h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg">{pricingT("description")}</p>
            </MotionDiv>
            <div className="mx-auto max-w-5xl">
              <div className="grid gap-8 md:grid-cols-3">
                {/* Small Windows */}
                <Card className="flex flex-col border border-black/10 dark:border-white/30">
                  <CardHeader className="pt-8">
                    <CardTitle className="text-2xl font-bold">{pricingT("smallWindows.title")}</CardTitle>
                    <CardDescription>{pricingT("smallWindows.description")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-base text-muted-foreground">
                      <li>
                        <span className="font-semibold text-foreground">{pricingT("exteriorOnly")}</span>{pricingT("smallWindows.extPrice")}
                      </li>
                      <li>
                        <span className="font-semibold text-foreground">{pricingT("interiorExterior")}</span>{pricingT("smallWindows.extIntPrice")}
                      </li>
                      <li>
                        <span className="font-semibold text-foreground">{pricingT("borders")}</span>{pricingT("included")}
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                {/* Large Windows */}
                <Card className="flex flex-col border border-black/10 dark:border-white/30">
                  <CardHeader className="pt-8">
                    <CardTitle className="text-2xl font-bold">{pricingT("largeWindows.title")}</CardTitle>
                    <CardDescription>{pricingT("largeWindows.description")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-base text-muted-foreground">
                      <li>
                        <span className="font-semibold text-foreground">{pricingT("exteriorOnly")}</span>{pricingT("largeWindows.extPrice")}
                      </li>
                      <li>
                        <span className="font-semibold text-foreground">{pricingT("interiorExterior")}</span>{pricingT("largeWindows.extIntPrice")}
                      </li>
                      <li>
                        <span className="font-semibold text-foreground">{pricingT("borders")}</span>{pricingT("included")}
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                {/* Add-ons & Extras */}
                <Card className="flex flex-col border border-black/10 dark:border-white/30">
                  <CardHeader className="pt-8">
                    <CardTitle className="text-2xl font-bold">{pricingT("extras.title")}</CardTitle>
                    <CardDescription>{pricingT("extras.description")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-base text-muted-foreground">
                      <li>
                        <span className="font-semibold text-foreground">{pricingT("extras.seal.title")}</span>{pricingT("extras.seal.price")}
                      </li>
                      <li>
                        <span className="font-semibold text-foreground">{pricingT("extras.screens.title")}</span>{pricingT("extras.screens.price")}
                      </li>
                      <li>
                        <span className="font-semibold text-foreground">{pricingT("extras.extraFloors.title")}</span>{pricingT("extras.extraFloors.price")}
                      </li>
                      <li>
                        <span className="font-semibold text-foreground">{pricingT("extras.gutters.title")}</span>{pricingT("extras.gutters.price")}
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              <div className="mt-10 text-center">
                <div className="text-lg font-semibold text-primary">
                  {pricingT("footer.averageCost")}
                  <span className="font-bold">{pricingT("footer.averageRange")}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {pricingT("footer.note")}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section: native <details>, so the answers are in the HTML even while closed */}
        <section id="faq" className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
                {faqT("badge")}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{faqT("title")}</h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg">{faqT("description")}</p>
            </MotionDiv>

            <div className="mx-auto max-w-3xl">
              {faqs.map((faq, i) => (
                <MotionDiv
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <details name="faq" className="group border-b border-border/40 py-2">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-medium [&::-webkit-details-marker]:hidden">
                      <h3>{faq.question}</h3>
                      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180" />
                    </summary>
                    <p className="pb-4 text-sm text-muted-foreground">{faq.answer}</p>
                  </details>
                </MotionDiv>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section
          id="contact"
          className="w-full py-20 md:py-32 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground relative overflow-hidden"
        >
          {/* decorative blur like CTA */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl -z-10"></div>

          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
                {contactT("badge")}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{contactT("title")}</h2>
              <p className="max-w-[800px] text-primary-foreground/80 md:text-lg">{contactT("subtitle")}</p>
            </div>

            <div className="mx-auto max-w-5xl grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Phone card */}
              <Card className="border border-black/20 dark:border-white/60 bg-white/15 dark:bg-white/10 backdrop-blur-sm text-primary-foreground">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-white/20 dark:bg-white/15 flex items-center justify-center text-primary-foreground">
                      <Phone className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm text-primary-foreground/80">{contactT("callUs")}</p>
                      <p className="text-lg font-semibold">{PHONE.display}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      asChild
                      className="h-11 rounded-full border border-white/30 bg-white/50 text-primary hover:bg-white/70 dark:bg-white/30 dark:text-white dark:hover:bg-white/20"
                    >
                      <a href={`tel:${PHONE.tel}`}>
                        {contactT("callNow")}
                        <ArrowRight className="ml-2 size-4" />
                      </a>
                    </Button>
                    <Button
                      asChild
                      className="h-11 rounded-full border border-white/30 bg-white/30 text-primary hover:bg-white/50 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                    >
                      <a href={`sms:${PHONE.tel}`}>{contactT("sendSms")}</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Hours */}
              <Card className="border border-black/20 dark:border-white/60 bg-white/15 dark:bg-white/10 backdrop-blur-sm text-primary-foreground">
                <CardContent className="p-6 flex items-start gap-3">
                  <div className="size-10 rounded-full bg-white/20 dark:bg-white/15 flex items-center justify-center text-primary-foreground shrink-0">
                    <Clock className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm text-primary-foreground/80">{contactT("businessHours")}</p>
                    <p className="text-lg font-semibold">{contactT("hours")}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Service area */}
              <Card className="border border-black/20 dark:border-white/60 bg-white/15 dark:bg-white/10 backdrop-blur-sm text-primary-foreground sm:col-span-2 lg:col-span-1">
                <CardContent className="p-6 flex items-start gap-3">
                  <div className="size-10 rounded-full bg-white/20 dark:bg-white/15 flex items-center justify-center text-primary-foreground shrink-0">
                    <MapPin className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm text-primary-foreground/80">{contactT("serviceArea")}</p>
                    <p className="text-lg font-semibold">{contactT("serviceAreaValue")}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <ScrollToTop label={accessibilityT("scrollToTop")} />
    </div>
  )
}
