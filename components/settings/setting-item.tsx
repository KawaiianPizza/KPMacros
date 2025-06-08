"use client"

import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { ExternalLink, Info } from "lucide-react"
import type { Setting, SettingValue } from "@/hooks/use-settings-data"

interface SettingItemProps {
  groupKey: string
  settingKey: string
  setting: Setting
  onUpdate: (groupKey: string, settingKey: string, value: SettingValue) => void
}

export function SettingItem({ groupKey, settingKey, setting, onUpdate }: SettingItemProps) {
  const handleBooleanChange = (checked: boolean) => {
    onUpdate(groupKey, settingKey, checked)
  }

  const getSettingType = () => {
    switch (typeof setting.value) {
      case "boolean":
        return <Switch checked={setting.value} onCheckedChange={handleBooleanChange} />;
      case "string":
      case "number":
      case "bigint":
      case "symbol":
      case "undefined":
        if (setting.link)
          return (
            <Button variant="outline" size="sm" onClick={() => window.open(setting.link, "_blank")} className="gap-2">
              <Info className="h-4 w-4" />
              View
              <ExternalLink className="h-3 w-3" />
            </Button>)
      case "object":
      case "function":
    }
  }

  return (
    <div className="flex items-start justify-between py-3 px-4 rounded-lg border bg-card">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium leading-none">{setting.label}</h4>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{setting.description}</p>
      </div>

      <div className="ml-4 flex-shrink-0">
        {getSettingType()}
      </div>
    </div>
  )
}
