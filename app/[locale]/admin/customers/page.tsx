"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Download, Filter, MoreHorizontal, Search, UserPlus } from "lucide-react"
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

export default function CustomersPage() {
  const t = useTranslations("admin.customers")
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  // Mock data for customers
  const customers = [
    {
      id: "CUS-1001",
      name: "John Smith",
      email: "john@example.com",
      phone: "(555) 123-4567",
      address: "123 Main St, Window City",
      type: "residential",
      status: "active",
      lastService: "2025-05-01",
      totalSpent: "$749",
    },
    {
      id: "CUS-1002",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "(555) 234-5678",
      address: "456 Oak Ave, Window City",
      type: "residential",
      status: "active",
      lastService: "2025-04-15",
      totalSpent: "$349",
    },
    {
      id: "CUS-1003",
      name: "Acme Corporation",
      email: "info@acmecorp.com",
      phone: "(555) 345-6789",
      address: "789 Business Park, Window City",
      type: "commercial",
      status: "active",
      lastService: "2025-05-05",
      totalSpent: "$2,450",
    },
    {
      id: "CUS-1004",
      name: "Emily Davis",
      email: "emily@example.com",
      phone: "(555) 456-7890",
      address: "101 Elm St, Window City",
      type: "residential",
      status: "inactive",
      lastService: "2024-11-20",
      totalSpent: "$249",
    },
    {
      id: "CUS-1005",
      name: "Tech Innovations Inc",
      email: "contact@techinnovations.com",
      phone: "(555) 567-8901",
      address: "202 Tech Plaza, Window City",
      type: "commercial",
      status: "active",
      lastService: "2025-04-28",
      totalSpent: "$1,850",
    },
    {
      id: "CUS-1006",
      name: "Robert Wilson",
      email: "robert@example.com",
      phone: "(555) 678-9012",
      address: "303 Pine Dr, Window City",
      type: "residential",
      status: "active",
      lastService: "2025-04-10",
      totalSpent: "$549",
    },
    {
      id: "CUS-1007",
      name: "Sunshine Cafe",
      email: "manager@sunshinecafe.com",
      phone: "(555) 789-0123",
      address: "404 Cafe Lane, Window City",
      type: "commercial",
      status: "active",
      lastService: "2025-05-03",
      totalSpent: "$950",
    },
    {
      id: "CUS-1008",
      name: "Jennifer Lee",
      email: "jennifer@example.com",
      phone: "(555) 890-1234",
      address: "505 Maple Ave, Window City",
      type: "residential",
      status: "inactive",
      lastService: "2024-12-05",
      totalSpent: "$149",
    },
  ]

  // Filter customers based on search query and filters
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      searchQuery === "" ||
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.address.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = typeFilter === "all" || customer.type === typeFilter
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  // Type badge component
  const TypeBadge = ({ type }: { type: string }) => {
    const variant: "default" | "secondary" = type === "commercial" ? "default" : "secondary"
    const label = t(`type.${type}`)

    return <Badge variant={variant}>{label}</Badge>
  }

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const variant: "outline" | "destructive" = status === "active" ? "outline" : "destructive"
    const label = t(`status.${status}`)

    return <Badge variant={variant}>{label}</Badge>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("allCustomers")}</CardTitle>
          <CardDescription>{t("allCustomersDescription")}</CardDescription>
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
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 size-4" />
                  <SelectValue placeholder={t("filterByType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allTypes")}</SelectItem>
                  <SelectItem value="residential">{t("type.residential")}</SelectItem>
                  <SelectItem value="commercial">{t("type.commercial")}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 size-4" />
                  <SelectValue placeholder={t("filterByStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allStatuses")}</SelectItem>
                  <SelectItem value="active">{t("status.active")}</SelectItem>
                  <SelectItem value="inactive">{t("status.inactive")}</SelectItem>
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
                  <TableHead>{t("table.type")}</TableHead>
                  <TableHead>{t("table.status")}</TableHead>
                  <TableHead>{t("table.lastService")}</TableHead>
                  <TableHead>{t("table.totalSpent")}</TableHead>
                  <TableHead className="text-right">{t("table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {t("noCustomersFound")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.id}</TableCell>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>
                        <TypeBadge type={customer.type} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={customer.status} />
                      </TableCell>
                      <TableCell>{customer.lastService}</TableCell>
                      <TableCell>{customer.totalSpent}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/customers/${customer.id}`}>
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
