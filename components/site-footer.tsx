import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { PHONE } from "@/lib/business"

// Shared by every page: links back into the home page sections, the about page, and the business details
export async function SiteFooter() {
  const footerT = await getTranslations("footer")
  const navT = await getTranslations("navigation")
  const contactT = await getTranslations("contact")

  const links = [
    { href: "/#contact", label: navT("contact") },
    { href: "/#pricing", label: navT("pricing") },
    { href: "/#faq", label: navT("faq") },
    { href: "/about", label: navT("about") },
  ]

  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur-sm">
      <div className="container flex flex-col gap-8 px-4 py-10 md:px-6 lg:py-16">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold">
              <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground">
                S
              </div>
              <span>SuperVitre</span>
            </div>
            <p className="text-sm text-muted-foreground">{footerT("about")}</p>
          </div>
          <nav className="space-y-2" aria-label={footerT("linksTitle")}>
            <h2 className="text-sm font-bold">{footerT("linksTitle")}</h2>
            <ul className="text-sm">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex min-h-11 items-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-2 text-sm">
            <h2 className="font-bold">{contactT("callUs")}</h2>
            <a
              href={`tel:${PHONE.tel}`}
              className="inline-flex min-h-11 items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              {PHONE.display}
            </a>
            <p className="text-muted-foreground">{contactT("hours")}</p>
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">{contactT("serviceArea")}</span>
              <br />
              {contactT("serviceAreaValue")}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 text-xs text-muted-foreground sm:flex-row">
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
