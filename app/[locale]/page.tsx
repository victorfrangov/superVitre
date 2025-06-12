"use client"

import { useState, useEffect, useRef } from "react"
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
  Image as ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import NavigationBar from "@/components/navigation-bar"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/app/firebase/config"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"

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
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null)
  const [heroImageLoading, setHeroImageLoading] = useState(true)
  const [beforeImages, setBeforeImages] = useState<string[]>([]);
  const [afterImages, setAfterImages] = useState<string[]>([]);
  const [modalImage, setModalImage] = useState<{ url: string; label: string } | null>(null);
  const [beforeAfterLoading, setBeforeAfterLoading] = useState(true)

  // Add refs for scrolling containers
  const beforeScrollRef = useRef<HTMLDivElement>(null)
  const afterScrollRef = useRef<HTMLDivElement>(null)

  // Get translations
  const t = useTranslations()
  const navT = useTranslations("navigation")
  const bnaT = useTranslations("beforeAfter")
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

    const fetchHeroImage = async () => {
      setHeroImageLoading(true);
      try {
        // Set the hero image URL directly from the CDN
        setHeroImageUrl("https://cdn.supervitre.net/hero-2.webp"); 
      } catch (error) {
        // This catch block might be less relevant for a static URL,
        // but kept in case of future changes or if an error state is still desired.
        console.error("Error setting hero image URL (CDN):", error);
      } finally {
        setHeroImageLoading(false);
      }
    };

    const fetchBeforeAfterImages = async () => {
      setBeforeAfterLoading(true);
      const cdnBaseUrl = "https://cdn.supervitre.net/avantapres/";
      const maxImagesToCheck = 50; // Max number of images to check for each category

      const verifiedBefores: string[] = [];
      const verifiedAfters: string[] = [];

      // Helper function to check if an image URL is valid using the Image object
      const checkImageExists = (url: string): Promise<string | null> => {
        return new Promise((resolve) => {
          const img = new window.Image();
          img.onload = () => resolve(url); // Image exists
          img.onerror = () => resolve(null); // Image doesn't exist or error loading
          img.src = url;
        });
      };

      // Check "before" images sequentially
      for (let i = 1; i <= maxImagesToCheck; i++) {
        const imageUrl = `${cdnBaseUrl}avant-${i}.webp`;
        const existingUrl = await checkImageExists(imageUrl);
        if (existingUrl) {
          verifiedBefores.push(existingUrl);
        } else {
          // Assuming images are sequential, if one is missing, stop checking for more "before" images
          break;
        }
      }

      // Check "after" images sequentially
      for (let i = 1; i <= maxImagesToCheck; i++) {
        const imageUrl = `${cdnBaseUrl}apres-${i}.webp`;
        const existingUrl = await checkImageExists(imageUrl);
        if (existingUrl) {
          verifiedAfters.push(existingUrl);
        } else {
          // Assuming images are sequential, if one is missing, stop checking for more "after" images
          break;
        }
      }

      setBeforeImages(verifiedBefores);
      setAfterImages(verifiedAfters);
      setBeforeAfterLoading(false);
    };

    fetchApprovedFeedbacks()
    fetchHeroImage()
    fetchBeforeAfterImages()

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

  // Auto-scroll effect for before/after images
  useEffect(() => {
    let beforeInterval: NodeJS.Timeout | null = null
    let afterInterval: NodeJS.Timeout | null = null

    function startAutoScroll(ref: React.RefObject<HTMLDivElement>) {
      if (!ref.current) return
      let scrollAmount = 0
      const scrollStep = 1 // px per tick
      const scrollDelay = 20 // ms per tick

      return setInterval(() => {
        if (!ref.current) return
        if (
          ref.current.scrollLeft + ref.current.offsetWidth >=
          ref.current.scrollWidth
        ) {
          // Reset to start for infinite loop
          ref.current.scrollLeft = 0
        } else {
          ref.current.scrollLeft += scrollStep
        }
      }, scrollDelay)
    }

    if (beforeImages.length > 1) {
      beforeInterval = startAutoScroll(beforeScrollRef)
    }
    if (afterImages.length > 1) {
      afterInterval = startAutoScroll(afterScrollRef)
    }

    return () => {
      if (beforeInterval) clearInterval(beforeInterval)
      if (afterInterval) clearInterval(afterInterval)
    }
  }, [beforeImages, afterImages])

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <NavigationBar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 overflow-hidden">
          <div className="container px-4 md:px-6 relative flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12 xl:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:w-1/2 xl:w-[45%] lg:max-w-2xl text-center lg:text-left mx-auto lg:mx-0 mb-12 lg:mb-0 flex flex-col items-center lg:items-start"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl lg:leading-tight font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                {heroT("title")}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">{heroT("description")}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
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
            </motion.div>

            {/* Image Content Block - Adjusted for side-by-side layout */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:w-1/2 xl:w-[55%] relative w-full mx-auto lg:mx-0 lg:-mt-16" // Added lg:-mt-16 to move image up
            >
              <div className="rounded-xl overflow-hidden shadow-2xl border border-border/40 bg-gradient-to-b from-background to-muted/20 aspect-[1/1]">
                {heroImageLoading ? (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <ImageIcon className="size-16 text-muted-foreground animate-pulse" />
                  </div>
                ) : heroImageUrl ? (
                  <Image
                    src={heroImageUrl}
                    width={1280} // Original width, aspect ratio will be maintained
                    height={960} // Adjusted height for 4/3 based on 1280 width
                    alt={heroT("imageAlt", {defaultValue: "Professional window cleaning service"})}
                    className="w-full h-full object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                     <ImageIcon className="size-16 text-destructive" /> 
                     <p className="ml-2 text-destructive">{heroT("imageLoadError", {defaultValue: "Image unavailable"})}</p>
                  </div>
                )}
                <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-black/10 dark:ring-white/10"></div>
              </div>
              {/* Decorative blurs - their positioning is relative to this motion.div, so should adapt */}
              <div className="absolute -bottom-6 -right-6 -z-10 h-[200px] w-[200px] md:h-[300px] md:w-[300px] rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 blur-3xl opacity-50 lg:opacity-70"></div>
              <div className="absolute -top-6 -left-6 -z-10 h-[200px] w-[200px] md:h-[300px] md:w-[300px] rounded-full bg-gradient-to-br from-secondary/30 to-primary/30 blur-3xl opacity-50 lg:opacity-70"></div>
            </motion.div>
          </div>
        </section>

        {/* Before and After Section with Seamless Auto-Scroll */}
        <section id="before-after" className="w-full py-20 md:py-32 bg-muted/30">
          {/* Remove container for full width */}
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              {bnaT("title", { defaultValue: "See the Difference!" })}
            </h2>
            <p className="max-w-[800px] text-muted-foreground md:text-lg">
              {bnaT("description", { defaultValue: "Swipe through our real results. Tap any image to zoom in!" })}
            </p>
          </div>
          {beforeAfterLoading ? (
            <div className="flex justify-center items-center h-40">
              <ImageIcon className="size-16 text-muted-foreground animate-pulse" />
            </div>
          ) : (
            <>
              {/* Before Images Auto-Scroll (scroll left) */}
              <div className="mb-10 w-full">
                <h3 className="text-xl font-bold mb-4 text-center">{bnaT("before", { defaultValue: "Before" })}</h3>
                <div className="relative overflow-hidden w-full">
                  <div className="flex animate-scroll-left space-x-6 group w-max">
                    {[...beforeImages, ...beforeImages].map((url, idx) => (
                      <button
                        key={idx}
                        className="flex-shrink-0 rounded-xl overflow-hidden border border-border/40 bg-gradient-to-b from-background to-muted/20 w-64 h-80 transition-transform hover:scale-105"
                        onClick={() => setModalImage({ url, label: `${bnaT("before", { defaultValue: "Before" })} ${((idx % beforeImages.length) + 1)}` })}
                        aria-label={`Voir avant ${((idx % beforeImages.length) + 1)}`}
                        type="button"
                      >
                        <Image
                          src={url}
                          width={320}
                          height={400}
                          alt={`Before cleaning ${((idx % beforeImages.length) + 1)}`}
                          className="w-full h-full object-cover"
                          priority // Add priority to all images
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* After Images Auto-Scroll (scroll right) */}
              <div className="w-full">
                <h3 className="text-xl font-bold mb-4 text-center">{bnaT("after", { defaultValue: "After" })}</h3>
                <div className="relative overflow-hidden w-full">
                  <div className="flex animate-scroll-right space-x-6 group w-max">
                    {[...afterImages, ...afterImages].map((url, idx) => (
                      <button
                        key={idx}
                        className="flex-shrink-0 rounded-xl overflow-hidden border border-border/40 bg-gradient-to-b from-background to-muted/20 w-64 h-80 transition-transform hover:scale-105"
                        onClick={() => setModalImage({ url, label: `${bnaT("after", { defaultValue: "After" })} ${((idx % afterImages.length) + 1)}` })}
                        aria-label={`Voir après ${((idx % afterImages.length) + 1)}`}
                        type="button"
                      >
                        <Image
                          src={url}
                          width={320}
                          height={400}
                          alt={`After cleaning ${((idx % afterImages.length) + 1)}`}
                          className="w-full h-full object-cover"
                          priority // Add priority to all images
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {/* Modal for enlarged image */}
              <Dialog open={!!modalImage} onOpenChange={() => setModalImage(null)}>
                <DialogContent className="max-w-2xl w-full p-2 sm:p-3 md:p-4 flex flex-col items-center max-h-[90vh] overflow-auto">
                  {/* Visually hidden title for accessibility */}
                  <DialogTitle className="sr-only">
                    {modalImage?.label || "Image preview"}
                  </DialogTitle>
                  {/* Visually hidden description for accessibility */}
                  <DialogDescription className="sr-only">
                    {modalImage?.label
                      ? `Zoomed image: ${modalImage.label}`
                      : "Zoomed image preview"}
                  </DialogDescription>
                  {modalImage && (
                    <>
                      <span className="mb-1 sm:mb-2 font-semibold text-lg shrink-0">{modalImage.label}</span>
                      <div className="w-full flex-grow flex justify-center items-center overflow-hidden">
                        <Image
                          src={modalImage.url}
                          width={640}
                          height={800}
                          alt={modalImage.label}
                          className="w-auto h-auto max-w-full max-h-full rounded-lg object-contain"
                          style={{ maxWidth: "100%" }}
                        />
                      </div>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            </>
          )}
          <style jsx>{`
            @keyframes scroll-left {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            @keyframes scroll-right {
              0% { transform: translateX(-50%); }
              100% { transform: translateX(0); }
            }
            .animate-scroll-left {
              animation: scroll-left 60s linear infinite;
            }
            .animate-scroll-left:hover {
              animation-play-state: paused;
            }
            .animate-scroll-right {
              animation: scroll-right 60s linear infinite;
            }
            .animate-scroll-right:hover {
              animation-play-state: paused;
            }
          `}</style>
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
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{pricingT("title", { defaultValue: "Pricing" })}</h2>
              <p className="max-w-[800px] text-muted-foreground md:text-lg">
                {pricingT("description", { defaultValue: "Transparent pricing for every window and every home." })}
              </p>
            </motion.div>
            <div className="mx-auto max-w-5xl">
              <div className="grid gap-8 md:grid-cols-3">
                {/* Small Windows */}
                <Card className="flex flex-col border-primary/40">
                  <CardHeader className="pt-8">
                    <CardTitle className="text-2xl font-bold">{pricingT("smallWindows.title")}</CardTitle>
                    <CardDescription>{pricingT("smallWindows.description")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-base text-muted-foreground">
                      <li>
                        <span className="font-semibold text-foreground">{pricingT("exteriorOnly")}</span>{pricingT("smallWindows.extPrice", { defaultValue: "5$ - 8$ par fenêtre" })}
                      </li>
                      <li>
                        <span className="font-semibold text-foreground">{pricingT("interiorExterior")}</span>{pricingT("smallWindows.extIntPrice", { defaultValue: "8$ - 12$ par fenêtre" })}
                      </li>
                      <li>
                        <span className="font-semibold text-foreground">{pricingT("borders")}</span>{pricingT("included", { defaultValue: "Inclus" })}
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                {/* Large Windows */}
                <Card className="flex flex-col border-primary/40">
                  <CardHeader className="pt-8">
                    <CardTitle className="text-2xl font-bold">{pricingT("largeWindows.title")}</CardTitle>
                    <CardDescription>{pricingT("largeWindows.description")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-base text-muted-foreground">
                      <li>
                        <span className="font-semibold text-foreground">{pricingT("exteriorOnly")}</span>{pricingT("largeWindows.extPrice", { defaultValue: "8$ - 12$ par fenêtre" })}
                      </li>
                      <li>
                        <span className="font-semibold text-foreground">{pricingT("interiorExterior")}</span>{pricingT("largeWindows.extIntPrice", { defaultValue: "16$ - 20$ par fenêtre" })}
                      </li>
                      <li>
                        <span className="font-semibold text-foreground">{pricingT("borders")}</span>{pricingT("included", { defaultValue: "Inclus" })}
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                {/* Add-ons & Extras */}
                <Card className="flex flex-col border-primary/40">
                  <CardHeader className="pt-8">
                    <CardTitle className="text-2xl font-bold">{pricingT("extras.title")}</CardTitle>
                    <CardDescription>{pricingT("extras.description")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-base text-muted-foreground">
                      <li>
                        <span className="font-semibold text-foreground">{pricingT("extras.seal.title")}</span>{pricingT("extras.seal.price", { defaultValue: "1$ - 3$ par fenêtre" })}
                      </li>
                      <li>
                        <span className="font-semibold text-foreground">{pricingT("extras.screens.title")}</span>{pricingT("extras.screens.price", { defaultValue: "3$ - 5$ par moustiquaire" })}
                      </li>
                      <li>
                        <span className="font-semibold text-foreground">{pricingT("extras.extraFloors.title")}</span>{pricingT("extras.extraFloors.price", { defaultValue: "10$ - 20$ par étage supplémentaire" })}
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
              <div className="mt-10 text-center">
                <div className="text-lg font-semibold text-primary">{pricingT("footer.averageCost")}<span className="font-bold">$180 – $350</span>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {pricingT("footer.note", { defaultValue: "Les prix peuvent varier en fonction de la taille et de l'état des fenêtres." })}
                </div>
              </div>
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
              <p className="mx-auto max-w-[700px] text-xs text-muted-foreground mt-2 text-center">
                {finalCtaT.rich("recaptchaNotice", {
                  privacyLink: (chunks) => <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary-foreground">{chunks}</a>,
                  termsLink: (chunks) => <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary-foreground">{chunks}</a>,
                })}
              </p>
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
