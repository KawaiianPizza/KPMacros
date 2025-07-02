"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"

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
      <div className="relative rounded-md group">
        <Input
          type={type}
          value={internalValue}
          onChange={handleChange}
          min={min}
          max={max}
          step={step}
          className={cn(
            "flex h-10 w-full border border-border px-3 py-2 pr-8 md:text-sm",
            type === "number" &&
            "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
            className,
          )}
          ref={ref}
          {...props}
        />
        {type === "number" && (
          <div className="absolute right-0 top-0 h-full flex flex-col">
            <Button
              className="flex h-1/2 w-3 items-center justify-center rounded-none border-b-0 border-border px-3 group-last:rounded-tr-md"
              onClick={increment}
              tabIndex={-1}
              aria-label="Increment"
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
            <Button
              className="flex h-1/2 w-3 items-center justify-center rounded-none border-t border-border px-3 group-last:rounded-br-md"
              onClick={decrement}
              tabIndex={-1}
              aria-label="Decrement"
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    )
  },
)

NumberInput.displayName = "NumberInput"

export { NumberInput }
