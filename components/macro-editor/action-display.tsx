"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, Trash, GripVertical, Copy, ChevronDown, ChevronUp } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { MacroAction } from "@/contexts/macro-editor-context"
import ActionInputFactory from "./action-inputs/action-input-factory"

interface ActionDisplayProps {
  action: MacroAction
  index: number
  listType: "start" | "loop" | "finish"
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<Omit<MacroAction, "id">>) => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
  onDelete: () => void
  dragHandleProps: any
  provided: any
}

export default function ActionDisplay({
  action,
  isSelected,
  onSelect,
  onUpdate,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  dragHandleProps,
  provided,
}: ActionDisplayProps) {
  const getActionDescription = () => {
    switch (action.type) {
      case "keyboard":
        switch (action.state) {
          case "down":
            return `Hold ${action.key}`
          case "press":
            return `Press ${action.key}`
          case "up":
            return `Release ${action.key}`
        }
        break;
      case "text":
        return `Type "${action.text}"`
      case "mouse":
        switch (action.state) {
          case "down":
            return `${action.button} button down`
          case "click":
            return `${action.button} click`
          case "up":
            return `${action.button} button up`
        }
        if (action.x !== undefined || action.y !== undefined) {
          const relative = action.relative
          const x = action.x || 0
          const y = action.y || 0
          return relative
            ? `Move mouse ${x >= 0 ? "right" : "left"} ${Math.abs(x)}px, ${y >= 0 ? "down" : "up"} ${Math.abs(y)}px`
            : `Move mouse to (${x}, ${y})`
        }
        if (action.scroll)
          return `Scroll ${action.scroll} ${action.amount} units`
        break;
      case "delay":
        return `Delay ${action.duration || action.duration}ms`
      default:
        return `${action.type}: ${action.value}`
    }
  }

  const getCurrentActionType = () => {
    return action.type
  }

  return (
    <Card
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={cn("border-border transition-all duration-200 select-none", isSelected ? "shadow-md" : "shadow-sm")}
    >
      <CardHeader
        className={cn(
          "py-3 px-4 flex flex-row items-center justify-between cursor-pointer",
          isSelected ? "border-b" : "",
        )}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("button")) return
          onSelect()
        }}
      >
        <div className="flex items-center">
          <div {...dragHandleProps} className="mr-2 cursor-grab" onClick={(e) => e.stopPropagation()}>
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-sm font-medium">
            {getActionDescription()}
          </CardTitle>
        </div>
        <div className="flex space-x-1">
          {isSelected ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation()
                onSelect()
              }}
            >
              <ChevronUp className="h-3 w-3" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation()
                onSelect()
              }}
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
          )}

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMoveUp()
                  }}
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Move up</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMoveDown()
                  }}
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Move down</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDuplicate()
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Duplicate</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                  }}
                >
                  <Trash className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>

      {isSelected && (
        <CardContent className="px-4 pb-4 pt-3">
          <div className="space-y-4">
            <div className="grid grid-row-1 gap-4">
              <div className="space-y-1">
                <Label className="text-xs">Type</Label>
                <Select value={action.type} onValueChange={(value) => onUpdate({ type: value })}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keyboard">Keyboard</SelectItem>
                    <SelectItem value="mouse">Mouse</SelectItem>
                    <SelectItem value="text">Type Text</SelectItem>
                    <SelectItem value="delay">Delay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="row-span-2">
                <ActionInputFactory
                  actionType={getCurrentActionType()}
                  action={action}
                  onChange={(updatedAction) => {
                    const { id, ...updates } = updatedAction
                    onUpdate(updates)
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
