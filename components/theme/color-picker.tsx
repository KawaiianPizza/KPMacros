"use client"

import { useState } from "react"
import { useTheme } from "@/contexts/theme-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Palette, RotateCcw } from "lucide-react"
import type { ThemeColors } from "@/lib/theme-config"

export function ColorPicker() {
  const { currentTheme, updateThemeColors } = useTheme()
  const [tempColors, setTempColors] = useState<Partial<ThemeColors>>({})

  const colorCategories = {
    base: {
      title: "Base Colors",
      colors: [
        "background",
        "foreground",
        "card",
        "cardForeground",
        "primary",
        "primaryForeground",
        "secondary",
        "secondaryForeground",
        "accent",
        "border",
        "destructive"
      ],
    },
  }

  const handleColorChange = (colorKey: keyof ThemeColors, value: string) => {
    const newColors = { ...tempColors, [colorKey]: value }
    setTempColors(newColors)
  }

  const applyChanges = () => {
    updateThemeColors(tempColors)
    setTempColors({})
  }

  const resetChanges = () => {
    setTempColors({})
  }

  const getCurrentColor = (colorKey: keyof ThemeColors): string => {
    return tempColors[colorKey] || currentTheme.colors[colorKey]
  }

  const hasChanges = Object.keys(tempColors).length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Color Customization
        </CardTitle>
        <CardDescription>Customize colors for the current theme</CardDescription>
        {currentTheme.id.startsWith("custom-") && <Badge variant="secondary">Custom Theme</Badge>}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="base" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            {Object.entries(colorCategories).map(([key, category]) => (
              <TabsTrigger key={key} value={key} className="text-xs">
                {category.title.split(" ")[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(colorCategories).map(([categoryKey, category]) => (
            <TabsContent key={categoryKey} value={categoryKey} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
                {category.colors.map((colorKey) => {
                  const currentColor = getCurrentColor(colorKey as keyof ThemeColors)
                  const hasChanged = tempColors[colorKey as keyof ThemeColors] !== undefined

                  return (
                    <div key={colorKey} className="space-y-2">
                      <Label htmlFor={colorKey} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded border" style={{ backgroundColor: currentColor }} />
                        {colorKey.replace(/([A-Z])/g, " $1").trim()}
                        {hasChanged && (
                          <Badge variant="outline" className="text-xs">
                            Modified
                          </Badge>
                        )}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id={colorKey}
                          type="color"
                          value={currentColor}
                          onChange={(e) => handleColorChange(colorKey as keyof ThemeColors, e.target.value)}
                          className="w-16 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={currentColor}
                          onChange={(e) => handleColorChange(colorKey as keyof ThemeColors, e.target.value)}
                          className="flex-1 font-mono text-sm"
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {hasChanges && (
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={applyChanges} className="flex-1">
              Apply Changes
            </Button>
            <Button variant="outline" onClick={resetChanges}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
