import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "h-5 gap-1 rounded-full border border-transparent px-2 py-0.5 text-[0.625rem] font-medium transition-[color,background-color,border-color,box-shadow] duration-200 has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 [&>svg]:size-2.5! inline-flex items-center justify-center w-fit whitespace-nowrap shrink-0 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive overflow-hidden group/badge",
  {
    variants: {
      variant: {
        default: "border-primary/30 bg-primary/15 text-primary [a]:hover:bg-primary/20",
        secondary: "border-border/60 bg-surface-2 text-secondary-foreground [a]:hover:bg-surface-1",
        destructive: "border-status-danger/30 bg-status-danger-soft text-status-danger [a]:hover:bg-status-danger-soft/80 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline: "border-border/70 text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground bg-background/40 supports-backdrop-filter:backdrop-blur-xs",
        success: "border-status-success/30 bg-status-success-soft text-status-success",
        warning: "border-status-warning/30 bg-status-warning-soft text-status-warning",
        info: "border-status-info/30 bg-status-info-soft text-status-info",
        ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
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
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
