"use client"

import { useTheme } from "@/contexts/theme-context"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Palette, Plus, Trash2 } from "lucide-react"

export function ThemeSelector() {
  const { currentTheme, themes, setTheme, removeCustomTheme } = useTheme()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme Selection
        </CardTitle>
        <CardDescription>Choose from available themes or create your own theme</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Current Theme</label>
          <Select value={currentTheme.id} onValueChange={setTheme}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {themes.map((theme) => (
                <SelectItem key={theme.id} value={theme.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: theme.colors.primary }} />
                    {theme.name}
                    {theme.isDefault && <Badge variant="secondary">Default</Badge>}
                    {theme.id.startsWith("custom-") && <Badge variant="outline">Custom</Badge>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Theme Preview</label>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(currentTheme.colors)
              .slice(0, 8)
              .map(([key, color]) => (
                <div key={key} className="space-y-1">
                  <div className="w-full h-8 rounded border" style={{ backgroundColor: color }} />
                  <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</p>
                </div>
              ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1">
            <Plus className="h-4 w-4 mr-2" />
            Create Custom
          </Button>
          {currentTheme.id.startsWith("custom-") && (
            <Button variant="destructive" size="icon" onClick={() => removeCustomTheme(currentTheme.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
