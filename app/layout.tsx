import type React from "react"

// <html> and <body> are rendered by app/[locale]/layout.tsx so they can carry lang={locale}.
// Paths outside a locale get app/not-found.tsx, which has its own <html>.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
