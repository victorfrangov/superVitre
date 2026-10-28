"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"

type Photo = { src: string; alt: string }

// Two auto-scrolling strips of before/after photos; tapping one opens it larger.
// Each strip is rendered twice for a seamless loop; the copy is hidden from screen readers and search engines.
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

  const strip = (photos: Photo[], animation: string) => (
    <div className="relative overflow-hidden w-full">
      <div className={`flex ${animation} space-x-6 group w-max`}>
        {[...photos, ...photos].map((photo, idx) => {
          const copy = idx >= photos.length
          return (
            <button
              key={idx}
              className="flex-shrink-0 rounded-xl overflow-hidden border border-border/40 bg-gradient-to-b from-background to-muted/20 w-64 h-80 transition-transform hover:scale-105"
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
                className="w-full h-full object-cover"
              />
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <>
      {/* Before Images Auto-Scroll (scroll left) */}
      <div className="mb-10 w-full">
        <h3 className="text-xl font-bold mb-4 text-center">{beforeLabel}</h3>
        {strip(before, "animate-scroll-left")}
      </div>
      {/* After Images Auto-Scroll (scroll right) */}
      <div className="w-full">
        <h3 className="text-xl font-bold mb-4 text-center">{afterLabel}</h3>
        {strip(after, "animate-scroll-right")}
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
      <style jsx>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scroll-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-scroll-left {
          animation: scroll-left 60s linear infinite;
        }
        .animate-scroll-left:hover {
          animation-play-state: paused;
        }
        .animate-scroll-right {
          animation: scroll-right 60s linear infinite;
        }
        .animate-scroll-right:hover {
          animation-play-state: paused;
        }
      `}</style>
    </>
  )
}
