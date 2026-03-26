"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-0 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-full items-center justify-center text-[var(--on-surface-variant)] group-data-horizontal/tabs:h-12 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "bg-[var(--surface-container)] rounded-[var(--shape-full)] p-1 gap-0",
        line: "gap-0 bg-transparent border-b border-[var(--outline-variant)]/30 rounded-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative inline-flex h-full flex-1 items-center justify-center gap-2 px-4 md3-label-large font-medium whitespace-nowrap text-[var(--on-surface-variant)] transition-all duration-[var(--duration-medium2)] ease-[var(--easing-standard)] disabled:pointer-events-none disabled:opacity-[0.38] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        // Default (pill) variant
        "group-data-[variant=default]/tabs-list:rounded-[var(--shape-full)] group-data-[variant=default]/tabs-list:data-active:bg-[var(--secondary-container)] group-data-[variant=default]/tabs-list:data-active:text-[var(--on-secondary-container)] group-data-[variant=default]/tabs-list:data-active:elevation-1 group-data-[variant=default]/tabs-list:hover:bg-[var(--on-surface-variant)]/8",
        // Line variant — M3 Primary Tab
        "group-data-[variant=line]/tabs-list:data-active:text-[var(--primary)] group-data-[variant=line]/tabs-list:hover:bg-[var(--on-surface-variant)]/8",
        "after:absolute after:bg-[var(--primary)] after:opacity-0 after:transition-all after:duration-[var(--duration-medium2)] after:ease-[var(--easing-standard)] group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-0 group-data-horizontal/tabs:after:h-[3px] group-data-horizontal/tabs:after:rounded-t-[var(--shape-full)] group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 md3-body-medium outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
