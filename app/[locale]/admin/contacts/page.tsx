"use client"

import { useState, useEffect } from "react"
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
import { collection, query, getDocs, orderBy } from "firebase/firestore"
import { db } from "@/app/firebase/config"

export default function ContactsPage() {
  const t = useTranslations("admin.contacts")
  const [contacts, setContacts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const q = query(collection(db, "contacts"), orderBy("submittedAt", "desc"))
        const querySnapshot = await getDocs(q)
        const contactsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: `${doc.data().firstName} ${doc.data().lastName}`,
          ...doc.data(),
        }))
        setContacts(contactsData)
      } catch (err) {
        console.error("Error fetching contacts: ", err)
        if (err instanceof Error && (err.message.includes("Missing or insufficient permissions") || err.message.includes("permission-denied"))) {
          setError(t("error.permissionDeniedError"))
        } else {
          setError(t("error.errorFetching"))
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchContacts()
  }, [t])

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      searchQuery === "" ||
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.message.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || contact.status === statusFilter

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
      <Card>
        <CardHeader>
          <CardTitle>{t("allContacts")}</CardTitle>
          <CardDescription>{t("allContactsDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>{t("loading")}</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <>
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
                          <TableCell>{contact.id}</TableCell>
                          <TableCell>{contact.name}</TableCell>
                          <TableCell>{contact.email}</TableCell>
                          <TableCell>{contact.submittedAt}</TableCell>
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
