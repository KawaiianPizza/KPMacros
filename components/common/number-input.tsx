"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"

interface NumberInputProps extends Omit<React.ComponentProps<"input">, "type" | "onChange"> {
  onChange?: (value: number) => void
  value?: number
  min?: number
  max?: number
  step?: number
  type?: React.HTMLInputTypeAttribute
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, type, onChange, value, min, max, step = 1, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState<number | undefined>(value)

    // Keep internal state in sync with external value
    React.useEffect(() => {
      setInternalValue(value)
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value === "" ? undefined : Number(e.target.value)
      setInternalValue(newValue)
      if (newValue !== undefined) {
        onChange?.(newValue)
      }
    }

    const increment = () => {
      const newValue = (internalValue || 0) + step
      if (max !== undefined && newValue > max) return
      setInternalValue(newValue)
      onChange?.(newValue)
    }

    const decrement = () => {
      const newValue = (internalValue || 0) - step
      if (min !== undefined && newValue < min) return
      setInternalValue(newValue)
      onChange?.(newValue)
    }

    return (
      <div className="relative">
        <input
          type={type}
          value={internalValue || ""}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          className={cn(
            "flex h-10 w-full rounded-md border border-border bg-primary px-3 py-2 pr-8 text-primary-foreground ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-primary-foreground/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            // Style number input spinners to match component design
            type === "number" &&
            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            className,
          )}
          ref={ref}
          {...props}
        />
        {type === "number" && (
          <div className="absolute right-0 top-0 h-full flex flex-col border-l border-border">
            <button
              type="button"
              className="flex items-center justify-center h-1/2 w-6 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors"
              onClick={increment}
              tabIndex={-1}
              aria-label="Increment"
            >
              <ChevronUp className="h-3 w-3" />
            </button>
            <button
              type="button"
              className="flex items-center justify-center h-1/2 w-6 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-colors border-t border-border"
              onClick={decrement}
              tabIndex={-1}
              aria-label="Decrement"
            >
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    )
  },
)

NumberInput.displayName = "NumberInput"

export { NumberInput }
