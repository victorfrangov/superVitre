"use client"

import { useEffect, useState } from "react"
import { ArrowUp } from "lucide-react"

// Floating button that appears once the page is scrolled past the first screen
export function ScrollToTop({ label }: { label: string }) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 600)
    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0 })}
      className={`fixed bottom-6 right-6 z-50 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-200 hover:bg-primary/90 ${
        isScrolled ? "scale-100 opacity-100" : "pointer-events-none scale-75 opacity-0"
      }`}
      aria-label={label}
      aria-hidden={!isScrolled}
      tabIndex={isScrolled ? 0 : -1}
    >
      <ArrowUp className="size-5" />
    </button>
  )
}
