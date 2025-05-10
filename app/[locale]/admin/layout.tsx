"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"
import { Link } from "@/i18n/navigation"
import {
  BarChart3,
  Calendar,
  ClipboardList,
  Cog,
  Home,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Users,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Toaster } from "@/components/ui/toaster"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("admin")
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const navigation = [
    { name: t("navigation.dashboard"), href: "/admin", icon: LayoutDashboard },
    { name: t("navigation.appointments"), href: "/admin/appointments", icon: Calendar },
    { name: t("navigation.contacts"), href: "/admin/contacts", icon: Mail },
    { name: t("navigation.customers"), href: "/admin/customers", icon: Users },
    { name: t("navigation.services"), href: "/admin/services", icon: ClipboardList },
    { name: t("navigation.reports"), href: "/admin/reports", icon: BarChart3 },
    { name: t("navigation.settings"), href: "/admin/settings", icon: Cog },
  ]

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 z-50 flex w-64 flex-col bg-background border-r transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <div className="flex items-center gap-2 font-bold">
            <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground">
              S
            </div>
            <span>SuperVitre</span>
          </div>
          {isMobile && (
            <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setSidebarOpen(false)}>
              <X className="size-5" />
            </Button>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="size-5" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>
        <div className="border-t p-4">
          <div className="flex items-center gap-3 rounded-md px-3 py-2">
            <Avatar className="size-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Admin User</span>
              <span className="text-xs text-muted-foreground">admin@crystalclear.com</span>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start mt-2 text-muted-foreground" asChild>
            <Link href="/">
              <LogOut className="mr-2 size-4" />
              {t("logout")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-16 items-center border-b bg-background px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="size-5" />
          </Button>
          <div className="ml-4 lg:ml-0">
            <h1 className="text-lg font-semibold">{t("title")}</h1>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <Home className="mr-2 size-4" />
                {t("viewSite")}
              </Link>
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      <Toaster />
    </div>
  )
}
