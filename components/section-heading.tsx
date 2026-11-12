import type React from "react"

// Eyebrow + H2 + intro used at the top of every section
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  invert = false,
  className = "",
}: {
  eyebrow?: string
  title: React.ReactNode
  description?: string
  align?: "center" | "left"
  invert?: boolean
  className?: string
}) {
  const centered = align === "center"
  return (
    <div className={`reveal flex flex-col gap-4 ${centered ? "mx-auto items-center text-center" : "items-start"} max-w-3xl ${className}`}>
      {eyebrow && (
        <span
          className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] ${
            invert ? "text-sky" : "text-primary"
          }`}
        >
          <span aria-hidden className={`h-px w-6 ${invert ? "bg-sky" : "bg-primary"}`} />
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">{title}</h2>
      {description && (
        <p className={`text-base md:text-lg ${invert ? "text-navy-foreground/80" : "text-muted-foreground"}`}>{description}</p>
      )}
    </div>
  )
}
