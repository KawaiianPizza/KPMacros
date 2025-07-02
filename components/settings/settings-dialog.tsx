"use client"

import { useState, useMemo } from "react"
import { Search, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { SettingsGroup } from "./settings-group"
import { SettingsPanel } from "./settings-panel"
import { useSettingsData } from "@/hooks/use-settings-data"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const { settings, updateSetting, isSaving } = useSettingsData()

  const filteredSettings = useMemo(() => {
    if (!searchQuery.trim()) {
      return settings
    }

    const searchTerms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean)
    const filtered: typeof settings = {}

    Object.entries(settings).forEach(([groupKey, group]) => {
      const filteredGroup: typeof group = {}
      let hasMatchingSettings = false

      Object.entries(group).forEach(([settingKey, setting]) => {
        const searchableText = `${setting.label} ${setting.description}`.toLowerCase()
        const matches = searchTerms.every((term) => searchableText.includes(term))

        if (matches) {
          filteredGroup[settingKey] = setting
          hasMatchingSettings = true
        }
      })

      if (hasMatchingSettings) {
        filtered[groupKey] = filteredGroup
      }
    })

    return filtered
  }, [settings, searchQuery])

  const groupKeys = Object.keys(filteredSettings)
  const hasResults = groupKeys.length > 0

  const clearSearch = () => {
    setSearchQuery("")
  }

  const handleGroupSelect = (groupKey: string) => {
    setSelectedGroup(selectedGroup === groupKey ? null : groupKey)
  }

  const handleOpenChange = (open: boolean) => {
    if (open === false && isSaving) {
      return
    }
    onOpenChange(open)
  }
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] h-full p-0 flex flex-col text-foreground overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Settings</DialogTitle>
          {isSaving && (
            <div className="flex items-center gap-2 text-sm text-foreground/65">
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              <span>Saving settings...</span>
            </div>
          )}
        </DialogHeader>

        <div className="flex flex-1 min-h-0">
          <div className="w-64 border-r border-border flex flex-col">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-2 ">
                {groupKeys.map((groupKey) => (
                  <SettingsGroup
                    key={groupKey}
                    groupKey={groupKey}
                    isSelected={selectedGroup === groupKey}
                    onSelect={handleGroupSelect}
                    settingsCount={Object.keys(filteredSettings[groupKey]).length}
                  />
                ))}

                {!hasResults && searchQuery && (
                  <div className="text-sm text-foreground/65 text-center py-4">No settings found</div>
                )}
              </div>
            </ScrollArea>

            <Separator />

            <div className="p-4">
              <div className="relative text-input-text">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
                <Input
                  placeholder="Search settings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-9"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="!absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 relative bg-background before:absolute before:inset-0 before:bg-card/65">
            <SettingsPanel
              settings={filteredSettings}
              selectedGroup={selectedGroup}
              searchQuery={searchQuery}
              onUpdateSetting={updateSetting}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
