import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full min-w-0 h-7 rounded-md border border-border/60 bg-surface-2 px-2 py-0.5 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] supports-backdrop-filter:backdrop-blur-xs transition-[border-color,box-shadow,background-color] duration-200 focus-visible:border-ring focus-visible:ring-ring/30 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 focus-visible:ring-2 aria-invalid:ring-2 md:text-xs/relaxed file:h-6 file:text-xs/relaxed file:font-medium file:text-foreground placeholder:text-muted-foreground outline-none file:inline-flex file:border-0 file:bg-transparent disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
