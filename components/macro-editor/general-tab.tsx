"use client"

import type React from "react"
import { useEffect, useRef } from "react"
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

export default function GeneralTab() {
  const { macro, updateMacro, isRecording, setIsRecording, startRecording, toggleModifierMode, isActivatorValid } = useMacroEditor()

  const recordingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleActivatorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    updateMacro({ activator: value })

    if (macro.type === "Hotkey" && value.trim()) {
    }
  }

  const handleInterruptChange = (checked: boolean) => {
    updateMacro({ interrupt: checked })
  }

  const handleRepeatDelayChange = (value: number) => {
    updateMacro({ repeatDelay: value })
  }

  const handleMacroTypeChange = (value: "Hotkey" | "Command") => {
    updateMacro({ type: value })
  }

  useEffect(() => {
    if (!isRecording) return

    const activeModifiers = new Set<string>()

    const keyMap: Record<string, string> = {
      Control: "Ctrl",
      Shift: "Shift",
      Alt: "Alt",
      Meta: "Win",
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()

      if (keyMap[e.key]) {
        activeModifiers.add(keyMap[e.key])

        const modifiersText = Array.from(activeModifiers).join("+")
        updateMacro({ activator: modifiersText ? `${modifiersText}+` : "" })
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
        setIsRecording(false)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (keyMap[e.key]) {
        activeModifiers.delete(keyMap[e.key])

        const modifiersText = Array.from(activeModifiers).join("+")
        updateMacro({ activator: modifiersText ? `${modifiersText}+` : "" })
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    recordingTimeoutRef.current = setTimeout(() => {
      setIsRecording(false)
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
          <div className="space-y-1 flex-1 min-w-[200px]">
            <ToggleGroup
              type="single"
              value={macro.type || "Hotkey"}
              onValueChange={handleMacroTypeChange}
              className="justify-evenly w-[30dvw] mx-auto"
            >
              <ToggleGroupItem value="Hotkey" aria-label="Hotkey Macro" title="Hotkey Macro">
                <span>Hotkey</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="Command" aria-label="Command Macro" title="Command Macro">
                <span>Command</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
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
                        variant={macro.type === "Hotkey" ? "default" : "outline"}
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
                value={macro.activator}
                onChange={handleActivatorChange}
                className={`bg-input text-input-foreground border-border ${macro.type === "Hotkey" ? "rounded-none" : "rounded-l-md"
                  } ${isRecording ? "border-primary animate-pulse" : ""} ${!isActivatorValid ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                readOnly={isRecording}
              />

              {macro.type === "Hotkey" && (
                <Button
                  type="button"
                  onClick={startRecording}
                  disabled={isRecording}
                  className={`rounded-l-none border border-l-0 border-border ${isRecording ? "bg-primary text-primary-foreground" : ""}`}
                >
                  {isRecording ? "Recording..." : "Record"}
                </Button>
              )}
            </div>

            <div className="flex items-center text-xs text-muted-foreground">
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

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="interrupt" checked={macro.interrupt} onCheckedChange={handleInterruptChange} />
              <Label htmlFor="interrupt" className="text-foreground flex items-center gap-2">
                {macro.type === "Hotkey" ? "Interrupt the activator key" : "Remove command after activation"}
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
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
          </div>

          {macro.type === "Hotkey" && (
            <div className="space-y-2 pt-2">
              <Label htmlFor="repeatDelay" className="text-foreground flex items-center gap-2">
                Repeat Delay (ms)
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
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
                  className="rounded-r-none border-r-0"
                >
                  -
                </Button>
                <Input
                  id="repeatDelay"
                  type="number"
                  min={0}
                  value={macro.repeatDelay}
                  onChange={(e) => handleRepeatDelayChange(Number.parseInt(e.target.value) || 0)}
                  className="rounded-none text-center bg-input text-input-foreground border-border"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleRepeatDelayChange(macro.repeatDelay + 5)}
                  className="rounded-l-none border-l-0"
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
