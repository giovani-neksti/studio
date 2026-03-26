import * as React from "react"

import { cn } from "@/lib/utils"

function Card({
  className,
  variant = "filled",
  ...props
}: React.ComponentProps<"div"> & { variant?: "filled" | "outlined" | "elevated" }) {
  return (
    <div
      data-slot="card"
      data-variant={variant}
      className={cn(
        "group/card flex flex-col gap-4 overflow-hidden rounded-[var(--shape-medium)] p-4 text-sm text-[var(--foreground)] transition-all duration-[var(--duration-medium2)] ease-[var(--easing-standard)]",
        variant === "filled" && "bg-[var(--surface-container-highest)]",
        variant === "outlined" && "border border-[var(--outline-variant)] bg-[var(--surface)]",
        variant === "elevated" && "bg-[var(--surface-container-low)] elevation-1",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("md3-title-medium font-semibold text-[var(--foreground)]", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("md3-body-medium text-[var(--on-surface-variant)]", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("self-end", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center border-t border-[var(--outline-variant)]/20 pt-4",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
