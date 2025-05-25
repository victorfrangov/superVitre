"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  Check,
  ArrowRight,
  Star,
  Zap,
  Shield,
  ArrowUp,
  Droplets,
  Leaf,
  CalendarDays,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Tabs } from "@/components/ui/tabs"
import NavigationBar from "@/components/navigation-bar"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/app/firebase/config"

interface FaqItem {
  question: string
  answer: string
}

interface DisplayFeedback {
  id: string
  quote: string
  author: string
  rating: number
  role?: string
}

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [approvedFeedbacks, setApprovedFeedbacks] = useState<DisplayFeedback[]>([])
  const [feedbacksLoading, setFeedbacksLoading] = useState(true)

  // Get translations
  const t = useTranslations()
  const navT = useTranslations("navigation")
  const heroT = useTranslations("hero")
  const ctaT = useTranslations("cta")
  const featuresT = useTranslations("features")
  const howItWorksT = useTranslations("howItWorks")
  const testimonialsT = useTranslations("testimonials")
  const pricingT = useTranslations("pricing")
  const faqT = useTranslations("faq")
  const finalCtaT = useTranslations("finalCta")
  const footerT = useTranslations("footer")
  const accessibilityT = useTranslations("accessibility")

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)

    const fetchApprovedFeedbacks = async () => {
      setFeedbacksLoading(true)
      try {
        const feedbacksRef = collection(db, "feedbacks")
        const q = query(
          feedbacksRef,
          where("status", "==", "approved"),
          where("allowPublic", "==", true),
          orderBy("submittedAt", "desc") // Or any other order you prefer
        )
        const querySnapshot = await getDocs(q)
        const feedbacks: DisplayFeedback[] = querySnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            quote: data.message,
            author: data.fictionalName || testimonialsT("defaultAuthorName", { defaultValue: "Anonymous User" }),
            rating: data.rating,
            role: testimonialsT("customerRole", { defaultValue: "Valued Customer" }),
          }
        })
        setApprovedFeedbacks(feedbacks)
      } catch (error) {
        console.error("Error fetching approved feedbacks:", error)
        // Optionally set an error state here
      } finally {
        setFeedbacksLoading(false)
      }
    }

    fetchApprovedFeedbacks()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [testimonialsT])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
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

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <NavigationBar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 overflow-hidden">
          <div className="container px-4 md:px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto mb-12"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl lg:leading-tight font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                {heroT("title")}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">{heroT("description")}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/reservations">
                  <Button size="lg" className="rounded-full h-12 px-8 text-base">
                    {ctaT("reserve")}
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
                <Link href="#faq">
                  <Button size="lg" variant="outline" className="rounded-full h-12 px-8 text-base">
                    {ctaT("haveAQuestion")}
                  </Button>
                </Link>
              </div>
              <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative mx-auto max-w-5xl"
            >
              <div className="rounded-xl overflow-hidden shadow-2xl border border-border/40 bg-gradient-to-b from-background to-muted/20">
                <Image
                  src="https://www.laveurdecarreaux.com/new/wp-content/uploads/2019/06/laveur-vitre-carreau-nettoyeur-1.jpg"
                  width={1280}
                  height={720}
                  alt="SuperVitre dashboard"
                  className="w-full h-auto"
                  priority
                />
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/10 dark:ring-white/10"></div>
              </div>
              <div className="absolute -bottom-6 -right-6 -z-10 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 blur-3xl opacity-70"></div>
              <div className="absolute -top-6 -left-6 -z-10 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-secondary/30 to-primary/30 blur-3xl opacity-70"></div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
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
            </motion.div>
            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {features.map((feature, i) => (
                <motion.div key={i} variants={item}>
                  <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="size-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary mb-4">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-20 md:py-32 bg-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_40%,transparent_100%)]"></div>

          <div className="container px-4 md:px-6 relative">
            <motion.div
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
            </motion.div>

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
                <motion.div
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
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-200 md:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{testimonialsT("title")}</h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg">{testimonialsT("description")}</p>
            </motion.div>
            {feedbacksLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : approvedFeedbacks.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {approvedFeedbacks.map((testimonial, i) => (
                  <motion.div
                    key={testimonial.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                  >
                    <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md">
                      <CardContent className="p-6 flex flex-col h-full">
                        <div className="flex mb-4">
                          {Array(testimonial.rating)
                            .fill(0)
                            .map((_, j) => (
                              <Star key={j} className="size-4 text-yellow-500 fill-yellow-500" />
                            ))}
                          {Array(5 - testimonial.rating)
                            .fill(0)
                            .map((_, j) => (
                              <Star key={`empty-${j}`} className="size-4 text-muted-foreground" />
                            ))}
                        </div>
                        <p className="text-lg mb-6 flex-grow italic">&quot;{testimonial.quote}&quot;</p>
                        <div className="flex items-center gap-4 mt-auto pt-4 border-t border-border/40">
                          <div className="size-10 rounded-full bg-muted flex items-center justify-center text-foreground font-medium">
                            {testimonial.author.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{testimonial.author}</p>
                            {testimonial.role && <p className="text-sm text-muted-foreground">{testimonial.role}</p>}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">{testimonialsT("noFeedback", { defaultValue: "No feedback to display at the moment." })}</p>
            )}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-12 text-center"
            >
              <p className="text-lg text-muted-foreground mb-4">{testimonialsT("leaveReview")}</p>
              <Link href="/feedback">
                <Button size="lg" variant="outline" className="rounded-full h-12 px-8 text-base">
                  {testimonialsT("shareFeedback")}
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-20 md:py-32 bg-muted/30 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_40%,transparent_100%)]"></div>

          <div className="container px-4 md:px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{pricingT("title")}</h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg">{pricingT("description")}</p>
            </motion.div>

            <div className="mx-auto max-w-5xl">
              <Tabs defaultValue="monthly" className="w-full">
                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    {
                      title: pricingT("plans.basic.title"),
                      price: pricingT("plans.basic.price"),
                      description: pricingT("plans.basic.description"),
                      features: pricingT.raw("plans.basic.features"),
                      cta: pricingT("plans.basic.cta"),
                    },
                    {
                      title: pricingT("plans.pro.title"),
                      price: pricingT("plans.pro.price"),
                      description: pricingT("plans.pro.description"),
                      features: pricingT.raw("plans.pro.features"),
                      cta: pricingT("plans.pro.cta"),
                      popular: true,
                    },
                    {
                      title: pricingT("plans.enterprise.title"),
                      price: pricingT("plans.enterprise.price"),
                      description: pricingT("plans.enterprise.description"),
                      features: pricingT.raw("plans.enterprise.features"),
                      cta: pricingT("plans.enterprise.cta"),
                    },
                  ].map((plan, i) => (
                    <Card key={i} className={`flex flex-col relative ${plan.popular ? "border-primary ring-2 ring-primary shadow-lg" : "border-border/40"} ${i === 1 ? "mt-4 md:mt-0" : ""}`}>
                      {plan.popular && (
                        <Badge className="absolute top-[-2.5rem] left-1/2 transform -translate-x-1/2 rounded-full px-3 py-1 text-sm font-medium">
                          {pricingT("plans.pro.popular")}
                        </Badge>
                      )}
                      <CardHeader className="pt-8">
                        <CardTitle className="text-2xl font-bold">{plan.title}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <Tabs defaultValue="monthly" className="w-full">
                          <div className="text-4xl font-bold mb-2">
                            <span>{plan.price}</span>
                          </div>
                        </Tabs>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                          {plan.features.map((feature: string, idx: number) => (
                            <li key={idx} className="flex items-center gap-2">
                              <Check className="size-4 text-primary" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full rounded-full" variant={plan.popular ? "default" : "outline"}>
                          {plan.cta}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </Tabs>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
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
            </motion.div>

            <div className="mx-auto max-w-3xl">
              <Accordion type="single" collapsible className="w-full">
                {faqT.raw("questions").map((faq: FaqItem, i: number) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <AccordionItem value={`item-${i}`} className="border-b border-border/40 py-2">
                      <AccordionTrigger className="text-left font-medium hover:no-underline">{faq.question}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 md:py-32 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 -z-10"></div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

          <div className="container px-4 md:px-6 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-6 text-center"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">{finalCtaT("title")}</h2>
              <p className="mx-auto max-w-[700px] text-primary-foreground/80 md:text-xl">{finalCtaT("description")}</p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Link href="/reservations">
                  <Button size="lg" variant="secondary" className="rounded-full h-12 px-8 text-base">
                    {ctaT("reserve")}
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full h-12 px-8 text-base bg-transparent border-white text-white hover:bg-white/10"
                  >
                    {ctaT("haveAQuestion")}
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-primary-foreground/80 mt-4">{finalCtaT("footnote")}</p>
            </motion.div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t bg-background/95 backdrop-blur-sm">
        <div className="container flex flex-col gap-8 px-4 py-10 md:px-6 lg:py-16">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-bold">
                <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground">
                  S
                </div>
                <span>SuperVitre</span>
              </div>
              <p className="text-sm text-muted-foreground">{footerT("about")}</p>
              {/* Social links */}
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-bold">{footerT("categories.product")}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/reservations" className="text-muted-foreground hover:text-foreground transition-colors">
                    {navT("reservations")}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                    {navT("contact")}
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                    {navT("pricing")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to top button logic */}
      {isScrolled && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 size-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center z-50 hover:bg-primary/90 transition-colors"
          aria-label={accessibilityT("scrollToTop")}
        >
          <ArrowUp className="size-5" />
        </motion.button>
      )}
    </div>
  )
}
