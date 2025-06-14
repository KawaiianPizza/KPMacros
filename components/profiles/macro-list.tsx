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
import { Macro } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ScrollArea } from "../ui/scroll-area"

interface MacroListProps {
  macros: Macro[]
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

  const renderMacroRow = (macro: Macro) => {
    const isSelected = selectedMacroId === macro.id

    return (
      <div key={macro.id}>
        <div
          className={cn("p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:border-accent bg-card",
            isSelected ? "border-accent shadow-sm border-b-0 rounded-b-none" : "border-border"
          )}
          onClick={(e) => handleMacroSelect(macro.id, e)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isSelected ? (
                <ChevronDown className="h-4 w-4 text-primary-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-primary-foreground" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-secondary-foreground">{macro.name}</h3>
                  <Badge variant={macro.type === "Hotkey" ? "default" : "secondary"}>{macro.type}</Badge>
                  <Badge
                    variant={macro.enabled ? "default" : "outline"}
                    className={cn(macro.enabled || "bg-primary/35 text-primary-foreground/65")}
                  >
                    {macro.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <p className="text-sm text-foreground mt-1 flex">
                  Activator:
                  <Badge className="font-mono bg-primary text-secondary-foreground px-1 content-center h-6 text-sm flex items-center justify-between border rounded border-input">{macro.activator}</Badge>
                  {macro.type === "Hotkey" && (<> • Loop:
                    <Select
                      value={macro.loopMode}
                      onValueChange={(value: "Held" | "Toggle") => {
                        onUpdateLoopMode(macro.id, value)
                      }}
                    >
                      <SelectTrigger className="h-6 w-24 font-mono bg-primary text-primary-foreground px-1 rounded" onClick={(e) => e.stopPropagation()}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="text-primary-foreground bg-primary">
                        <SelectItem value="Held" className="focus:text-primary-foreground focus:bg-primary/65 cursor-pointer">Held</SelectItem>
                        <SelectItem value="Toggle" className="focus:text-primary-foreground focus:bg-primary/65 cursor-pointer">Toggle</SelectItem>
                      </SelectContent>
                    </Select>
                  </>)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Switch checked={macro.enabled} onCheckedChange={(enabled) => onToggleEnabled(macro.id, enabled)} />
              </div>
            </div>
          </div>
        </div>

        <CardContent className={cn("px-0 pb-4 overflow-hidden transition-all duration-300", isSelected ? "h-[70px]" : "h-0 p-0")}>
          <div className="p-4 bg-card/35 rounded-lg border border-dashed border-accent rounded-t-none">
            <div className="flex items-center gap-2 justify-end *:bg-primary">
              <Button variant="outline" size="sm" onClick={() => onEditMacro(macro.id)} className="gap-2 text-primary-foreground hover:bg-primary/65">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => onRenameMacro(macro.id)} className="gap-2 text-primary-foreground hover:bg-primary/65">
                <FileEdit className="h-4 w-4" />
                Rename
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeleteMacro(macro.id)}
                className="gap-2 text-destructive hover:text-destructive hover:bg-primary/65"
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
          <ScrollArea className="h-full pb-4 border border-border p-1 rounded-md bg-background">
            <div className="space-y-2 max-h-[75dvh]">{macros.map(renderMacroRow)}</div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
