"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SettingsGroupProps {
  groupKey: string
  isSelected: boolean
  onSelect: (groupKey: string) => void
  settingsCount: number
}

const groupLabels: Record<string, string> = {
  general: "General",
  updates: "Updates",
  about: "About",
}

export function SettingsGroup({ groupKey, isSelected, onSelect, settingsCount }: SettingsGroupProps) {
  const label = groupLabels[groupKey] || groupKey

  return (
    <Button
      className={cn("w-full justify-between h-auto p-3 text-left", isSelected && "border-2 border-accent text-accent")}
      onClick={() => onSelect(groupKey)}
    >
      <span className="font-medium">{label}</span>
      <Badge variant="outline" className="ml-2">
        {settingsCount}
      </Badge>
    </Button>
  )
}
