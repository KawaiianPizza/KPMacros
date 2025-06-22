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
        <div className={cn("mx-auto w-[20dvw] rounded-lg border border-border/35", className)}>
            <div className="relative z-10 flex h-full cursor-pointer select-none items-center justify-between overflow-clip rounded-lg bg-background p-1 before:absolute before:inset-0 before:-z-10 before:bg-primary/65 first:*:rounded-r-none last:*:rounded-l-none" onClick={() => disabled || onValueChange(value === options[0] ? options[1] : options[0])}>
                <Button className={cn("relative z-20 flex flex-1 items-center justify-center overflow-clip text-xl font-medium transition-colors duration-200 hover:text-primary-foreground",
                    value === options[0] ? "" : "bg-primary hover:border-accent hover:text-accent")}>
                    <span className="z-10 text-primary">{options[0]}</span>
                    <div className={cn("absolute bottom-0 top-0 w-full bg-accent shadow-sm transition-all duration-200 ease-in-out",
                        value === options[0] ? "left-0" : "left-full",
                        disabled === options[0] && "hidden")} />
                </Button>
                <Button className={cn("relative z-20 flex flex-1 items-center justify-center overflow-clip text-xl font-medium transition-colors duration-200 hover:text-primary-foreground",
                    value === options[1] ? "" : "bg-primary text-primary-foreground/65 hover:border-accent hover:text-accent",
                    disabled === options[1] && "hidden")}>
                    <span className="z-10">{options[1]}</span>
                    <div className={cn("absolute bottom-0 top-0 w-full bg-accent shadow-sm transition-all duration-200 ease-in-out",
                        value === options[1] ? "left-0" : "-left-full")} />
                </Button>
            </div>
        </div>
    )
}
