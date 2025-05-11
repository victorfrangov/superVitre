"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Calendar, Download, Filter, MoreHorizontal, Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"

export default function AppointmentsPage() {
  const t = useTranslations("admin.appointments")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  // Mock data for appointments
  const appointments = [
    {
      id: "APT-1234",
      customer: "John Smith",
      service: "Standard Window Cleaning",
      date: "2025-05-12",
      time: "10:00 AM",
      status: "confirmed",
      address: "123 Main St, Window City",
      phone: "(555) 123-4567",
      email: "john@example.com",
    },
    {
      id: "APT-1235",
      customer: "Sarah Johnson",
      service: "Premium Window Cleaning",
      date: "2025-05-12",
      time: "2:00 PM",
      status: "confirmed",
      address: "456 Oak Ave, Window City",
      phone: "(555) 234-5678",
      email: "sarah@example.com",
    },
    {
      id: "APT-1236",
      customer: "Michael Brown",
      service: "Basic Window Cleaning",
      date: "2025-05-13",
      time: "9:30 AM",
      status: "pending",
      address: "789 Pine St, Window City",
      phone: "(555) 345-6789",
      email: "michael@example.com",
    },
    {
      id: "APT-1237",
      customer: "Emily Davis",
      service: "Standard Window Cleaning",
      date: "2025-05-13",
      time: "1:00 PM",
      status: "confirmed",
      address: "101 Elm St, Window City",
      phone: "(555) 456-7890",
      email: "emily@example.com",
    },
    {
      id: "APT-1238",
      customer: "Robert Wilson",
      service: "Premium Window Cleaning",
      date: "2025-05-14",
      time: "11:00 AM",
      status: "pending",
      address: "202 Maple Dr, Window City",
      phone: "(555) 567-8901",
      email: "robert@example.com",
    },
    {
      id: "APT-1239",
      customer: "Jennifer Lee",
      service: "Basic Window Cleaning",
      date: "2025-05-14",
      time: "3:30 PM",
      status: "cancelled",
      address: "303 Cedar Ln, Window City",
      phone: "(555) 678-9012",
      email: "jennifer@example.com",
    },
    {
      id: "APT-1240",
      customer: "David Miller",
      service: "Standard Window Cleaning",
      date: "2025-05-15",
      time: "10:30 AM",
      status: "confirmed",
      address: "404 Birch Rd, Window City",
      phone: "(555) 789-0123",
      email: "david@example.com",
    },
    {
      id: "APT-1241",
      customer: "Lisa Garcia",
      service: "Premium Window Cleaning",
      date: "2025-05-15",
      time: "2:30 PM",
      status: "pending",
      address: "505 Walnut Blvd, Window City",
      phone: "(555) 890-1234",
      email: "lisa@example.com",
    },
  ]

  // Filter appointments based on search query and filters
  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      searchQuery === "" ||
      appointment.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.address.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || appointment.status === statusFilter

    // Simple date filter for demo purposes
    let matchesDate = true
    if (dateFilter === "today") {
      matchesDate = appointment.date === "2025-05-12"
    } else if (dateFilter === "tomorrow") {
      matchesDate = appointment.date === "2025-05-13"
    } else if (dateFilter === "thisWeek") {
      matchesDate = ["2025-05-12", "2025-05-13", "2025-05-14", "2025-05-15"].includes(appointment.date)
    }
    return matchesSearch && matchesStatus && matchesDate
  })

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default"
    const label = t(`status.${status}`)

    if (status === "confirmed") {
      variant = "default"
    } else if (status === "pending") {
      variant = "secondary"
    } else if (status === "cancelled") {
      variant = "destructive"
    }

    return <Badge variant={variant}>{label}</Badge>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("allAppointments")}</CardTitle>
          <CardDescription>{t("allAppointmentsDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("searchPlaceholder")}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 size-4" />
                  <SelectValue placeholder={t("filterByStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allStatuses")}</SelectItem>
                  <SelectItem value="confirmed">{t("status.confirmed")}</SelectItem>
                  <SelectItem value="pending">{t("status.pending")}</SelectItem>
                  <SelectItem value="cancelled">{t("status.cancelled")}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[180px]">
                  <Calendar className="mr-2 size-4" />
                  <SelectValue placeholder={t("filterByDate")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allDates")}</SelectItem>
                  <SelectItem value="today">{t("today")}</SelectItem>
                  <SelectItem value="tomorrow">{t("tomorrow")}</SelectItem>
                  <SelectItem value="thisWeek">{t("thisWeek")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.id")}</TableHead>
                  <TableHead>{t("table.customer")}</TableHead>
                  <TableHead>{t("table.service")}</TableHead>
                  <TableHead>{t("table.date")}</TableHead>
                  <TableHead>{t("table.time")}</TableHead>
                  <TableHead>{t("table.status")}</TableHead>
                  <TableHead className="text-right">{t("table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {t("noAppointmentsFound")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">{appointment.id}</TableCell>
                      <TableCell>{appointment.customer}</TableCell>
                      <TableCell>{appointment.service}</TableCell>
                      <TableCell>{appointment.date}</TableCell>
                      <TableCell>{appointment.time}</TableCell>
                      <TableCell>
                        <StatusBadge status={appointment.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/appointments/${appointment.id}`}>
                            <MoreHorizontal className="size-4" />
                            <span className="sr-only">{t("viewDetails")}</span>
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">3</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
