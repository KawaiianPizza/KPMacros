"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUp, ArrowDown, Trash, GripVertical, Copy, PencilLine, Save } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import ActionInputFactory from "./action-inputs/action-input-factory"
import { DelayAction, KeyboardAction, MacroActionType, MouseButtonAction, MouseMoveAction, MouseScrollAction, ProcessAction, SoundAction, TextAction, type MacroAction } from "@/lib/types"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Input } from "../ui/input"

interface ActionDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
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
  ...props
}: ActionDisplayProps) {
  const [isRenaming, setIsRenaming] = useState<boolean>(false)
  const [description, setDescription] = useState(action.description)

  const getActionDescription = useMemo(() => {
    if (action.description) {
      return (<span className="text-info-text">{action.description}</span>)
    }

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
        if ("state" in action)
          return (
            <span>
              <span className="text-info-text">{action.button}</span> mouse{" "}
              <span className="text-info-text">{action.state}</span>
            </span>
          )
        if ("x" in action && "y" in action && "relative" in action) {
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
        if ("scroll" in action && "amount" in action)
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
        return `${(action as any).type}: ${(action as any).value}`
    }
  }, [action])

  const isActionValid = useMemo(() => {
    const type = action.type
    switch (type) {
      case "keyboard":
        return typeof action === 'object' && action !== null && action.key && typeof action.state === 'string'
      case "mouse":
        return (
          ("button" in action && "state" in action) ||
          ("x" in action && "y" in action && "relative" in action) ||
          ("scroll" in action && "amount" in action)
        )
      case "text":
        return typeof action.text === 'string'
      case "delay":
        return typeof action.duration === 'number'
      case "sound":
        return typeof action.filePath === 'string' && action.filePath.includes('\\')
      case "process":
        return (
          typeof action.filePath === 'string' &&
          (action.arguments === undefined || typeof action.arguments === 'string') &&
          typeof action.hidden === 'boolean'
        )
      default:
        return type satisfies never && false
    }
  }, [action])

  const handleActionTypeChange = (value: typeof MacroActionType[number]) => {
    const defaults = {
      keyboard: { state: "press" },
      mouse: { button: "left", state: "click" },
      text: { text: "" },
      delay: { duration: 25 },
      sound: {},
      process: {},
    } as const
    onUpdate({ type: value, ...defaults[value] })
  }

  useEffect(() => {
    onUpdate({ description })
  }, [isRenaming])

  const descriptionToHTML = useMemo(() => {
    if (!description) return undefined
    const parts = description.split(/(\\[[\]])|(\[[^\[\]]+\])/g)
    return <span>
      {parts.filter(part => part !== undefined && part !== '').map((part, index) => {
        if (part.startsWith('[') && part.endsWith(']')) {
          return <span className="text-info-text" key={index}>{part.slice(1, -1)}</span>
        } else {
          return <span key={index}>{part.replace(/\\([\[\]])/g, "$1")}</span>
        }
      })}
    </span>
  }, [description])

  return (
    <Card
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      className={cn(
        props.className,
        "group w-full select-none overflow-hidden transition-all duration-200",
        isSelected ? "shadow-md" : "shadow-sm",
      )}
    >
      <CardHeader
        className={cn(
          "gloss relative flex w-full cursor-pointer flex-row items-center justify-between rounded-lg px-4 py-3",
          isSelected ? "border-b border-border rounded-b-none" : "",
        )}
        {...dragHandleProps}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("button") || isRenaming) return
          onSelect()
        }}
      >
        <div className="flex items-center cursor-grab w-0 flex-1 min-w-0 m-auto">
          <div className="mr-2 shrink-0">
            <GripVertical className="h-4 w-4 text-foreground/65" />
          </div>
          <CardTitle className="text-sm font-medium w-0 flex-1 min-w-0 break-all hyphens-auto overflow-hidden">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  {isRenaming ?
                    <div className="flex">
                      <Input className="w-full break-all hyphens-auto rounded-r-none" value={description} onClick={e => e.stopPropagation()} onChange={e => setDescription(e.target.value)} />
                      <Button variant="ghost" size="icon" className="rounded-l-none" onClick={() => setIsRenaming(false)}><Save className="h-3 w-3" /></Button>
                    </div>
                    : <div className="w-full break-all hyphens-auto overflow-hidden truncate">{descriptionToHTML || getActionDescription}</div>
                  }
                </TooltipTrigger>
                <TooltipContent>{descriptionToHTML || getActionDescription}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </div>
        {/* Toolbar */}
        <div
          className={cn(
            "absolute right-2.5 my-auto flex space-x-1 p-2 transition-all duration-200 rounded-md before:border before:border-border",
            "w-0 min-w-0 overflow-clip px-0 gloss",
            !isRenaming && "group-hover:w-38 group-hover:min-w-38 group-hover:px-2",
            !isRenaming && isSelected && "w-38 min-w-38 px-2",
          )}
        >
          {[{ name: "Rename", icon: PencilLine, handler: () => setIsRenaming(prev => !prev) },
          { name: "Move up", icon: ArrowUp, handler: () => onMoveUp() },
          { name: "Move down", icon: ArrowDown, handler: () => onMoveDown() },
          { name: "Duplicate", icon: Copy, handler: () => onDuplicate() },
          { name: "Delete", icon: Trash, handler: () => onDelete(), destructive: true }].map(({ name, icon: Icon, handler, destructive }, index) =>
            <TooltipProvider delayDuration={300} key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={destructive ? "destructive" : "ghost"}
                    size="icon"
                    className="h-6 w-6 shrink-0 bg-input/10 backdrop-blur-sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handler()
                    }}
                  >
                    <Icon className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{name}</TooltipContent>
              </Tooltip>
            </TooltipProvider>)}
        </div>
      </CardHeader>

      {isSelected && (
        <CardContent className={cn("px-4 pb-4 pt-3 w-full overflow-hidden bg-background/25", !isActionValid && "ring-inset ring-1 ring-red-600")}>
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
