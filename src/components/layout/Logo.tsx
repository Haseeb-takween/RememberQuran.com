import { cn } from "@/lib/utils"

interface LogoMarkProps {
  size?: number
  className?: string
}

/** Open pages held inside a memory loop, with a small bookmark accent. */
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
      {/* Memory loop */}
      <circle
        cx="12"
        cy="11.5"
        r="8.5"
        stroke="currentColor"
        strokeWidth="1.35"
        opacity="0.4"
      />
      {/* Left page */}
      <path
        d="M11.8 6.2C9.5 4.9 6.8 5.4 5.4 7.2V16.4C7.2 15.2 9.4 15.3 11.8 17V6.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Right page */}
      <path
        d="M12.2 6.2C14.5 4.9 17.2 5.4 18.6 7.2V16.4C16.8 15.2 14.6 15.3 12.2 17V6.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Spine */}
      <line
        x1="12"
        y1="6.2"
        x2="12"
        y2="17.4"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
      />
      {/* Bookmark and the tail of the Q */}
      <path
        d="M14.7 15.7V20.7L16.4 19.5L18.1 21.2V17.1"
        stroke="var(--brand-gold)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

interface LogoWordmarkProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

/** Full logo — one calm wordmark rather than a visually split brand name. */
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
      <span className={cn("font-serif font-medium tracking-[-0.02em]", text)}>
        Remember Quran
      </span>
    </span>
  )
}
