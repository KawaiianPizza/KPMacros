"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { SettingItem } from "./setting-item"
import type { SettingsData, SettingValue } from "@/hooks/use-settings-data"

interface SettingsPanelProps {
  settings: SettingsData
  selectedGroup: string | null
  searchQuery: string
  onUpdateSetting: (groupKey: string, settingKey: string, value: SettingValue) => void
}

const groupLabels: Record<string, string> = {
  general: "General",
  updates: "Updates",
  about: "About",
}

export function SettingsPanel({ settings, selectedGroup, searchQuery, onUpdateSetting }: SettingsPanelProps) {
  const groupsToShow = selectedGroup ? [selectedGroup].filter((key) => settings[key]) : Object.keys(settings)

  if (groupsToShow.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium">No settings found</p>
          {searchQuery && <p className="text-sm mt-1">Try adjusting your search terms</p>}
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full pb-4">
      <div className="p-6 space-y-8 overflow-y-auto">
        {groupsToShow.map((groupKey, index) => {
          const group = settings[groupKey]
          const groupLabel = groupLabels[groupKey] || groupKey
          const settingEntries = Object.entries(group)

          return (
            <div key={groupKey}>
              {index > 0 && <Separator className="mb-8" />}

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold">{groupLabel}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{getGroupDescription(groupKey)}</p>
                </div>

                <div className="space-y-4">
                  {settingEntries.map(([settingKey, setting]) => (
                    <SettingItem
                      key={`${groupKey}-${settingKey}`}
                      groupKey={groupKey}
                      settingKey={settingKey}
                      setting={setting}
                      onUpdate={onUpdateSetting}
                    />
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}

function getGroupDescription(groupKey: string): string {
  const descriptions: Record<string, string> = {
    general: "Basic application configuration and startup options",
    updates: "Update preferences and automatic update settings",
    about: "Application information and support resources",
  }
  return descriptions[groupKey] || ""
}
