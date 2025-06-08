"use client"

import { ThemeSelector } from "./theme-selector"
import { ColorPicker } from "./color-picker"
import { Separator } from "@/components/ui/separator"

export function ThemeSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Theme Settings</h2>
        <p className="text-muted-foreground">
          Customize the colors of the UI elements.
        </p>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <ThemeSelector />
        <ColorPicker />
      </div>
    </div>
  )
}
