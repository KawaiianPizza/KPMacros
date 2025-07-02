"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useMacroEditor } from "@/contexts/macro-editor-context"
import { Info } from "lucide-react"
import KEYCODES from "@/lib/KEYCODES"
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group"
import TypeSwitch from "../common/type-switch"
import { cn } from "@/lib/utils"
import { NumberInput } from "../common/number-input"

export default function GeneralTab() {
  const { macro, updateMacro, isRecording, setIsRecording, startRecording, toggleModifierMode, isActivatorValid } = useMacroEditor()
  const [activator, setActivator] = useState<string>(macro.activator || "")

  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleActivatorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setActivator(value)

    if (macro.type === "Hotkey" && value.trim()) {
    }
  }

  const handleInterruptChange = (checked: boolean) => {
    updateMacro({ interrupt: checked })
  }
  const handleModChange = (checked: boolean) => {
    updateMacro({ mod: checked })
  }
  const handleRepeatDelayChange = (value: number) => {
    updateMacro({ repeatDelay: value })
  }

  const handleMacroTypeChange = (value: string) => {
    updateMacro({ type: value as "Hotkey" | "Command" })
  }

  useEffect(() => {
    if (!isRecording) return

    const activeModifiers = new Set<string>()

    const keyMap: Record<string, string> = {
      15: "Mod",
      Control: "Ctrl",
      Shift: "Shift",
      Alt: "Alt",
      Meta: "Win",
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()
      const mod = keyMap[e.key === "Unidentified" ? e.keyCode : e.key]
      if (mod) {
        activeModifiers.add(mod)

        const modifiersText = Array.from(activeModifiers).join("+")
        setActivator(modifiersText ? `${modifiersText}+` : "")
      } else {
        let keyName = KEYCODES.find(k => k.keyCode === e.keyCode)?.value || e.key

        if (keyName === " ") keyName = "Space"
        else if (keyName.length === 1 && /[a-zA-Z0-9]/.test(keyName)) {
          keyName = keyName.toUpperCase()
        } else if (/^[A-Za-z0-9]+$/.test(keyName)) {
          keyName = keyName.charAt(0).toUpperCase() + keyName.slice(1).toLowerCase()
        } else {
          return
        }

        const modifiersArray = Array.from(activeModifiers)
        const fullHotkey = modifiersArray.length > 0 ? `${modifiersArray.join("+")}+${keyName}` : keyName

        updateMacro({ activator: fullHotkey })
        setActivator(fullHotkey)
        setIsRecording(false)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      const mod = keyMap[e.key === "Unidentified" ? e.keyCode : e.key]
      if (mod) {
        activeModifiers.delete(mod)

        const modifiersText = Array.from(activeModifiers).join("+")
        setActivator(modifiersText ? `${modifiersText}+` : "")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    recordingTimeoutRef.current = setTimeout(() => {
      setIsRecording(false)
      setActivator(macro.activator)
    }, 5000)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
      if (recordingTimeoutRef.current) {
        clearTimeout(recordingTimeoutRef.current)
      }
    }
  }, [isRecording, setIsRecording, updateMacro])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Macro Type</CardTitle>
          <CardDescription>Choose how this macro will be triggered</CardDescription>
        </CardHeader>
        <CardContent>
          <TypeSwitch options={["Hotkey", "Command"]} value={macro.type || "Hotkey"} onValueChange={handleMacroTypeChange} disabled={macro.mod ? "Command" : undefined} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Activator</CardTitle>
          <CardDescription>
            {macro.type === "Hotkey"
              ? "Set the key combination that will trigger this macro"
              : "Set the text that will trigger this macro"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex">
              {macro.type === "Hotkey" && (
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        onClick={toggleModifierMode}
                        className="rounded-r-none border border-r-0 border-border min-w-[70px]"
                      >
                        {macro.modifierMode === "Inclusive" ? "Any" : "None"}+
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        <strong>Any+</strong>: Requires the modifiers to be pressed but allows additional modifiers
                      </p>
                      <p>
                        <strong>None+</strong>: Requires only the specified modifiers to be pressed
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              <Input
                id="activator"
                placeholder={
                  isRecording
                    ? "Press keys..."
                    : macro.type === "Hotkey"
                      ? "e.g. Ctrl+Alt+A, Mod+F1"
                      : "e.g. /mycommand"
                }
                maxLength={macro.type === "Command" ? 32 : 0}
                value={activator}
                onChange={handleActivatorChange}
                onFocusCapture={() => { setActivator(""); startRecording() }}
                className={cn("border-border",
                  macro.type === "Hotkey" ? "rounded-none" : "rounded-l-md",
                  isRecording && "border-active animate-breathing",
                  !isActivatorValid && "border-red-600 focus-visible:ring-red-600")}
                readOnly={isRecording}
              />

              {macro.type === "Hotkey" && (
                <Button
                  type="button"
                  onClick={() => { setActivator(""); startRecording() }}
                  disabled={isRecording}
                  className={`rounded-l-none border border-l-0 border-border ${isRecording ? "bg-input text-input-text" : ""}`}
                >
                  {isRecording ? "Recording..." : "Record"}
                </Button>
              )}
            </div>

            <div className="flex items-center text-xs text-foreground/65">
              {isRecording ? (
                <p>Press any key combination. Recording will stop after a non-modifier key is pressed...</p>
              ) : macro.type === "Hotkey" ? (
                <p>Hotkey format: Modifier(s)+Key (e.g. Ctrl+Shift+A)</p>
              ) : (
                <p>Command format: Any text combination 32 characters or less. (e.g. /macro or !run)</p>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-2 flex justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox id="interrupt" checked={macro.interrupt} onCheckedChange={handleInterruptChange} />
              <Label htmlFor="interrupt" className="flex items-center gap-2">
                {macro.type === "Hotkey" ? "Interrupt the activator key" : "Remove command after activation"}
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-foreground/65" />
                    </TooltipTrigger>
                    <TooltipContent>
                      {macro.type === "Hotkey"
                        ? "When checked, this will interrupt the activator keypress (does not interrupt the modifiers)"
                        : "When checked, backspace will be pressed to match the command length before activation"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
            </div>
            {macro.type === "Hotkey" && <div className="flex items-center space-x-2">
              <Checkbox id="mod" checked={macro.mod} onCheckedChange={handleModChange} />
              <Label htmlFor="mod" className="flex items-center gap-2">
                Is Mod key
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-foreground/65" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Disables this key for macro function and instead acts as Mod. Mod is treated like the Ctrl, Shift, Win, Alt, modifier keys. (Note: Mod is not a real key and cannot be used outside KPMacros)
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
            </div>}
          </div>

          {macro.type === "Hotkey" && !macro.mod && (
            <div className="space-y-2 pt-2">
              <Label htmlFor="repeatDelay" className="text-foreground flex items-center gap-2">
                Repeat Delay (ms)
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-foreground/65" />
                    </TooltipTrigger>
                    <TooltipContent>Time in milliseconds to wait before repeating the Loop action list</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <div className="flex items-center">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleRepeatDelayChange(Math.max(0, macro.repeatDelay - 5))}
                  className="rounded-r-none border-r-0 border-border"
                >
                  -
                </Button>
                <NumberInput
                  id="repeatDelay"
                  type="number"
                  min={0}
                  value={macro.repeatDelay}
                  onChange={(e) => handleRepeatDelayChange(e || 0)}
                  className="rounded-none text-center border-border"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleRepeatDelayChange(macro.repeatDelay + 5)}
                  className="rounded-l-none border-l-0 border-border"
                >
                  +
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
