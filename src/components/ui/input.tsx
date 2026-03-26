import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-[var(--shape-extra-small)] border border-[var(--outline)]/40 bg-transparent px-3 py-2 md3-body-medium text-[var(--foreground)] transition-all duration-[var(--duration-short4)] ease-[var(--easing-standard)] outline-none placeholder:text-[var(--on-surface-variant)]/60 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-[0.38] aria-invalid:border-[var(--error)] aria-invalid:ring-2 aria-invalid:ring-[var(--error)]/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
