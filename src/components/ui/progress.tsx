
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-tron-darkBlue border border-tron/30",
      className
    )}
    {...props}
  >
    <div className="absolute inset-0 bg-tron-grid bg-[size:20px_20px] opacity-10"></div>
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-gradient-to-r from-tron-dark via-tron to-tron-light transition-all duration-300 relative overflow-hidden"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    >
      <div className="absolute inset-0 bg-tron-grid bg-[size:10px_10px] opacity-20 animate-circuit-flow"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-tron/60 to-transparent animate-circuit-flow opacity-60"></div>
      <div className="absolute top-0 bottom-0 left-0 right-0 shadow-[0_0_10px_rgba(12,250,96,0.7),0_0_20px_rgba(12,250,96,0.4)]"></div>
    </ProgressPrimitive.Indicator>
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
