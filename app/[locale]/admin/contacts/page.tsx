"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Calendar, Download, Filter, MoreHorizontal, Search } from "lucide-react"
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

export default function ContactsPage() {
  const t = useTranslations("admin.contacts")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  // Mock data for contacts
  const contacts = [
    {
      id: "CNT-1234",
      name: "Jennifer Lee",
      email: "jennifer@example.com",
      phone: "(555) 123-4567",
      message:
        "I need a quote for cleaning windows in my new home. It's a two-story house with approximately 20 windows. When would you be available?",
      date: "2025-05-10",
      status: "new",
    },
    {
      id: "CNT-1235",
      name: "David Miller",
      email: "david@example.com",
      phone: "(555) 234-5678",
      message:
        "Do you offer gutter cleaning services as well? I'm interested in both window and gutter cleaning for my home.",
      date: "2025-05-09",
      status: "responded",
    },
    {
      id: "CNT-1236",
      name: "Lisa Garcia",
      email: "lisa@example.com",
      phone: "(555) 345-6789",
      message:
        "I'd like to schedule regular window cleaning for my business. We have a storefront with large display windows that need weekly cleaning.",
      date: "2025-05-09",
      status: "new",
    },
    {
      id: "CNT-1237",
      name: "Michael Johnson",
      email: "michael@example.com",
      phone: "(555) 456-7890",
      message:
        "I'm interested in your premium window cleaning package. Can you provide more details about what's included?",
      date: "2025-05-08",
      status: "responded",
    },
    {
      id: "CNT-1238",
      name: "Sarah Williams",
      email: "sarah@example.com",
      phone: "(555) 567-8901",
      message:
        "I have a three-story home with hard-to-reach windows. Do you have the equipment to safely clean windows at that height?",
      date: "2025-05-08",
      status: "new",
    },
    {
      id: "CNT-1239",
      name: "Robert Brown",
      email: "robert@example.com",
      phone: "(555) 678-9012",
      message: "I'm looking for a window cleaning service for my office building. Can you provide a commercial quote?",
      date: "2025-05-07",
      status: "responded",
    },
    {
      id: "CNT-1240",
      name: "Emily Davis",
      email: "emily@example.com",
      phone: "(555) 789-0123",
      message:
        "Do you use eco-friendly cleaning solutions? I have children and pets and am concerned about harsh chemicals.",
      date: "2025-05-07",
      status: "new",
    },
    {
      id: "CNT-1241",
      name: "James Wilson",
      email: "james@example.com",
      phone: "(555) 890-1234",
      message: "I need window cleaning services for a special event next month. Are you available on short notice?",
      date: "2025-05-06",
      status: "responded",
    },
  ]

  // Filter contacts based on search query and filters
  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      searchQuery === "" ||
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.message.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || contact.status === statusFilter

    // Simple date filter for demo purposes
    let matchesDate = true
    if (dateFilter === "today") {
      matchesDate = contact.date === "2025-05-10"
    } else if (dateFilter === "yesterday") {
      matchesDate = contact.date === "2025-05-09"
    } else if (dateFilter === "thisWeek") {
      matchesDate = ["2025-05-06", "2025-05-07", "2025-05-08", "2025-05-09", "2025-05-10"].includes(contact.date)
    }

    return matchesSearch && matchesStatus && matchesDate
  })

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    let variant: "default" | "secondary" | "outline" = "default"
    const label = t(`status.${status}`)

    if (status === "new") {
      variant = "default"
    } else if (status === "responded") {
      variant = "secondary"
    }

    return <Badge variant={variant}>{label}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <div className="mt-2 sm:mt-0 flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 size-4" />
            {t("export")}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("allContacts")}</CardTitle>
          <CardDescription>{t("allContactsDescription")}</CardDescription>
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
                  <SelectItem value="new">{t("status.new")}</SelectItem>
                  <SelectItem value="responded">{t("status.responded")}</SelectItem>
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
                  <SelectItem value="yesterday">{t("yesterday")}</SelectItem>
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
                  <TableHead>{t("table.name")}</TableHead>
                  <TableHead>{t("table.email")}</TableHead>
                  <TableHead>{t("table.date")}</TableHead>
                  <TableHead>{t("table.status")}</TableHead>
                  <TableHead className="text-right">{t("table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {t("noContactsFound")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContacts.map((contact) => (
                    <TableRow key={contact.id}>
                      <TableCell className="font-medium">{contact.id}</TableCell>
                      <TableCell>{contact.name}</TableCell>
                      <TableCell>{contact.email}</TableCell>
                      <TableCell>{contact.date}</TableCell>
                      <TableCell>
                        <StatusBadge status={contact.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/contacts/${contact.id}`}>
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
