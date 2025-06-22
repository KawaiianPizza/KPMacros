"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Palette } from "lucide-react"
import type { ThemeColors } from "@/lib/types"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import type React from "react"
import { useCallback, useEffect, useRef } from "react"
import { useTheme } from "@/contexts/theme-context"
import { ScrollArea } from "../ui/scroll-area"

export function FloatingCard() {
    const { currentTheme, updateThemeColors } = useTheme()
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current)
            }
        }
    }, [])

    const debouncedUpdateColors = useCallback(
        (colorKey: string, colorValue: string) => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current)
            }

            debounceTimeoutRef.current = setTimeout(() => {
                updateThemeColors({ [colorKey]: colorValue } as Partial<ThemeColors>)
            }, 300)
        },
        [updateThemeColors],
    )

    function handleColorChange(event: React.ChangeEvent<HTMLInputElement>): void {
        const colorKey = event.target.id
        const colorValue = event.target.value
        debouncedUpdateColors(colorKey, colorValue)
    }

    const colorKeys = Object.keys(currentTheme.colors) as (keyof ThemeColors)[]

    return (
        <Card className="fixed bottom-6 right-6 w-96 shadow-lg border-2 z-50 backdrop-blur">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Theme Tools
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                        v1.0
                    </Badge>
                </div>
                <CardDescription>Quick access to theme customization - {currentTheme.name}</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="overflow-y-auto">
                    <div className="max-h-64 gap-3 grid grid-cols-2">
                        {colorKeys.map((colorKey) => (
                            <div key={colorKey} className="space-y-1">
                                <Label htmlFor={colorKey} className="text-sm font-medium capitalize">
                                    {colorKey.replace(/([A-Z])/g, " $1").trim()}
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id={colorKey}
                                        type="color"
                                        value={currentTheme.colors[colorKey]}
                                        onChange={handleColorChange}
                                        className="w-12 h-8 p-1 border rounded cursor-pointer"
                                    />
                                    <Input
                                        type="text"
                                        value={currentTheme.colors[colorKey]}
                                        onChange={(e) => debouncedUpdateColors(colorKey, e.target.value)}
                                        className="flex-1 text-xs font-mono"
                                        placeholder="#000000"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
