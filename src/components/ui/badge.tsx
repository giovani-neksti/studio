import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden border border-transparent px-3 md3-label-small font-medium whitespace-nowrap transition-all duration-[var(--duration-short4)] ease-[var(--easing-standard)] [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default:
          "rounded-[var(--shape-full)] bg-[var(--primary)] text-[var(--on-primary)]",
        secondary:
          "rounded-[var(--shape-full)] bg-[var(--secondary-container)] text-[var(--on-secondary-container)]",
        destructive:
          "rounded-[var(--shape-full)] bg-[var(--error-container)] text-[var(--on-error-container)]",
        outline:
          "rounded-[var(--shape-full)] border-[var(--outline-variant)] text-[var(--foreground)]",
        ghost:
          "rounded-[var(--shape-full)] bg-transparent text-[var(--on-surface-variant)] hover:bg-[var(--on-surface-variant)]/8",
        link: "text-[var(--primary)] underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
