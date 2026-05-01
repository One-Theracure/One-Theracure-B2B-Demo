import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Input — Airbnb discipline (Batch 2). Tall (h-12 = 48px), 8px radius,
 * generous 14px horizontal padding, body-md type. Uses `--ring` so
 * focus picks up the One TheraCure Trust-Blue voltage automatically.
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-airbnb-sm border border-border bg-background px-3.5 py-2 text-body-md ring-offset-background file:border-0 file:bg-transparent file:text-body-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
