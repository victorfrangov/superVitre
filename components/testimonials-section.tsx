"use client"

import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { Star, Quote } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

// This component can be imported and used in your landing page

export function TestimonialsSection() {
  const t = useTranslations("testimonials")

  // These would come from your API in a real application
  // Only showing approved testimonials with allowPublic=true
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      rating: 4,
      message:
        "Great job overall. The windows look amazing and the team was very polite. Only reason for 4 stars is they were about 30 minutes late.",
      type: "residential",
    },
    {
      id: 2,
      name: "Acme Corporation",
      rating: 5,
      message:
        "We've been using CrystalClear for our office building for over a year now. Consistently excellent results and reliable service.",
      type: "commercial",
    },
    {
      id: 3,
      name: "Robert Wilson",
      rating: 5,
      message:
        "I've tried several window cleaning services in the area, and CrystalClear is by far the best. Attention to detail is impressive.",
      type: "residential",
    },
  ]

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

  return (
    <section id="testimonials" className="w-full py-20 md:py-32">
      <div className="container px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
        >
          <Badge className="rounded-full px-4 py-1.5 text-sm font-medium" variant="secondary">
            {t("badge")}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t("title")}</h2>
          <p className="max-w-[800px] text-muted-foreground md:text-lg">{t("description")}</p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {testimonials.map((testimonial) => (
            <motion.div key={testimonial.id} variants={item}>
              <Card className="h-full overflow-hidden border-border/40 bg-gradient-to-b from-background to-muted/10 backdrop-blur transition-all hover:shadow-md">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="mb-4 flex justify-between items-start">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-4 ${
                            i < testimonial.rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <Quote className="size-6 text-primary/40" />
                  </div>
                  <p className="text-muted-foreground flex-1 mb-4">{testimonial.message}</p>
                  <div className="mt-auto">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.type === "residential" ? t("residential") : t("commercial")} {t("customer")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            {t("leaveReview")}{" "}
            <a href="/feedback" className="text-primary hover:underline">
              {t("shareFeedback")}
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
