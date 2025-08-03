"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { Card, CardHeader } from "@/components/ui/card"
import NavigationBar from "@/components/navigation-bar"
import { useTranslations } from "next-intl"

export default function AboutPage() {
  const t = useTranslations("about")

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <NavigationBar />
      <main className="flex-1 py-20 md:py-32 bg-muted/30">
        <div className="container px-4 md:px-6 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-12">
            {/* Images side by side with names/roles */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="flex flex-row gap-8 w-full max-w-xs min-w-[220px] flex-shrink-0 justify-end"
            >
              {/* First image */}
              <div className="flex flex-col items-center p-5">
                <Card className="w-40 h-52 shadow-lg">
                  <CardHeader className="p-0">
                    <Image
                      src="/team/team1.webp"
                      alt={t("team.member1.name", { defaultValue: "Team member 1" })}
                      width={160}
                      height={208}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </CardHeader>
                </Card>
                <div className="mt-2 text-center">
                  <div className="font-bold">{t("team.member1.name", { defaultValue: "Team Member 1" })}</div>
                  <div className="text-sm text-muted-foreground">{t("team.member1.role", { defaultValue: "Window Cleaning Specialist" })}</div>
                </div>
              </div>
              {/* Second image */}
              <div className="flex flex-col items-center p-5">
                <Card className="w-40 h-52 shadow-lg">
                  <CardHeader className="p-0">
                    <Image
                      src="/team/team2.webp"
                      alt={t("team.member3.name", { defaultValue: "Team member 3" })}
                      width={144}
                      height={192}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </CardHeader>
                </Card>
                <div className="mt-2 text-center">
                  <div className="font-bold">{t("team.member3.name", { defaultValue: "Team Member 3" })}</div>
                  <div className="text-sm text-muted-foreground">{t("team.member3.role", { defaultValue: "Window Cleaning Specialist" })}</div>
                </div>
              </div>
            </motion.div>
            {/* Text content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="flex-1 flex flex-col justify-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                {t("title")}
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                {t("description")}
              </p>
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2">{t("ourValuesTitle")}</h2>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}