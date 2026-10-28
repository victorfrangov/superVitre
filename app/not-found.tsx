import "@/styles/globals.css"

// Unknown paths (including /fr/... and /en/... pages that don't exist). The root layout renders no <html>, so this page does.
export default function NotFound() {
  return (
    <html lang="fr">
      <body className="bg-background text-foreground antialiased">
        <title>Page introuvable | SuperVitre</title>
        <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 px-6">
          <p className="text-sm text-muted-foreground">404</p>
          <h1 className="text-4xl font-bold tracking-tight">Page introuvable / Page not found</h1>
          <p className="text-lg text-muted-foreground">
            Cette page n&apos;existe pas. / This page doesn&apos;t exist.
          </p>
          <div className="flex gap-6 text-sm font-medium">
            <a href="/fr" hrefLang="fr" className="underline underline-offset-4">
              Accueil (français)
            </a>
            <a href="/en" hrefLang="en" className="underline underline-offset-4">
              Home (English)
            </a>
          </div>
        </main>
      </body>
    </html>
  )
}
