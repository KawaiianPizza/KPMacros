"use client"

import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { ExternalLink, Info } from "lucide-react"
import type { Setting, SettingValue } from "@/hooks/use-settings-data"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface SettingItemProps {
  groupKey: string
  settingKey: string
  setting: Setting
  onUpdate: (groupKey: string, settingKey: string, value: SettingValue) => void
}

export function SettingItem({ groupKey, settingKey, setting, onUpdate }: SettingItemProps) {
  const [shouldWrap, setShouldWrap] = useState(false)
  const handleBooleanChange = (checked: boolean) => {
    onUpdate(groupKey, settingKey, checked)
  }
  useEffect(() => {
    if (typeof setting.value !== "object" || !setting.links)
      return
    setShouldWrap(true)
  }, [setting])
  const getSettingType = () => {
    switch (typeof setting.value) {
      case "boolean":
        return <Switch checked={setting.value} disabled={setting.disabled} onCheckedChange={handleBooleanChange} />;
      case "string":
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
          {setting.links.map(link => {
            const domainReg = /(?<=\/\/|^)(?:.+\.)?([a-zA-Z0-9-]+)(?=\.[a-zA-Z]{2,})/g
            const domain = domainReg.exec(link)
            if (!domain || domain.length !== 2) return
            console.log(domain)
            return (
              <Button size="sm" onClick={() => window.open(link, "_blank")} className="gap-2 rounded-none first:rounded-l-md last:rounded-r-md">
                <Info className="h-4 w-4" />
                {domain[1]}
                <ExternalLink className="h-3 w-3" />
              </Button>)
          })}</div>)
      case "function":
    }
  }

  return (
    <div className={cn("flex items-start justify-between py-3 px-4 rounded-lg border border-border bg-card text-card-foreground", shouldWrap ? "flex-col space-y-3" : "")}>
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
