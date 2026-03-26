"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center whitespace-nowrap font-medium transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-[0.38] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 state-layer",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--primary)] text-[var(--on-primary)] hover:elevation-1 active:scale-[0.98]",
        tonal:
          "bg-[var(--secondary-container)] text-[var(--on-secondary-container)] hover:elevation-1 active:scale-[0.98]",
        outline:
          "border border-[var(--outline)]/40 bg-transparent text-[var(--foreground)] hover:bg-[var(--on-surface-variant)]/8 active:scale-[0.98]",
        ghost:
          "bg-transparent text-[var(--on-surface-variant)] hover:bg-[var(--on-surface-variant)]/8",
        destructive:
          "bg-[var(--error-container)] text-[var(--on-error-container)] hover:elevation-1 active:scale-[0.98]",
        link: "text-[var(--primary)] underline-offset-4 hover:underline",
        elevated:
          "bg-[var(--surface-container-low)] text-[var(--primary)] elevation-1 hover:elevation-2 active:scale-[0.98]",
      },
      size: {
        default: "h-10 gap-2 px-6 rounded-[var(--shape-full)] md3-label-large",
        sm: "h-8 gap-1.5 px-4 rounded-[var(--shape-full)] md3-label-medium",
        lg: "h-12 gap-2.5 px-8 rounded-[var(--shape-full)] md3-label-large",
        icon: "size-10 rounded-[var(--shape-full)]",
        "icon-sm": "size-8 rounded-[var(--shape-full)]",
        "icon-lg": "size-12 rounded-[var(--shape-full)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
