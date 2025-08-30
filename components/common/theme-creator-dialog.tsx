"use client"

import * as React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Palette, Eye, EyeOff, Save, X, RefreshCcw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { useTheme } from "@/contexts/theme-context"

type ColorKey =
  | "background"
  | "foreground"
  | "input"
  | "inputText"
  | "info"
  | "infoText"
  | "card"
  | "active"
  | "activeText"
  | "destructive"
  | "border"

type ThemeColorsLocal = Record<ColorKey, string>

const COLOR_FIELDS: { key: ColorKey; label: string }[] = [
  { key: "background", label: "Background" },
  { key: "foreground", label: "Foreground" },
  { key: "card", label: "Card" },
  { key: "border", label: "Border" },
  { key: "input", label: "Input" },
  { key: "inputText", label: "Input Text" },
  { key: "info", label: "Info" },
  { key: "infoText", label: "Info Text" },
  { key: "active", label: "Active" },
  { key: "activeText", label: "Active Text" },
  { key: "destructive", label: "Destructive" },
]

// Safe, common stacks (no remote font loading)
const FONT_OPTIONS: { id: string; label: string; stack: string }[] = [
  {
    id: "system",
    label: "System Default",
    stack:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif',
  },
  {
    id: "inter",
    label: "Inter-like",
    stack:
      'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
  },
  {
    id: "roboto",
    label: "Roboto",
    stack:
      'Roboto, system-ui, -apple-system, "Segoe UI", "Helvetica Neue", Arial, "Noto Sans", sans-serif',
  },
  {
    id: "sfmono",
    label: "SF Mono-like",
    stack:
      'ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },
]

// Local helper: convert HEX to "h s% l%" used by Tailwind hsl(var(--token))
function hexToHsl(hex: string): string {
  const clean = hex?.trim()
  if (!clean || !/^#([0-9A-Fa-f]{6})$/.test(clean)) return "0 0% 0%"
  const r = parseInt(clean.slice(1, 3), 16) / 255
  const g = parseInt(clean.slice(3, 5), 16) / 255
  const b = parseInt(clean.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

// Validate simple 6-char hex
function isHex(hex: string) {
  return /^#([0-9A-Fa-f]{6})$/.test(hex)
}

interface ThemeCreatorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ThemeCreatorDialog({ open, onOpenChange }: ThemeCreatorDialogProps) {
  const { currentTheme, setTheme } = useTheme()
  const [name, setName] = useState("Custom Theme")
  const [colors, setColors] = useState<ThemeColorsLocal>(() => ({
    background: currentTheme.colors.background,
    foreground: currentTheme.colors.foreground,
    input: currentTheme.colors.input,
    inputText: currentTheme.colors.inputText,
    info: currentTheme.colors.info,
    infoText: currentTheme.colors.infoText,
    card: currentTheme.colors.card,
    active: currentTheme.colors.active,
    activeText: currentTheme.colors.activeText,
    destructive: currentTheme.colors.destructive,
    border: currentTheme.colors.border,
  }))
  const [fontId, setFontId] = useState<string>("system")
  const [radius, setRadius] = useState<number>(8)
  const [livePreview, setLivePreview] = useState<boolean>(false)
  const rootPrevVars = useRef<Map<string, string>>(new Map())

  // precompute HSL vars for preview container
  const hslVars = useMemo(() => {
    const vars: Record<string, string> = {}
    for (const key of Object.keys(colors) as ColorKey[]) {
      vars[`--${toKebab(key)}`] = hexToHsl(colors[key])
    }
    vars["--radius"] = `${radius}px`
    return vars
  }, [colors, radius])

  const fontStack = useMemo(
    () => FONT_OPTIONS.find((f) => f.id === fontId)?.stack ?? FONT_OPTIONS[0].stack,
    [fontId],
  )

  // Live preview on :root via CSS variables (and restore on disable/close)
  useEffect(() => {
    if (!livePreview) return
    const root = document.documentElement

    // capture old values once
    if (rootPrevVars.current.size === 0) {
      for (const [cssVar, value] of Object.entries(hslVars)) {
        rootPrevVars.current.set(cssVar, getComputedStyle(root).getPropertyValue(cssVar))
      }
      rootPrevVars.current.set("font-family", root.style.fontFamily || "")
    }

    for (const [cssVar, value] of Object.entries(hslVars)) {
      root.style.setProperty(cssVar, value)
    }
    root.style.fontFamily = fontStack

    return () => {
      // cleanup only when effect re-runs with livePreview still true
      // restoration happens in dedicated cleanup below (on toggle off/unmount)
    }
  }, [hslVars, fontStack, livePreview])

  // Restore original :root vars when live preview is turned off or dialog closes
  useEffect(() => {
    if (!open || !livePreview) return
    return () => {
      restoreRootVars()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, livePreview])

  function restoreRootVars() {
    const root = document.documentElement
    rootPrevVars.current.forEach((val, key) => {
      if (key === "font-family") {
        root.style.fontFamily = val
      } else {
        root.style.setProperty(key, val)
      }
    })
    rootPrevVars.current.clear()
  }

  function handleColorChange(key: ColorKey, value: string) {
    if (!value.startsWith("#")) value = "#" + value
    if (/^#[a-fA-f0-9]{6}$/.test(value))
      setColors((prev) => ({ ...prev, [key]: value }))
  }

  function resetToCurrent() {
    setName("Custom Theme")
    setColors({
      background: currentTheme.colors.background,
      foreground: currentTheme.colors.foreground,
      input: currentTheme.colors.input,
      inputText: currentTheme.colors.inputText,
      info: currentTheme.colors.info,
      infoText: currentTheme.colors.infoText,
      card: currentTheme.colors.card,
      active: currentTheme.colors.active,
      activeText: currentTheme.colors.activeText,
      destructive: currentTheme.colors.destructive,
      border: currentTheme.colors.border,
    })
    setFontId("system")
    setRadius(8)
  }

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      if (livePreview) {
        restoreRootVars()
        setLivePreview(false)
      }
    }
    onOpenChange(nextOpen)
  }

  const hasInvalid = useMemo(() => {
    return (
      !name.trim() ||
      (Object.keys(colors) as ColorKey[]).some((k) => !isHex(colors[k]))
    )
  }, [name, colors])

  function handleSave() {
    if (hasInvalid) return
    const newTheme = {
      name: name.trim(),
      colors: { ...colors },
      isDefault: false,
    }
    // add + activate
    //addTheme(newTheme, true)
    setTheme(newTheme.name)
    handleClose(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl w-[95vw] p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between gap-3">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-active" aria-hidden="true" />
                Create Custom Theme
              </DialogTitle>
              <DialogDescription className="mt-1">
                Choose colors, fonts, and layout options. Preview updates in real time.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Switch
                  id="live-preview"
                  checked={livePreview}
                  onCheckedChange={setLivePreview}
                  aria-label="Toggle live preview on entire app"
                />
                <Label htmlFor="live-preview" className="text-sm">
                  {livePreview ? (
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-4 w-4" /> Live preview
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <EyeOff className="h-4 w-4" /> Live preview
                    </span>
                  )}
                </Label>
              </div>
              <Button variant="ghost" size="sm" onClick={resetToCurrent} className="gap-2">
                <RefreshCcw className="h-4 w-4" />
                Reset
                <span className="sr-only">Reset fields to current theme</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-6">
          {/* Left: Form */}
          <ScrollArea className="max-h-[70vh] lg:max-h-[75vh] px-6 py-5">
            <div className="space-y-6">
              {/* Theme Name */}
              <div className="space-y-2">
                <Label htmlFor="theme-name">Theme name</Label>
                <Input
                  id="theme-name"
                  placeholder='e.g., "Midnight Mint"'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={!name.trim()}
                />
                <p className="text-xs text-foreground/65">
                  Give your theme a unique, descriptive name.
                </p>
              </div>

              <Separator />

              {/* Colors */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium">Colors</h3>
                  <p className="text-xs text-foreground/65">
                    Adjust core colors used across the app UI.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {COLOR_FIELDS.map(({ key, label }) => (
                    <ColorField
                      key={key}
                      id={`color-${key}`}
                      label={label}
                      value={colors[key]}
                      onChange={(v) => handleColorChange(key, v)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          <Separator className="lg:hidden" />

          {/* Right: Preview */}
          <div className="bg-background/50 p-4 lg:p-6">
            <div
              className={cn(
                "w-full h-full rounded-lg border",
                "bg-background text-foreground",
              )}
              // Apply CSS variables + font only inside preview container
              style={{
                ...(hslVars as React.CSSProperties),
                fontFamily: fontStack,
              }}
            >
              <Card className="bg-card/100 border-border">
                <CardHeader>
                  <CardTitle className="text-lg">Theme Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <Button className="bg-active text-active-text hover:opacity-90">
                      Primary Action
                    </Button>
                    <Button variant="outline" className="border-border text-foreground">
                      Secondary
                    </Button>
                    <Button variant="destructive" className="bg-destructive text-active-text">
                      Destructive
                    </Button>
                  </div>

                  {/* Form controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Text input</Label>
                      <Input
                        placeholder="Placeholder"
                        className="bg-input text-input-text border-border"
                        value=""
                        onChange={() => { }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Another input</Label>
                      <Input
                        placeholder="Type here"
                        className="bg-input text-input-text border-border"
                        value=""
                        onChange={() => { }}
                      />
                    </div>
                  </div>

                  {/* Info block */}
                  <div className="rounded-md border border-border p-4 bg-info text-info-text">
                    This is an info surface. Make sure text meets contrast requirements.
                  </div>

                  {/* Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-lg border border-border bg-card p-4">
                      <div className="text-sm font-medium mb-2">Card Title</div>
                      <p className="text-sm text-foreground/80">
                        Card body copy showing typical paragraph text color.
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-4">
                      <div className="text-sm font-medium mb-2">Another Card</div>
                      <p className="text-sm text-foreground/80">
                        Links, inputs, and controls inherit these variables.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-foreground/65" aria-live="polite">
              Changes are previewed in the panel. Use Live preview to try them across the app temporarily.
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => handleClose(false)} className="gap-2">
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={hasInvalid} className="gap-2">
                <Save className="h-4 w-4" />
                Save theme
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function toKebab(input: string) {
  return input.replace(/([A-Z])/g, "-$1").toLowerCase()
}

interface ColorFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}

function ColorField({ id, label, value, onChange }: ColorFieldProps) {
  const valid = isHex(value)
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center justify-between">
        <span>{label}</span>
      </Label>
      <div className="flex items-center gap-3">
        <Input
          id={`${id}-picker`}
          type="color"
          value={valid ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} color picker`}
          className="h-10 w-10 rounded-md border border-border bg-transparent p-0 cursor-pointer"
          title={label}
        />
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          aria-invalid={!valid}
          className={cn("flex-1 border border-border", !valid && "animate-update-border")}
        />
      </div>
    </div>
  )
}
