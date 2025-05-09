import createMiddleware from "next-intl/middleware"
import { locales } from "./config/locales"

export default createMiddleware({
  // A list of all locales that are supported
  locales: locales.map((locale) => locale.code),

  // If this locale is matched, pathnames work without a prefix (e.g. `/about`)
  defaultLocale: "en",

  // Whether to add a locale prefix to the URL (e.g. `/en/about`)
  localePrefix: "always",
})

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ["/((?!api|_next|.*\\..*).*)"],
}
