import Image from "next/image"
import { getTranslations } from "next-intl/server"
import { Phone, MessageSquare } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { PHONE, SERVICE_AREA } from "@/lib/business"

// Shared by every page: links back into the home page sections, the about page, and the business details
export async function SiteFooter() {
  const footerT = await getTranslations("footer")
  const navT = await getTranslations("navigation")
  const contactT = await getTranslations("contact")

  const links = [
    { href: "/#contact", label: navT("contact") },
    { href: "/#before-after", label: navT("results") },
    { href: "/#pricing", label: navT("pricing") },
    { href: "/#faq", label: navT("faq") },
    { href: "/about", label: navT("about") },
  ]

  return (
    <footer className="w-full border-t bg-muted/60">
      <div className="container flex flex-col gap-10 px-4 py-12 md:px-6 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 font-display text-lg font-extrabold">
              <span className="flex size-9 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-border">
                <Image src="/favicon.webp" alt="" width={36} height={36} className="size-full object-cover" />
              </span>
              <span>SuperVitre</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{footerT("about")}</p>
          </div>
          <nav className="space-y-3" aria-label={footerT("linksTitle")}>
            <h2 className="text-sm font-bold">{footerT("linksTitle")}</h2>
            <ul className="text-sm">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 items-center text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-3 text-sm">
            <h2 className="font-bold">{contactT("callUs")}</h2>
            <a
              href={`tel:${PHONE.tel}`}
              className="flex min-h-11 items-center gap-2 font-semibold transition-colors hover:text-primary"
            >
              <Phone className="size-4 text-primary" />
              {PHONE.display}
            </a>
            <a
              href={`sms:${PHONE.tel}`}
              className="flex min-h-11 items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
            >
              <MessageSquare className="size-4 text-primary" />
              {contactT("sendSms")}
            </a>
            <p className="text-muted-foreground">{contactT("hours")}</p>
          </div>
          <div className="space-y-3 text-sm">
            <h2 className="font-bold">{contactT("serviceArea")}</h2>
            <p className="text-muted-foreground">{contactT("serviceAreaValue")}</p>
            <ul className="flex flex-wrap gap-1.5">
              {SERVICE_AREA.map((town) => (
                <li key={town} className="rounded-full bg-background px-2.5 py-1 text-xs text-muted-foreground ring-1 ring-border">
                  {town}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-2 border-t border-border/80 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} SuperVitre. {footerT("rights")}</p>
          <p className="flex items-center gap-1">
            <span>{footerT("madeBy")}</span>
            <a
              href="https://kollowo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center font-medium text-foreground hover:text-primary transition-colors"
            >
              Kollowo
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
