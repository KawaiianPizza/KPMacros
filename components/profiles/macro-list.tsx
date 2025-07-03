"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown, ChevronRight, Edit, Trash, FileEdit, Plus, Zap } from "lucide-react"
import LoadingSpinner from "@/components/common/loading-spinner"
import { MacroData } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ScrollArea } from "../ui/scroll-area"

interface MacroListProps {
  macros: MacroData[]
  isLoading: boolean
  selectedProfile: string
  onToggleEnabled: (macroId: string, enabled: boolean) => void
  onUpdateLoopMode: (macroId: string, loopMode: "Held" | "Toggle") => void
  onEditMacro: (macroId: string) => void
  onRenameMacro: (macroId: string) => void
  onDeleteMacro: (macroId: string) => void
  onCreateNewMacro: () => void
}

export default function MacroList({
  macros,
  isLoading,
  selectedProfile,
  onToggleEnabled,
  onUpdateLoopMode,
  onEditMacro,
  onRenameMacro,
  onDeleteMacro,
  onCreateNewMacro,
}: MacroListProps) {
  const [selectedMacroId, setSelectedMacroId] = useState<string | null>(null)

  const handleMacroSelect = (macroId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setSelectedMacroId(selectedMacroId === macroId ? null : macroId)
  }

  const selectedMacro = selectedMacroId ? macros.find((m) => m.id === selectedMacroId) : null

  const renderMacroRow = (macro: MacroData) => {
    const isSelected = selectedMacroId === macro.id

    return (
      <div key={macro.id}>
        <div
          className={cn("cursor-pointer rounded-lg border bg-card p-4 transition-all duration-200 hover:border-active",
            isSelected ? "rounded-b-none border-b-0 border-active shadow-sm" : "border-border delay-200"
          )}
          onClick={(e) => handleMacroSelect(macro.id!, e)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isSelected ? (
                <ChevronDown className="h-4 w-4 text-input-text" />
              ) : (
                <ChevronRight className="h-4 w-4 text-input-text" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-secondary-foreground">{macro.name}</h3>
                  <Badge variant={macro.type === "Hotkey" ? "default" : "secondary"}>{macro.type}</Badge>
                  <Badge
                    variant={macro.enabled ? "default" : "outline"}
                    className={cn(macro.enabled || "bg-input/35 text-input-text/65")}
                  >
                    {macro.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="mt-1 flex text-sm text-foreground">
                  Activator:
                  <Badge className="mx-1 flex h-6 content-center items-center justify-between rounded px-1 font-mono text-sm">{macro.activator}</Badge>
                  {macro.type === "Hotkey" && (<> • Loop:
                    <Select
                      value={macro.loopMode}
                      onValueChange={(value: "Held" | "Toggle") => {
                        onUpdateLoopMode(macro.id!, value)
                      }}
                    >
                      <SelectTrigger className="h-6 w-24 rounded px-1" onClick={(e) => e.stopPropagation()}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Held" className="cursor-pointer">Held</SelectItem>
                        <SelectItem value="Toggle" className="cursor-pointer">Toggle</SelectItem>
                      </SelectContent>
                    </Select>
                  </>)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Switch checked={macro.enabled} onCheckedChange={(enabled) => onToggleEnabled(macro.id!, enabled)} />
              </div>
            </div>
          </div>
        </div>

        <CardContent className={cn("overflow-clip rounded-b-lg bg-card/65 px-0 pb-4 transition-all duration-300", isSelected ? "h-[70px] delay-200" : "h-0 p-0")}>
          <div className="p-4 bg-card/65 rounded-lg border border-dashed border-active rounded-t-none">
            <div className="flex items-center gap-2 justify-end *:bg-input">
              <Button size="sm" onClick={() => onEditMacro(macro.id!)}>
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button size="sm" onClick={() => onRenameMacro(macro.id!)}>
                <FileEdit className="h-4 w-4" />
                Rename
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDeleteMacro(macro.id!)}
              >
                <Trash className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </div >
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Macros for {selectedProfile}</CardTitle>
            <CardDescription>
              {selectedMacro
                ? `Selected: ${selectedMacro.name}`
                : "Click on a macro to select it and view action options"}
            </CardDescription>
          </div>
          <Button onClick={onCreateNewMacro} className="gap-2">
            <Plus className="h-4 w-4" />
            New Macro
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner text="Loading macros..." />
          </div>
        ) : macros.length === 0 ? (
          <div className="text-center py-8 text-foreground/65">
            <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="mb-2">No macros found for this profile</p>
            <Button variant="outline" onClick={onCreateNewMacro} className="gap-2">
              <Plus className="h-4 w-4" />
              Create your first macro
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-full pb-4 border border-border p-1 rounded-md bg-background before:absolute before:inset-0 before:bg-card/35 overflow-clip">
            <div className="space-y-2 max-h-[75dvh] z-10 relative">{macros.map(renderMacroRow)}</div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
