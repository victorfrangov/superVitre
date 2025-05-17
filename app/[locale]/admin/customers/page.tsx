"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { collection, getDocs, query } from "firebase/firestore"
import { db } from "@/app/firebase/config"
import { MoreHorizontal, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function CustomersPage() {
  const t = useTranslations("admin.customers")
  const [customers, setCustomers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null)
  const [isCustomerDetailDialogOpen, setIsCustomerDetailDialogOpen] = useState(false)

  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const q = query(collection(db, "customers"))
        const querySnapshot = await getDocs(q)

        const customersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setCustomers(customersData)
      } catch (err) {
        console.error("Error fetching customers: ", err)
        setError(t("error.errorFetching"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomers()
  }, [t])

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      searchQuery === "" ||
      (customer.name && customer.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (customer.phone && customer.phone.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (customer.address && customer.address.toLowerCase().includes(searchQuery.toLowerCase()))


    return matchesSearch
  })

  const handleOpenCustomerDialog = (customer: any) => {
    setSelectedCustomer(customer)
    setIsCustomerDetailDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="ml-2">{t("loading")}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-destructive">
        <p>{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          {t("error.retry")}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("allCustomers")}</CardTitle>
          <CardDescription>{t("allCustomersDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
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
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.email")}</TableHead>
                  <TableHead>{t("table.name")}</TableHead>
                  <TableHead>{t("table.phone")}</TableHead>
                  <TableHead>{t("table.lastService")}</TableHead>
                  <TableHead>{t("table.totalSpent")}</TableHead>
                  <TableHead className="text-right">{t("table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {t("noCustomersFound")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>{customer.email || "-"}</TableCell>
                      <TableCell>{customer.name || "-"}</TableCell>
                      <TableCell>{customer.phone || "-"}</TableCell>
                      <TableCell>{customer.lastService || "-"}</TableCell>
                      <TableCell>{`$${customer.totalSpent?.toFixed(2) || "0.00"}`}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenCustomerDialog(customer)}>
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">{t("viewDetails")}</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {selectedCustomer && (
        <Dialog open={isCustomerDetailDialogOpen} onOpenChange={setIsCustomerDetailDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("viewDetails")}</DialogTitle>
              <DialogDescription>
                {t("table.id")}: {selectedCustomer.id}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground">{t("table.name")}</span>
                <span>{selectedCustomer.name || "-"}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground">{t("table.email")}</span>
                <span>{selectedCustomer.email || "-"}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground">{t("table.phone")}</span>
                <span>{selectedCustomer.phone || "-"}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground">{t("table.address")}</span>
                <span>{selectedCustomer.address || "-"}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground">{t("table.joinedDate")}</span>
                <span>{selectedCustomer.createdAt || "-"}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground">{t("table.lastService")}</span>
                <span>{selectedCustomer.lastService || "-"}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground">{t("table.totalSpent")}</span>
                <span>{`$${selectedCustomer.totalSpent?.toFixed(2) || "0.00"}`}</span>
              </div>
              <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground">{t("table.totalAppointments")}</span>
                <span>{selectedCustomer.totalAppointments || 0}</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCustomerDetailDialogOpen(false)}>
                {t("actions.close", {}, { defaultValue: "Close" })}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
