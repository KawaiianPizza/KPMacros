"use client"

import * as React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Palette, Eye, EyeOff, Save, X, RefreshCcw, ChevronDown, ChevronRight } from 'lucide-react'
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
import { cn } from "@/lib/utils"
import { useTheme } from "@/contexts/theme-context"
import { hexToHsl } from "@/lib/theme-config"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Badge } from "../ui/badge"
import { MacroAction, MacroData, Modifiers } from "@/lib/types"
import MacroList from "../profiles/macro-list"
import ActionDisplay from "../macro-editor/action-display"
import { Draggable, Droppable } from "@hello-pangea/dnd"
import TypeRowSelect from "./type-row-select"
import TypeSwitch from "./type-switch"
import { useWebSocketUI } from "@/hooks/use-websocketUI"
import { toast, useToast } from "@/hooks/use-toast"

const MACROS: MacroData[] = [
  {
    id: "0",
    name: "Macro Name",
    activator: "Ctrl+F",
    enabled: true,
    loopMode: "Held",
    type: "Hotkey",
    cooldown: 0, start: [], loop: [], finish: [], interrupt: true, mod: false, modifierMode: "Inclusive", modifiers: Modifiers.Control, repeatDelay: 0,
  },
  {
    id: "1",
    name: "Macro Name 2",
    activator: "/command",
    enabled: false,
    loopMode: "Toggle",
    type: "Command",
    cooldown: 0, start: [], loop: [], finish: [], interrupt: false, mod: false, modifierMode: "Exclusive", modifiers: Modifiers.None, repeatDelay: 0,
  }
]
const ACTIONS: MacroAction[] = [
  { id: "0", type: "keyboard", key: "A", state: "press" },
  { id: "1", type: "mouse", button: "left", state: "click" },
  { id: "2", type: "mouse", x: 100, y: -50, relative: true },
  { id: "3", type: "mouse", scroll: "down", amount: 1 },
  { id: "4", type: "delay", duration: 50 },
  { id: "5", type: "text", text: "This is sample text" },
]

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
  { key: "foreground", label: "Background Text" },
  { key: "input", label: "Input" },
  { key: "inputText", label: "Input Text" },
  { key: "info", label: "Info" },
  { key: "infoText", label: "Info Text" },
  { key: "active", label: "Active" },
  { key: "activeText", label: "Active Text" },
  { key: "card", label: "Card" },
  { key: "border", label: "Border" },
]

function toKebab(input: string) {
  return input.replace(/([A-Z])/g, "-$1").toLowerCase()
}

function isHex(hex: string) {
  return /^#([0-9A-Fa-f]{6})$/.test(hex)
}

interface ThemeCreatorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ThemeCreatorDialog({ open, onOpenChange }: ThemeCreatorDialogProps) {
  const { currentTheme, setTheme } = useTheme()
  const { once } = useWebSocketUI()
  const { toast } = useToast()
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
  const [dPadValue, setDPadValue] = useState("⬤" as "🢄" | "🢁" | "🢅" | "🢀" | "⬤" | "🢂" | "🢇" | "🢃" | "🢆")
  const [selectedAction, setSelectedAction] = useState("0")
  const [livePreview, setLivePreview] = useState<boolean>(false)
  const rootPrevVars = useRef<Map<string, string>>(new Map())
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  const hslVars = useMemo(() => {
    const vars: Record<string, string> = {}
    for (const key of Object.keys(colors) as ColorKey[]) {
      vars[`--color-${toKebab(key)}`] = `hsl(${hexToHsl(colors[key])})`
    }
    return vars
  }, [colors])


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

    return () => {
      // cleanup only when effect re-runs with livePreview still true
      // restoration happens in dedicated cleanup below (on toggle off/unmount)
    }
  }, [hslVars, livePreview])

  useEffect(() => {
    if (!open || !livePreview) return
    return () => {
      restoreRootVars()
    }
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
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }
    debounceTimeoutRef.current = setTimeout(() => {
      if (!value.startsWith("#")) value = "#" + value
      if (/^#[a-fA-f0-9]{6}$/.test(value))
        setColors((prev) => ({ ...prev, [key]: value }))
    }, 1)
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
    const saveThemeHandler = ({ message, success, error }: { message: string, success?: string, error?: string }) => {
      if (error) {
        toast({
          title: "Error saving theme",
          description: message,
          variant: "destructive",
        })
        return
      }
      setTheme(newTheme.name)
      handleClose(false)
    }
    once("saveTheme", newTheme, saveThemeHandler)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl w-[95vw] p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between gap-3">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-active" aria-hidden="true" />
                Create New Theme
              </DialogTitle>
              <DialogDescription className="mt-1">
                Choose main colors for the UI elements.
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

        <div className="relative grid max-h-[70vh] grid-cols-1 grid-rows-[1fr_auto_1fr] gap-3 p-3 lg:max-h-[75vh] lg:grid-cols-2 lg:grid-rows-1">
          {/* Left: Form */}
          <ScrollArea className="h-full rounded-md">
            <div className="space-y-3">
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
                  Give your theme a unique name.
                </p>
              </div>

              <Separator />

              {/* Colors */}
              <div className="space-y-3 pb-1">
                <div>
                  <h3 className="text-sm font-medium">Colors</h3>
                  <p className="text-xs text-foreground/65">
                    Adjust core colors used across the UI.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-1">
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
          <ScrollArea className="h-full rounded-md border border-border bg-background p-3"
            style={{
              ...(hslVars as React.CSSProperties),
            }}>
            <div className="space-y-3 pb-0.5">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Theme Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Button className="bg-active text-active-text hover:blend-[0%]">
                      Primary Action
                    </Button>
                    <Button>
                      Secondary
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <MacroList
                macros={MACROS}
                isLoading={false}
                selectedProfile={""}
                onToggleEnabled={() => { }}
                onUpdateLoopMode={() => { }}
                onEditMacro={() => { }}
                onRenameMacro={() => { }}
                onDeleteMacro={() => { }}
                onCreateNewMacro={() => { }}
              />

              <TypeRowSelect columns={3} rows={3} options={["🢄", "🢁", "🢅", "🢀", "⬤", "🢂", "🢇", "🢃", "🢆"]} onValueChange={(value) => setDPadValue(value as typeof dPadValue)} value={dPadValue} />
              <TypeSwitch options={["Option 1", "Option 2"]} value="Option 1" onValueChange={() => { }}></TypeSwitch>

              <div className="space-y-4 h-full flex flex-col w-full overflow-hidden">
                <div className="mb-3">
                  <h4 className="text-sm font-medium mb-1">Test List</h4>
                  <p className="text-xs text-foreground/65">Test List description</p>
                </div>

                <div className="flex-1 min-h-0 h-full w-full relative border border-border p-1 rounded-lg bg-card blend-33 overflow-clip">
                  <ScrollArea className={cn("h-96 w-full")} scrollHideDelay={1000 * 60 * 60 * 24}>
                    <div
                      className={`space-y-1 min-h-48 transition-colors w-full`}
                    >
                      {ACTIONS.map((action, index) =>
                        <div key={index}>
                          <ActionDisplay
                            action={action}
                            index={index}
                            listType={"finish"}
                            isSelected={action.id === selectedAction}
                            onSelect={() => setSelectedAction(action.id === selectedAction ? "" : action.id)}
                            onUpdate={() => { }}
                            onMoveUp={() => { }}
                            onMoveDown={() => { }}
                            onDuplicate={() => { }}
                            onDelete={() => { }}
                            dragHandleProps={null}
                            provided={null}
                            className={cn("animate-update-border!")}
                          />
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>

            </div>
          </ScrollArea>
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
      </DialogContent >
    </Dialog >
  )
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
