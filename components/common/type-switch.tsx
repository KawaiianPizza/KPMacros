"use client"

import { cn } from "@/lib/utils"
import { Button } from "../ui/button";

type TypeSwitchProps<T extends readonly [string, string]> = {
  options: T;
  disabled?: T[number];
  value: T[number];
  onValueChange: (value: T[number]) => void;
  className?: string;
}

export default function TypeSwitch<T extends readonly [string, string]>({ options, disabled, value, onValueChange, className }: TypeSwitchProps<T>) {
  return (
    <div className={cn("mx-auto w-[20dvw] rounded-lg border border-border/35 overflow-clip", className)}>
      <div className="relative z-10 flex h-full cursor-pointer select-none items-center justify-between bg-input blend-33 p-1 *:first:rounded-r-none *:last:rounded-l-none" onClick={() => disabled || onValueChange(value === options[0] ? options[1] : options[0])}>
        <Button className={cn("relative z-20 flex flex-1 items-center justify-center text-xl font-medium transition-colors duration-200 hover:text-input-text overflow-clip",
          value === options[0] ? "border-active text-active-text hover:text-active-text" : "bg-input hover:border-active hover:text-active")}>
          <span className={cn("z-10", value === options[0] && "text-active-text")}>{options[0]}</span>
          <div className={cn("absolute bottom-0 top-0 w-full bg-active shadow-sm transition-all duration-200 ease-in-out",
            value === options[0] ? "left-0" : "left-full",
            disabled === options[0] && "hidden")} />
        </Button>
        <Button className={cn("relative z-20 flex flex-1 items-center justify-center text-xl font-medium transition-colors duration-200 hover:text-input-text overflow-clip",
          value === options[1] ? "border-active text-active-text hover:text-active-text" : "bg-input hover:border-active hover:text-active",
          disabled === options[1] && "hidden")}>
          <span className={cn("z-10", value === options[1] && "text-active-text")}>{options[1]}</span>
          <div className={cn("absolute bottom-0 top-0 w-full bg-active shadow-sm transition-all duration-200 ease-in-out",
            value === options[1] ? "left-0" : "-left-full")} />
        </Button>
      </div>
    </div>
  )
}
