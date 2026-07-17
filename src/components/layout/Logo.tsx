import { cn } from "@/lib/utils"

interface LogoMarkProps {
  size?: number
  className?: string
}

/** Stylised open Quran mark — works at any size, uses currentColor */
export function LogoMark({ size = 24, className }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Left page */}
      <path
        d="M12 3.5C10.2 3.5 5.2 4.8 3.8 9.2C2.6 13 4 18.2 12 19.8V3.5Z"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      {/* Right page */}
      <path
        d="M12 3.5C13.8 3.5 18.8 4.8 20.2 9.2C21.4 13 20 18.2 12 19.8V3.5Z"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      {/* Spine */}
      <line
        x1="12"
        y1="3.5"
        x2="12"
        y2="19.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      {/* Binding ribbon at top */}
      <path
        d="M9.5 3C10.2 2.5 11 2.3 12 2.3C13 2.3 13.8 2.5 14.5 3"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        fill="none"
      />
      {/* Bottom closure arc */}
      <path
        d="M4.5 19.2C6.5 20.6 9 21.2 12 21.2C15 21.2 17.5 20.6 19.5 19.2"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

interface LogoWordmarkProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

/** Full logo — mark + wordmark. The word "Quran" uses the serif font for brand character. */
export function LogoWordmark({ className, size = "md" }: LogoWordmarkProps) {
  const sizes = {
    sm: { icon: 18, text: "text-sm" },
    md: { icon: 22, text: "text-base" },
    lg: { icon: 32, text: "text-xl" },
  }
  const { icon, text } = sizes[size]

  return (
    <span className={cn("flex items-center gap-2", className)}>
      <LogoMark size={icon} className="text-primary shrink-0" />
      <span className={cn("font-medium tracking-tight", text)}>
        Remember
        <span className="font-serif text-primary">Quran</span>
      </span>
    </span>
  )
}
