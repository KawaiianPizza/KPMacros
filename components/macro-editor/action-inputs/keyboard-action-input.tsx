"use client"

import type React from "react"

import { SyntheticEvent, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { ArrowDownToLine, ArrowUpFromLine, ArrowDownUp, ExternalLinkIcon, Info, Loader2 } from "lucide-react"
import KEYCODES from "@/lib/KEYCODES"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MacroAction, Window } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useWebSocketUI } from "@/hooks/use-websocketUI"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"

interface KeyboardActionInputProps {
  action: MacroAction
  onChange: (action: MacroAction) => void
  compact: boolean
}

export default function KeyboardActionInput({ action, onChange, compact }: KeyboardActionInputProps) {
  const { send, on, off } = useWebSocketUI()
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [window, setWindow] = useState<string>(action.window || "")
  const [windows, setWindows] = useState<Window[]>([])
  const [isLoadingWindows, setIsLoadingWindows] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)

  useEffect(() => {
    onChange({
      ...action,
      state: action.state || "press",
    })
  }, [])

  useEffect(() => {
    const handleWindows = (data: Window[]) => {
      setTimeout(() => {
        send("getWindows", {})
      }, 5000);
      setWindows(data)
      setIsLoadingWindows(false)
    }

    on("windows", handleWindows)

    send("getWindows", {})

    return () => {
      off("windows", handleWindows)
    }
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

  function handleSearchChange(value: string) {
    if (!/^\d+$/g.test(value)) return
    const index = Number.parseInt(value);
    if (index > 0 && index < 256)
      onChange({ ...action, key: value })
  }

  return (
    <div className="flex flex-wrap gap-4 items-start content-center">
      <div className="min-w-[126px] flex-shrink space-y-2">
        <Label>Key State</Label>
        <div className="flex">
          <ToggleGroup
            type="single"
            value={action.state}
            onValueChange={handleKeyboardModeChange}
            className="flex-shrink-0 rounded-lg"
          >
            <ToggleGroupItem value="down" aria-label="Key Down" title="Key Down">
              <ArrowDownToLine className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="press" aria-label="Key Press" title="Key Press">
              <ArrowDownUp className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="up" aria-label="Key Up" title="Key Up">
              <ArrowUpFromLine className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="min-w-[240px] flex-1 space-y-2">
        <Label>Key</Label>
        <div className="flex">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={open} className="flex-1 min-w-[220px] justify-between">
                {action.key ? action.key : "Select key..."}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 md:w-96">
              <Command filter={handleFilterCommand} onChange={(e) => handleSearchChange((e.target as HTMLInputElement).value)}>
                <CommandInput placeholder="Search key..." />
                <CommandEmpty>No key found.</CommandEmpty>
                <CommandGroup>
                  <ScrollArea className="h-[300px]">
                    <CommandList>
                      <div className="flex flex-wrap gap-2 border-0 p-2">
                        {KEYCODES.map((keycode) => {
                          if (keycode.hidden) return undefined

                          return (
                            <>
                              <CommandItem key={keycode.value} value={keycode.value + keycode.label} onSelect={() => handleKeycodeSelect(keycode.value)}
                                className="group w-auto min-w-fit flex-shrink-0 gap-0.5">
                                {keycode.label == "Space bar" ? "Spacebar" :
                                  keycode.label.length === 3 && keycode.label[1] === ' '
                                    ? <>{keycode.label[0]}<span className="text-[0.625rem] leading-5 tracking-[-0.25rem] text-input-text/65 group-data-[selected='true']:text-active/65">{keycode.label[2]}</span></>
                                    : keycode.label}
                              </CommandItem>
                              {keycode.endBlock && <div className="w-full border-t border-border/35 my-1"></div>}
                            </>)
                        })}
                      </div>
                    </CommandList>
                  </ScrollArea>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="min-w-[220px] flex-1 space-y-2">
        <Label htmlFor="file-name">Window</Label>
        <div className="flex">
          <Input
            id="file-name"
            ref={inputRef}
            value={window}
            onChange={(e) => setWindow(e.currentTarget.value)}
            placeholder="File name... (optional)"
            className="flex-1 rounded-r-none min-w-0"
          />
          <Dialog open={openDialog} onOpenChange={() => setOpenDialog(false)}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                </DialogTitle>
              </DialogHeader>

              <div className="grid gap-6 py-4">
                <div className="space-y-2">
                  <div className="border border-border rounded-lg overflow-clip bg-background">
                    <ScrollArea className="p-3 bg-card/65">
                      {isLoadingWindows ? (
                        <div className="flex items-center justify-center py-8 text-foreground/65">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading available windows...
                        </div>
                      ) : windows.length === 0 ? (
                        <div className="text-center py-8 text-foreground/65">
                          <p>No windows available</p>
                          <p className="text-xs mt-1">Make sure some applications are running</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {windows.map((window) => {
                            return (
                              <Card key={window.pid} onClick={() => { setWindow(window.executable.replace(/\.[^.]+$/, "")); setOpenDialog(false) }}>
                                <CardHeader className="p-3 gap-1">
                                  {window.title || window.executable}
                                  <CardDescription className="pl-3">
                                    {window.executable}
                                  </CardDescription>
                                </CardHeader>
                              </Card>
                            )
                          })}
                        </div>
                      )}
                    </ScrollArea>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button type="button" variant="outline" onClick={() => setOpenDialog(true)} className="shrink-0 rounded-l-none">
            Choose
          </Button>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-10 ml-1" />
              </TooltipTrigger>
              <TooltipContent>Sends input directly to the process, allowing for background input. Does not work in all programs or processes with higher elevation.</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      {!compact &&
        <div className="space-y-1 rounded-md bg-background/65 p-3 text-xs text-foreground/65 font-mono">
          A number between 1-255 can be used to represent a VirtualKeyCode.{" "}
          <a rel="noopener noreferrer" href="https://learn.microsoft.com/en-us/windows/win32/inputdev/virtual-key-codes" target="_blank" >
            <ExternalLinkIcon className="h-4 w-4 inline mr-1" />
            See here
          </a>
        </div>
      }
    </div>
  )
}
