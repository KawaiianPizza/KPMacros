"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { KeyIcon as KeyDown, KeyIcon as KeyUp, KeyRound } from "lucide-react"
import type { MacroAction } from "@/contexts/macro-editor-context"
import KEYCODES from "@/lib/KEYCODES"

interface KeyboardActionInputProps {
  action: Omit<MacroAction, "id">
  onChange: (action: Omit<MacroAction, "id">) => void
  onKeyDown?: (e: React.KeyboardEvent) => void
}

export default function KeyboardActionInput({ action, onChange, onKeyDown }: KeyboardActionInputProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    onChange({
      ...action,
      state: action.state || "press",
    })
  }, [])

  const handleKeyboardModeChange = (value: string) => {
    if (!value) return
    const state = value as "down" | "press" | "up"
    onChange({ ...action, state })
  }

  const handleKeycodeSelect = (value: string) => {
    onChange({ ...action, key: value })
    setOpen(false)
  }

  const handleFilterCommand = (value: string, search: string, keywords?: string[] | undefined) => {
    let searchIndex = 0;
    const searchLower = search.toLowerCase();
    const valueLower = value.toLowerCase();

    for (let i = 0; i < valueLower.length; i++) {
      if (valueLower[i] === searchLower[searchIndex]) {
        searchIndex++;
        if (searchIndex === searchLower.length) return 1;
      }
    }

    return search.length === 0 ? 1 : 0;
  }

  return (
    <div className="space-y-2">
      <Label>Key Action</Label>
      <div className="flex space-x-2">
        <ToggleGroup
          type="single"
          value={action.state}
          onValueChange={handleKeyboardModeChange}
          className="flex-shrink-0"
        >
          <ToggleGroupItem value="down" aria-label="Key Down" title="Key Down">
            <KeyDown className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="press" aria-label="Key Press" title="Key Press">
            <KeyRound className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="up" aria-label="Key Up" title="Key Up">
            <KeyUp className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
              {action.key ? action.key : "Select key..."}
            </Button>
          </PopoverTrigger>
          <PopoverContent className=" p-0">
            <Command filter={handleFilterCommand}>
              <CommandInput placeholder="Search key..." />
              <CommandEmpty>No key found.</CommandEmpty>
              <CommandGroup>
                <CommandList>
                  {KEYCODES.map((keycode) => keycode.hidden ? undefined : (
                    <CommandItem key={keycode.value} value={keycode.value + keycode.label} onSelect={() => handleKeycodeSelect(keycode.value)}>
                      {keycode.label == "Space bar" ? "Spacebar" : keycode.label}
                    </CommandItem>
                  ))}
                </CommandList>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
