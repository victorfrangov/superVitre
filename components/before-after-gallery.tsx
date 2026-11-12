"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"

type Photo = { src: string; alt: string }

// Two auto-scrolling strips of before/after photos; tapping one opens it larger.
// Each strip is rendered twice for a seamless loop; the copy is hidden from screen readers and search engines.
// The scrolling is CSS (.marquee-* in styles/globals.css) and stops for people who prefer reduced motion.
export function BeforeAfterGallery({
  beforeLabel,
  afterLabel,
  zoomLabel,
  before,
  after,
}: {
  beforeLabel: string
  afterLabel: string
  zoomLabel: string
  before: Photo[]
  after: Photo[]
}) {
  const [modalImage, setModalImage] = useState<Photo | null>(null)

  const strip = (label: string, photos: Photo[], animation: string, tone: "before" | "after") => (
    <div className="w-full">
      <h3 className="container mb-4 flex items-center gap-3 px-4 text-sm font-bold uppercase tracking-[0.14em] md:px-6">
        <span
          className={`rounded-full px-3 py-1 ${
            tone === "after" ? "bg-primary text-primary-foreground" : "bg-foreground/10 text-foreground"
          }`}
        >
          {label}
        </span>
        <span aria-hidden className="h-px flex-1 bg-border" />
      </h3>
      <div className="marquee-track marquee-mask relative w-full overflow-hidden">
        <div className={`flex w-max gap-4 md:gap-5 ${animation}`}>
          {[...photos, ...photos].map((photo, idx) => {
            const copy = idx >= photos.length
            return (
              <button
                key={idx}
                className="group relative h-72 w-56 flex-shrink-0 overflow-hidden rounded-2xl bg-muted ring-1 ring-border transition-shadow hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-80 md:w-64"
                onClick={() => setModalImage(photo)}
                aria-label={copy ? undefined : `${zoomLabel} : ${photo.alt}`}
                aria-hidden={copy || undefined}
                tabIndex={copy ? -1 : undefined}
                type="button"
              >
                {/* Fixed 256px slot: no `sizes`, so the srcset is just 1x/2x */}
                <Image
                  src={photo.src}
                  width={256}
                  height={320}
                  alt={copy ? "" : photo.alt}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className="flex flex-col gap-10">
        {strip(beforeLabel, before, "marquee-left", "before")}
        {strip(afterLabel, after, "marquee-right", "after")}
      </div>
      {/* Modal for enlarged image */}
      <Dialog open={!!modalImage} onOpenChange={() => setModalImage(null)}>
        <DialogContent className="max-w-2xl w-full p-2 sm:p-3 md:p-4 flex flex-col items-center max-h-[90vh] overflow-auto">
          <DialogTitle className="sr-only">{modalImage?.alt ?? zoomLabel}</DialogTitle>
          <DialogDescription className="sr-only">{zoomLabel}</DialogDescription>
          {modalImage && (
            <>
              <span className="mb-1 sm:mb-2 font-semibold text-lg shrink-0">{modalImage.alt}</span>
              <div className="w-full flex-grow flex justify-center items-center overflow-hidden">
                <Image
                  src={modalImage.src}
                  width={640}
                  height={800}
                  sizes="(min-width: 768px) 640px, 90vw"
                  alt={modalImage.alt}
                  className="w-auto h-auto max-w-full max-h-full rounded-lg object-contain"
                  style={{ maxWidth: "100%" }}
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
