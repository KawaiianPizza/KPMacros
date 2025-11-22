"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type TypeRowSelectProps<T extends readonly string[]> = {
    options: T
    value: T[number]
    onValueChange: (value: T[number]) => void
    columns: number
    rows: number
}

export default function TypeRowSelect<T extends readonly string[]>({ options, value, columns, rows, onValueChange, className, ...props }: TypeRowSelectProps<T> & React.HTMLAttributes<HTMLDivElement>) {
    const selectedIndex = options.indexOf(value)

    const getBackgroundPosition = () => {
        return {
            top: `${(Math.floor(selectedIndex / columns) * 100) / rows}%`,
            left: `${((selectedIndex % columns) * 100) / columns}%`,
            height: `${100 / rows}%`,
            width: `${100 / columns}%`,
        }
    }

    return (
        <div {...props} className={cn("relative overflow-clip rounded-md border border-border grid bg-input", className)}
            style={{
                width: 6 * columns + "rem",
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
            }} >
            <div className="absolute bg-active shadow-sm transition-all duration-300 ease-in-out pointer-events-none z-10" style={getBackgroundPosition()} />

            {options.map((text, index) => (
                <Button key={index} className={cn(
                    "relative z-20 rounded-none border-0 bg-transparent capitalize transition-colors duration-300 ease-in-out",
                    text === value ? "text-active-text hover:text-active-text hover:bg-transparent!" : "",
                    cn(index <= columns * rows - columns - 1 && "border-b-2",
                        index % columns !== columns - 1 && "border-r-2"),
                )}
                    onClick={() => onValueChange(text)} >
                    <span>{text}</span>
                </Button>
            ))}
        </div>
    )
}
