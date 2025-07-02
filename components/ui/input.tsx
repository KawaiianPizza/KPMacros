import * as React from "react"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, value, ...props }, ref) => {
    const [animateClass, setAnimateClass] = useState("animate-update-a");

    useEffect(() => {
      setAnimateClass(prev => prev === "animate-update-a" ? "animate-update-b" : "animate-update-a");
    }, [value]);

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-border bg-input/100 px-3 py-2 text-input-text ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-input-text/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          animateClass,
          className,
        )}
        value={value}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = "Input"

export { Input }
