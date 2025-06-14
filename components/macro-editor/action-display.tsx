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
        return <span>
          {action.state === "down" && "Hold" || action.state === "press" && "Press" || action.state === "up" && "Release"}{" "}
          <span className="text-secondary-foreground">{action.key}</span>
        </span>
      case "text":
        return <span>Type <span className="text-secondary-foreground">{action.text}</span></span>
      case "mouse":
        if (action.state)
          return <span>
            <span className="text-secondary-foreground">{action.button}</span> mouse {" "}
            <span className="text-secondary-foreground">{action.state}</span>
          </span>
        if (action.x !== undefined || action.y !== undefined) {
          const relative = action.relative
          const x = action.x || 0
          const y = action.y || 0
          return relative
            ? <span>Move mouse <span className="text-secondary-foreground">{x >= 0 ? "right" : "left"} {Math.abs(x)}px</span>, <span className="text-secondary-foreground">{y >= 0 ? "down" : "up"} {Math.abs(y)}px</span></span>
            : <span>Move mouse to (<span className="text-secondary-foreground">{x}</span>, <span className="text-secondary-foreground">{y}</span>)</span>
        }
        if (action.scroll)
          return <span>Scroll <span className="text-secondary-foreground">{action.scroll} {action.amount}</span> time{action.amount > 1 && "s"}</span>
        break;
      case "delay":
        return <span>Delay <span className="text-secondary-foreground">{action.duration}ms</span></span>
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
      className={cn("border-border transition-all duration-200 select-none bg-primary group", isSelected ? "shadow-md" : "shadow-sm")}
    >
      <CardHeader
        className={cn(
          "py-3 px-4 flex flex-row items-center justify-between cursor-pointer",
          isSelected ? "border-b" : "",
        )}
        {...dragHandleProps}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("button")) return
          onSelect()
        }}
      >
        <div className="flex items-center cursor-grab">
          <div className="mr-2">
            <GripVertical className="h-4 w-4 text-foreground/65" />
          </div>
          <CardTitle className="text-sm font-medium">
            {getActionDescription()}
          </CardTitle>
        </div>
        <div className={cn("flex space-x-1 transition-all duration-200 overflow-x-hidden opacity-0 min-w-0 w-0 group-hover:w-28 group-hover:min-w-28 group-hover:opacity-100",
          isSelected && "w-28 min-w-28 opacity-100"
        )}>
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
                  className="h-6 w-6 text-destructive hover:text-gray-800 hover:bg-destructive"
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
