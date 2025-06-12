"use client"

import { cn } from "@/lib/utils"

type TypeSwitchProps<T extends readonly [string, string]> = {
    options: T;
    value: T[number]; // Ensures `value` is one of the elements in `options`
    onValueChange: (value: T[number]) => void;
    className?: string;
}

export default function TypeSwitch<T extends readonly [string, string]>({ options, value, onValueChange, className }: TypeSwitchProps<T>) {
    return (
        <div className={cn("w-[20dvw] mx-auto", className)}>
            <div className="relative flex items-center justify-between bg-primary/65 rounded-lg p-1 cursor-pointer h-full select-none" onClick={() => onValueChange(value === options[0] ? options[1] : options[0])}>
                <div className={cn("absolute top-1 bottom-1 w-[calc(50%-4px)] bg-accent rounded-md shadow-sm transition-all duration-200 ease-in-out z-10",
                    value === options[0] ? "left-1" : "left-[calc(50%)]")} />
                <div className={cn("flex-1 flex items-center justify-center text-xl rounded-md font-medium transition-colors duration-200 relative z-20",
                    value === options[0] ? "text-primary" : "bg-primary text-primary-foreground/65 hover:text-accent-foreground")}>
                    {options[0]}
                </div>

                <div className={cn("flex-1 flex items-center justify-center text-xl rounded-md font-medium transition-colors duration-200 relative z-20",
                    value === options[1] ? "text-primary" : "bg-primary text-primary-foreground/65 hover:text-accent-foreground")}>
                    {options[1]}
                </div>
            </div>
        </div>
    )
}
