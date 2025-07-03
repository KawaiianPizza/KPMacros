"use client"

import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { ExternalLink, Info } from "lucide-react"
import type { Setting } from "@/contexts/settings-context"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command"
import { ScrollArea } from "../ui/scroll-area"
import { useTheme } from "@/contexts/theme-context"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { useWebSocketUI } from "@/hooks/use-websocketUI"

interface SettingItemProps {
  groupKey: string
  settingKey: string
  setting: Setting
  onUpdate: (groupKey: string, settingKey: string, value: any) => void
}

export function SettingItem({ groupKey, settingKey, setting, onUpdate }: SettingItemProps) {
  const { send } = useWebSocketUI()
  const [shouldWrap, setShouldWrap] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (typeof setting.value !== "object" || !setting.links)
      return
    setShouldWrap(true)
  }, [setting])

  const getSettingType = () => {
    switch (typeof setting.value) {
      case "boolean":
        const handleBooleanChange = (checked: boolean) => {
          onUpdate(groupKey, settingKey, checked)
        }
        return <Switch checked={setting.value} disabled={setting.disabled} onCheckedChange={handleBooleanChange} />;
      case "string":
        const { themes, currentTheme, setTheme } = useTheme()
        const handleThemeChange = (name: string) => {
          setTheme(name)
          onUpdate(groupKey, settingKey, name)
        }
        if (open)
          send("getThemes", {})

        return (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                {currentTheme.name}
              </Button>
            </PopoverTrigger>
            {open &&
              <PopoverContent className="p-0 md:w-96">
                <Command>
                  <CommandInput placeholder="Search theme..." />
                  <CommandEmpty>No theme found.</CommandEmpty>
                  <CommandGroup>
                    <ScrollArea className="max-h-[300px]">
                      <CommandList>
                        <div className="flex flex-wrap gap-2 border-0 p-2">
                          {themes.map((theme) => {
                            if (theme.isDefault && theme.name !== "Hallowed Mint") return undefined
                            return (
                              <CommandItem key={theme.name} value={theme.name} onSelect={() => handleThemeChange(theme.name)}
                                className="group w-auto min-w-fit flex-shrink-0 gap-0.5">
                                {theme.name}
                              </CommandItem>)
                          })}
                        </div>
                      </CommandList>
                    </ScrollArea>
                  </CommandGroup>
                </Command>
              </PopoverContent>}
          </Popover>)
      case "number":
      case "bigint":
      case "symbol":
      case "undefined":
        if (setting.link)
          return (
            <Button size="sm" onClick={() => window.open(setting.link, "_blank")} className="gap-2">
              <Info className="h-4 w-4" />
              View
              <ExternalLink className="h-3 w-3" />
            </Button>)
      case "object":
        if (!setting.links) return;
        return (<div className="ml-auto">
          {setting.links.map((link: string) => {
            const domainReg = /(?<=\/\/|^)(?:.+\.)?([a-zA-Z0-9-]+)(?=\.[a-zA-Z]{2,})/g
            const domain = domainReg.exec(link)
            if (!domain || domain.length !== 2) return
            return (
              <Button key={link} size="sm" onClick={() => window.open(link, "_blank")} className="gap-2 rounded-none first:rounded-l-md last:rounded-r-md">
                <Info className="h-4 w-4" />
                {domain[1]}
                <ExternalLink className="h-3 w-3" />
              </Button>)
          })}</div>)
      case "function":
    }
  }

  return (
    <div className={cn("flex items-start justify-between py-3 px-4 rounded-lg bg-card border border-border text-card-foreground", shouldWrap ? "flex-col space-y-3" : "")}>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium leading-none">{setting.label}</h4>
        </div>
        <p className="text-sm text-foreground/65 leading-relaxed whitespace-pre-wrap">{setting.description}</p>
      </div>

      <div className={cn("ml-4 flex-shrink-0 place-self-center", shouldWrap ? "ml-auto" : "")}>
        {getSettingType()}
      </div>
    </div>
  )
}
