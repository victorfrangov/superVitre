"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { ArrowRight, ArrowUpRight, Calendar, DollarSign, Mail, MoreHorizontal, Phone, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Link } from "@/i18n/navigation"

export default function AdminDashboard() {
  const t = useTranslations("admin.dashboard")
  const [period, setPeriod] = useState("week")

  // Mock data for the dashboard
  const stats = [
    {
      title: t("stats.appointments"),
      value: "24",
      change: "+8%",
      trend: "up",
      icon: Calendar,
      color: "bg-blue-500",
    },
    {
      title: t("stats.revenue"),
      value: "$4,320",
      change: "+12%",
      trend: "up",
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      title: t("stats.customers"),
      value: "156",
      change: "+3%",
      trend: "up",
      icon: Users,
      color: "bg-purple-500",
    },
    {
      title: t("stats.inquiries"),
      value: "18",
      change: "-5%",
      trend: "down",
      icon: Mail,
      color: "bg-amber-500",
    },
  ]

  const recentAppointments = [
    {
      id: "APT-1234",
      customer: "John Smith",
      service: "Standard Window Cleaning",
      date: "2025-05-12",
      time: "10:00 AM",
      status: "confirmed",
      address: "123 Main St, Window City",
    },
    {
      id: "APT-1235",
      customer: "Sarah Johnson",
      service: "Premium Window Cleaning",
      date: "2025-05-12",
      time: "2:00 PM",
      status: "confirmed",
      address: "456 Oak Ave, Window City",
    },
    {
      id: "APT-1236",
      customer: "Michael Brown",
      service: "Basic Window Cleaning",
      date: "2025-05-13",
      time: "9:30 AM",
      status: "pending",
      address: "789 Pine St, Window City",
    },
    {
      id: "APT-1237",
      customer: "Emily Davis",
      service: "Standard Window Cleaning",
      date: "2025-05-13",
      time: "1:00 PM",
      status: "confirmed",
      address: "101 Elm St, Window City",
    },
    {
      id: "APT-1238",
      customer: "Robert Wilson",
      service: "Premium Window Cleaning",
      date: "2025-05-14",
      time: "11:00 AM",
      status: "pending",
      address: "202 Maple Dr, Window City",
    },
  ]

  const recentContacts = [
    {
      id: "CNT-1234",
      name: "Jennifer Lee",
      email: "jennifer@example.com",
      phone: "(555) 123-4567",
      message: "I need a quote for cleaning windows in my new home...",
      date: "2025-05-10",
      status: "new",
    },
    {
      id: "CNT-1235",
      name: "David Miller",
      email: "david@example.com",
      phone: "(555) 234-5678",
      message: "Do you offer gutter cleaning services as well?",
      date: "2025-05-09",
      status: "responded",
    },
    {
      id: "CNT-1236",
      name: "Lisa Garcia",
      email: "lisa@example.com",
      phone: "(555) 345-6789",
      message: "I'd like to schedule regular window cleaning for my business...",
      date: "2025-05-09",
      status: "new",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <div className="mt-2 sm:mt-0 flex items-center gap-2">
          <Button asChild>
            <Link href="/admin/appointments/new">
              {t("newAppointment")}
              <Calendar className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`${stat.color} rounded-full p-2 text-white`}>
                  <stat.icon className="size-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className={`text-xs ${stat.trend === "up" ? "text-green-500" : "text-red-500"} flex items-center`}>
                  {stat.change}
                  <ArrowUpRight className={`ml-1 size-3 ${stat.trend === "down" ? "rotate-180" : ""}`} />
                  <span className="text-muted-foreground ml-1">{t("fromLastPeriod")}</span>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs for Appointments and Contacts */}
      <Tabs defaultValue="appointments" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="appointments">{t("tabs.appointments")}</TabsTrigger>
          <TabsTrigger value="contacts">{t("tabs.contacts")}</TabsTrigger>
        </TabsList>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("recentAppointments")}</CardTitle>
              <CardDescription>{t("recentAppointmentsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentAppointments.map((appointment, i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Calendar className="size-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{appointment.customer}</h3>
                        <p className="text-sm text-muted-foreground">{appointment.service}</p>
                        <div className="mt-1 flex items-center text-xs text-muted-foreground">
                          <span>
                            {appointment.date} • {appointment.time}
                          </span>
                          <span className="mx-2">•</span>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              appointment.status === "confirmed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
                            }`}
                          >
                            {appointment.status === "confirmed" ? t("status.confirmed") : t("status.pending")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/appointments">
                  {t("viewAllAppointments")}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("recentContacts")}</CardTitle>
              <CardDescription>{t("recentContactsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentContacts.map((contact, i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start gap-4">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Mail className="size-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">{contact.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="size-3" />
                          <span>{contact.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="size-3" />
                          <span>{contact.phone}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{contact.message}</p>
                        <div className="mt-1 flex items-center text-xs text-muted-foreground">
                          <span>{contact.date}</span>
                          <span className="mx-2">•</span>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              contact.status === "new"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            }`}
                          >
                            {contact.status === "new" ? t("status.new") : t("status.responded")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/admin/contacts">
                  {t("viewAllContacts")}
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
