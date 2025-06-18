"use client"

import { cn } from "@/lib/utils"

type TypeSwitchProps<T extends readonly [string, string]> = {
    options: T;
    disabled?: T[number];
    value: T[number];
    onValueChange: (value: T[number]) => void;
    className?: string;
}

export default function TypeSwitch<T extends readonly [string, string]>({ options, disabled, value, onValueChange, className }: TypeSwitchProps<T>) {
    return (
        <div className={cn("w-[20dvw] mx-auto border border-border/35 rounded-lg", className)}>
            <div className="relative flex items-center justify-between bg-primary/65 rounded-lg p-1 cursor-pointer h-full select-none" onClick={() => disabled || onValueChange(value === options[0] ? options[1] : options[0])}>
                <div className={cn("flex-1 flex items-center justify-center text-xl rounded-sm font-medium transition-colors duration-200 relative z-20 overflow-clip",
                    value === options[0] ? "text-primary" : "bg-primary text-primary-foreground/65 hover:text-accent")}>
                    <span className="z-10">{options[0]}</span>
                    <div className={cn("absolute top-0 bottom-0 w-full bg-accent rounded-md shadow-sm transition-all duration-200 ease-in-out",
                        value === options[0] ? "left-0" : "left-full",
                        disabled === options[0] && "hidden")} />
                </div>
                <div className={cn("flex-1 flex items-center justify-center text-xl rounded-sm font-medium transition-colors duration-200 relative z-20 overflow-clip",
                    value === options[1] ? "text-primary" : "bg-primary text-primary-foreground/65 hover:text-accent",
                    disabled === options[1] && "hidden")}>
                    <span className="z-10">{options[1]}</span>
                    <div className={cn("absolute top-0 bottom-0 w-full bg-accent rounded-md shadow-sm transition-all duration-200 ease-in-out",
                        value === options[1] ? "left-0" : "-left-full")} />
                </div>
            </div>
        </div>
    )
}
