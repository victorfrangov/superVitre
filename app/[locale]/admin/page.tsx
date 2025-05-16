"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { collection, query, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/app/firebase/config";

// Components for your admin dashboard
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Calendar, DollarSign, Mail, MoreHorizontal, Phone, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@/i18n/navigation";

export default function AdminDashboardPage() {
  const t = useTranslations("admin.dashboard");
  const [stats, setStats] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]); // Define recentAppointments
  const [recentContacts, setRecentContacts] = useState([]); // Define recentContacts
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);

      try {
        // Fetch recent appointments
        const appointmentsQuery = query(
          collection(db, "reservations"),
          orderBy("submittedAt", "desc"),
          limit(5)
        );
        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        const appointmentsData = appointmentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch recent contacts
        const contactsQuery = query(
          collection(db, "contacts"),
          orderBy("submittedAt", "desc"),
          limit(5)
        );
        const contactsSnapshot = await getDocs(contactsQuery);
        const contactsData = contactsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch customers
        const customersSnapshot = await getDocs(collection(db, "customers"));
        const totalCustomers = customersSnapshot.size; // Total number of customers

        // Calculate stats
        const totalAppointments = appointmentsData.length;
        const totalRevenue = appointmentsData.reduce((sum, appt) => sum + (appt.price || 0), 0);
        const totalInquiries = contactsData.length;

        setStats([
          {
            title: t("stats.appointments"),
            value: totalAppointments,
            trend: "up",
            icon: Calendar,
            color: "bg-blue-500",
          },
          {
            title: t("stats.revenue"),
            value: `$${totalRevenue.toFixed(2)}`,
            trend: "up",
            icon: DollarSign,
            color: "bg-green-500",
          },
          {
            title: t("stats.customers"),
            value: totalCustomers,
            trend: "up",
            icon: Users,
            color: "bg-purple-500",
          },
          {
            title: t("stats.inquiries"),
            value: totalInquiries,
            trend: "down",
            icon: Mail,
            color: "bg-amber-500",
          },
        ]);

        setRecentAppointments(appointmentsData); // Set recent appointments
        setRecentContacts(contactsData); // Set recent contacts
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [t]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center gap-2">
          <span className="text-primary">{t("loading")}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="space-y-6">
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
                          <h3 className="font-medium">{appointment.firstName} {appointment.lastName}</h3>
                          <p className="text-sm text-muted-foreground">{appointment.address}</p>
                          <div className="mt-1 flex items-center text-xs text-muted-foreground">
                            <span>
                              {appointment.selectedDate} • {appointment.selectedTime}
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
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/appointments/${appointment.id}`}>
                          <MoreHorizontal className="size-4" />
                        </Link>
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
                          <h3 className="font-medium">{contact.firstName} {contact.lastName}</h3>
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
                            <span>{contact.submittedAt}</span>
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
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/contacts/${contact.id}`}>
                          <MoreHorizontal className="size-4" />
                        </Link>
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
    </div>
  );
}
