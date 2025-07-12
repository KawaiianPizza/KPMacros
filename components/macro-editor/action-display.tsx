"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, Trash, GripVertical, Copy } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import ActionInputFactory from "./action-inputs/action-input-factory"
import { MacroActionType, type MacroAction } from "@/lib/types"
import TypeRowSelect from "../common/type-row-select"

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
        return (
          <span>
            {(action.state === "down" && "Hold") ||
              (action.state === "press" && "Press") ||
              (action.state === "up" && "Release")}{" "}
            <span className="text-info-text">{action.key}</span>
          </span>
        )
      case "text":
        return (
          <span>
            Type <span className="text-info-text">{action.text}</span>
          </span>
        )
      case "mouse":
        if (action.state)
          return (
            <span>
              <span className="text-info-text">{action.button}</span> mouse{" "}
              <span className="text-info-text">{action.state}</span>
            </span>
          )
        if (action.x !== undefined || action.y !== undefined) {
          const relative = action.relative
          const x = action.x || 0
          const y = action.y || 0
          return relative ? (
            <span>
              Move mouse{" "}
              <span className="text-info-text">
                {x >= 0 ? "right" : "left"} {Math.abs(x)}px
              </span>
              ,{" "}
              <span className="text-info-text">
                {y >= 0 ? "down" : "up"} {Math.abs(y)}px
              </span>
            </span>
          ) : (
            <span>
              Move mouse to (<span className="text-info-text">{x}</span>,{" "}
              <span className="text-info-text">{y}</span>)
            </span>
          )
        }
        if (action.scroll)
          return (
            <span>
              Scroll{" "}
              <span className="text-info-text">
                {action.scroll} {action.amount}
              </span>{" "}
              time{action.amount > 1 && "s"}
            </span>
          )
        break
      case "delay":
        return (
          <span>
            Delay <span className="text-info-text">{action.duration}ms</span>
          </span>
        )
      case "sound":
        return (
          <span>
            Play <span className="text-info-text">{action.filePath?.split("\\").at(-1)}</span>
          </span>
        )
      case "process":
        return (
          <span>
            Run <span className="text-info-text">{action.filePath}</span>
            {action.arguments && (
              <>
                {" "}
                with args <span className="text-info-text">{action.arguments}</span>
              </>
            )}{" "}
            ({<span className="text-info-text">{action.hidden ? "Inv" : "V"}isible</span>})
          </span>
        )
      default:
        return `${action.type}: ${action.value}`
    }
  }

  const isActionValid = () => {
    const type = action.type
    if (type === "keyboard" && !action.key) return false
    if (type === "text" && !action.text) return false
    if (type === "delay" && !action.duration) return false
    if (type === "sound" && !action.filePath) return false
    if (type === "process" && !action.filePath) return false
    return true
  }

  const handleActionTypeChange = (value: string) => {
    const actionMap = {
      keyboard: { state: "press" },
      mouse: { button: "left", state: "click" },
      text: { text: "" },
      delay: { duration: 25 },
      sound: {},
      process: {},
    }
    onUpdate({ type: value, ...actionMap[value as keyof typeof actionMap] })
  }

  return (
    <Card
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={cn(
        "transition-all duration-200 select-none group w-full overflow-hidden",
        isSelected ? "shadow-md" : "shadow-sm",
      )}
    >
      <CardHeader
        className={cn(
          "py-3 px-4 flex flex-row items-center justify-between cursor-pointer w-full relative",
          isSelected ? "border-b" : "",
        )}
        {...dragHandleProps}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("button")) return
          onSelect()
        }}
      >
        <div className="flex items-center cursor-grab w-0 flex-1 min-w-0">
          <div className="mr-2 flex-shrink-0">
            <GripVertical className="h-4 w-4 text-foreground/65" />
          </div>
          <CardTitle className="text-sm font-medium w-0 flex-1 min-w-0 break-all hyphens-auto overflow-hidden">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                {(() => {
                  const text = getActionDescription()
                  return <>
                    <TooltipTrigger asChild>
                      <div className="w-full break-all hyphens-auto overflow-hidden truncate">{text}</div>
                    </TooltipTrigger>
                    <TooltipContent>{text}</TooltipContent>
                  </>
                })()}
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </div>
        <div
          className={cn(
            "absolute right-2.5 top-0 !mt-0 flex space-x-1 rounded-md border border-border/35 bg-card/100 p-2 transition-all duration-200",
            "w-0 min-w-0 overflow-hidden opacity-0 group-hover:w-32 group-hover:min-w-32 group-hover:opacity-100",
            isSelected && "w-32 min-w-32 opacity-100",
          )}
        >
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
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
                  className="h-6 w-6 flex-shrink-0"
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
                  className="h-6 w-6 flex-shrink-0"
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
                  variant="destructive"
                  size="icon"
                  className="h-6 w-6 flex-shrink-0"
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
        <CardContent className={cn("px-4 pb-4 pt-3 w-full overflow-hidden bg-background/25", !isActionValid() && "ring-inset ring-1 ring-red-600")}>
          <div className="space-y-4 w-full overflow-hidden">
            <div className="grid grid-row-1 gap-4 w-full overflow-hidden">
              {/* <div className="space-y-1 w-full overflow-hidden">
                <Label className="text-xs">Type</Label>
                <TypeRowSelect columns={3} rows={2} id="action-type" options={[...MacroActionType]} value={action.type} onValueChange={handleActionTypeChange}></TypeRowSelect>
              </div> */}
              <div className="row-span-2 w-full overflow-hidden">
                <div className="w-full overflow-hidden">
                  <ActionInputFactory
                    actionType={action.type}
                    action={action}
                    onChange={(updatedAction) => {
                      const { id, ...updates } = updatedAction
                      onUpdate(updates)
                    }}
                    compact={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
