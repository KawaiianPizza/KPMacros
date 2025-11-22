"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useMacroEditor } from "@/contexts/macro-editor-context"
import { DragDropContext, type DropResult } from "@hello-pangea/dnd"
import ActionList from "@/components/macro-editor/action-list"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RotateCcw, Plus, ArrowUpFromLine, ArrowDownToLine, Disc, Disc2, Disc2Icon, Keyboard, MousePointer, MousePointerClick, MoveRight, MoveVertical, Move, Mouse, ClockPlus, Info } from "lucide-react"
import ActionInputFactory from "@/components/macro-editor/action-inputs/action-input-factory"
import { cn } from "@/lib/utils"
import type { InputData, MacroAction } from "@/lib/types"
import { MacroActionType } from "@/lib/types"
import TypeRowSelect from "../common/type-row-select"
import { Separator } from "../ui/separator"
import { useWebSocketUI } from "@/hooks/use-websocketUI"
import KEYCODES from "@/lib/KEYCODES"
import { useToast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider } from "../ui/tooltip"
import { TooltipTrigger } from "@radix-ui/react-tooltip"
import { NumberInput } from "../common/number-input"
import { CountdownTimer } from "../common/countdown-timer"

export default function ActionsTab() {
  const { macro, addAction, moveActionBetweenLists, isRecording, setIsRecording, updateMacro } = useMacroEditor()
  const { send, on, off } = useWebSocketUI()
  const { toast } = useToast()
  const [newAction, setNewAction] = useState<MacroAction>({
    id: "0",
    type: "keyboard",
  })
  const [recordingList, setRecordingList] = useState<"start" | "loop" | "finish" | undefined>()
  const [recordButtonConfigs, setRecordButtonConfigs] = useState([
    {
      icon: Keyboard,
      tooltip: "Record keyboard input" as const,
      state: true
    },
    {
      icon: Mouse,
      tooltip: "Record mouse input" as const,
      state: false
    },
    {
      icon: Move,
      tooltip: "Record mouse movement" as const,
      state: false
    },
    {
      icon: ClockPlus,
      tooltip: "Record delays between inputs" as const,
      state: true
    },
  ])
  const recordingListRef = useRef(recordingList)
  const actionBuffer = useRef<MacroAction[]>([])
  const flushTimer = useRef<NodeJS.Timeout | null>(null)
  const DEBOUNCE_INTERVAL = 100
  const disableRecordButtons = useMemo(() => recordButtonConfigs.slice(0, 3).every(e => !e.state), [recordButtonConfigs])
  const [shouldCountdown, setShouldCountdown] = useState<"start" | "loop" | "finish" | undefined>()

  useEffect(() => {
    recordingListRef.current = recordingList
  }, [recordingList])
  useEffect(() => {
    if (!isRecording) return
    on("inputData", handleRecordingInput)
    const [keyboard, mouse, move, delay] = recordButtonConfigs.map(e => e.state || undefined)
    send("startRecordInput", { interrupt: false, keyboard, mouse, move, delay })

    return () => {
      send("stopRecordInput", {})
      off("inputData", handleRecordingInput)
      setIsRecording(false)
    }
  }, [isRecording])

  const actionCounts = {
    start: macro.start.length,
    loop: macro.loop.length,
    finish: macro.finish.length,
  }
  const totalCount = Object.values(actionCounts).reduce((sum, count) => sum + count, 0)

  const handleActionTypeChange = (value: typeof MacroActionType[number]) => {
    const actionMap = {
      keyboard: { state: "press" },
      mouse: { button: "left", state: "click" },
      text: { text: "" },
      delay: { duration: 25 },
      sound: { volume: 100 },
      process: {},
    }
    setNewAction({ id: newAction.id, type: value, ...actionMap[value] })
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const sourceListType = result.source.droppableId.replace("-actions", "") as "start" | "loop" | "finish"
    const destinationListType = result.destination.droppableId.replace("-actions", "") as "start" | "loop" | "finish"

    moveActionBetweenLists(sourceListType, destinationListType, result.source.index, result.destination.index)
  }

  const handleAddAction = (type: "start" | "loop" | "finish") => {
    if (newAction.type === "keyboard" && newAction.state === "press") {
      addAction(type, {
        ...newAction,
        id: crypto.randomUUID(),
        state: "down",
      })
      addAction(type, {
        ...newAction,
        id: crypto.randomUUID(),
        state: "up",
      })
    } else {
      addAction(type, { ...newAction, id: crypto.randomUUID() })
    }
    setNewAction({ ...newAction })
  }

  const handleToggleRecordActions = (type: "start" | "loop" | "finish") => {
    if (recordButtonConfigs[2].state && !shouldCountdown) {
      setShouldCountdown(type)
      return
    }
    if (type === recordingList && isRecording) {
      send("stopRecordInput", {})
      setShouldCountdown(undefined)
      setIsRecording(false)
      return
    }
    setIsRecording(true)
    setRecordingList(type)
  }

  const flushBufferedActions = () => {
    const currentRecordingList = recordingListRef.current
    if (!currentRecordingList || actionBuffer.current.length === 0) return

    for (const action of actionBuffer.current) {
      addAction(currentRecordingList, action)
    }
    actionBuffer.current = []
  }

  const handleRecordingInput = ({ type, data }: InputData) => {
    const currentRecordingList = recordingListRef.current

    if (!currentRecordingList) {
      toast({
        title: "Recording failed",
        description: "No active recording session.",
        variant: "destructive",
      })
      return
    }
    const id = crypto.randomUUID()
    switch (type) {
      case "keyboard":
        const { key, isPressed, isModifier } = data
        const keyName = KEYCODES.find(e => e.keyCode === key)?.value
        if (!keyName) return
        actionBuffer.current.push({
          id,
          type: "keyboard",
          key: keyName,
          state: isPressed ? "down" : "up",
        })
        break;
      case "mouse":
        const { button, isPressed: mouseIsPressed } = data
        actionBuffer.current.push({
          id,
          type: "mouse",
          button,
          state: mouseIsPressed ? "down" : "up"
        })
        break
      case "scroll":
        const { direction } = data
        actionBuffer.current.push({
          id,
          type: "mouse",
          scroll: direction,
          amount: 1
        })
        break;
      case "move":
        const { x, y } = data
        actionBuffer.current.push({
          id,
          type: "mouse",
          x, y,
          relative: true
        })
        break
      case "delay":
        const { duration } = data
        actionBuffer.current.push({
          id,
          type: "delay",
          duration
        })
        break
    }

    if (flushTimer.current) {
      clearTimeout(flushTimer.current)
    }

    flushTimer.current = setTimeout(() => {
      flushBufferedActions()
    }, DEBOUNCE_INTERVAL)
  }

  const isActionValid = () => {
    const type = newAction.type
    if (type === "keyboard" && !newAction.key) return false
    if (type === "text" && !newAction.text) return false
    if (type === "delay" && !newAction.duration) return false
    if (type === "sound" && !newAction.filePath) return false
    if (type === "process" && !newAction.filePath) return false
    return true
  }

  const handleToggleRecord = (index: number) => {
    setRecordButtonConfigs((prev) =>
      prev.map((e, idx) =>
        index === idx ? { ...e, state: !e.state } : e))
  }

  const handleRepeatDelayChange = (value: number) => {
    updateMacro({ repeatDelay: value })
  }

  const actionListConfigs = [
    {
      type: "start" as const,
      title: "Start Actions",
      description: "Executed when the macro is first triggered",
      icon: ArrowDownToLine,
      hidden: macro.type === "Command",
    },
    {
      type: "loop" as const,
      title: "Loop Actions",
      description: "Executed repeatedly while the macro is active",
      icon: RotateCcw,
      hidden: macro.type === "Command",
    },
    {
      type: "finish" as const,
      title: "Finish Actions",
      description: "Executed when the macro ends",
      icon: ArrowUpFromLine,
      hidden: false,
    },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Action Lists</h3>
          <p className="text-sm text-foreground/65">Define the sequence of actions for your macro</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {totalCount} total {totalCount === 1 ? "action" : "actions"}
        </Badge>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className={cn("grid grid-cols-1 gap-6", macro.type === "Command" ? "" : "lg:grid-cols-3")}>
          {actionListConfigs.map(({ type, title, description, icon: Icon, hidden }) => {
            if (hidden) return null

            const count = actionCounts[type]
            return (
              <div key={type} className="flex flex-col space-y-2">
                <Card className="flex-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full`}>
                        <Icon className={`h-3 w-3`} />
                      </div>
                      {title}
                      {count > 0 && <Badge className="ml-auto">{count}</Badge>}
                    </CardTitle>
                    <p className="text-xs text-foreground/65">{description}</p>
                  </CardHeader>
                  <CardContent className="flex-1 pt-0 p-4">
                    <ActionList listType={type} compact={true} />
                    {type === "loop" && (
                      <div className="pt-2 flex justify-between gap-3">
                        <Label htmlFor="repeatDelay" className="text-foreground flex items-center gap-2 text-nowrap">
                          Repeat Delay (ms)
                        </Label>
                        <div className="flex items-center">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleRepeatDelayChange(Math.max(0, macro.repeatDelay - 5))}
                            className="rounded-r-none border-r-0 border-border h-9"
                          >
                            -
                          </Button>
                          <NumberInput
                            id="repeatDelay"
                            type="number"
                            min={0}
                            value={macro.repeatDelay}
                            onChange={(e) => handleRepeatDelayChange(e || 0)}
                            className="rounded-none text-center border-border h-9"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleRepeatDelayChange(macro.repeatDelay + 5)}
                            className="rounded-l-none border-l-0 border-border h-9"
                          >
                            +
                          </Button>
                        </div>
                      </div>)}
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      </DragDropContext>
      <Card className="border-none">
        <CardContent className="rounded-lg border border-border p-4 pt-2">
          <div className="flex flex-1 gap-x-6">
            <div className="space-y-2">
              <Label htmlFor="action-type" className="text-xs">
                Type
              </Label>
              <TypeRowSelect columns={2} rows={3} id="action-type" options={[...MacroActionType]} value={newAction.type} onValueChange={handleActionTypeChange}></TypeRowSelect>
              <div className="flex w-48">
                <TooltipProvider delayDuration={300}>
                  {recordButtonConfigs.map(({ icon: Icon, tooltip, state }, index) =>
                    <Tooltip key={index}>
                      <TooltipTrigger
                        onClick={() => handleToggleRecord(index)}
                        disabled={isRecording}
                        className={cn("focus-visible:ring-ring inline-flex h-10 w-12 items-center justify-center gap-2 rounded-md border border-border bg-input px-4 py-2 text-sm font-medium whitespace-nowrap text-input-text ring-offset-background transition-colors hover:text-active focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
                          index > 0 && "rounded-l-none",
                          index < recordButtonConfigs.length - 1 && "rounded-r-none",
                          state && "text-active border-active"
                        )}>
                        <Icon />
                      </TooltipTrigger>
                      <TooltipContent>
                        {tooltip}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </TooltipProvider>
              </div>
            </div>

            <div className="flex flex-col grow space-y-3 py-1">
              <ActionInputFactory
                actionType={newAction.type}
                action={newAction}
                onChange={setNewAction}
                compact={false}
              />
            </div>
          </div>
          <Separator className="my-3" />
          <div className="flex justify-around">
            {actionListConfigs.map(({ type, title }, index) => {
              if (macro.type === "Command" && type !== "finish") return <></>
              const valid = isActionValid()

              return (
                <div key={index} className="flex">
                  <Button
                    key={type}
                    variant="default"
                    disabled={!valid}
                    className={cn("flex w-min items-center justify-center gap-1 rounded-r-none", valid && "border-active animate-magic")}
                    onClick={() => handleAddAction(type)}
                  >
                    <ArrowUpFromLine />
                    <span className="text-xs">Add to {title.split(" ")[0]}</span>
                    <ArrowUpFromLine />
                  </Button>
                  <Button className={cn("w-9 rounded-l-none border-l-0",
                    !disableRecordButtons && !isRecording && "border-active animate-magic")}
                    disabled={disableRecordButtons}
                    onClick={() => handleToggleRecordActions(type)}>
                    {type === shouldCountdown && !isRecording ?
                      <CountdownTimer from={3} className="w-9" finished={() => handleToggleRecordActions(type)} /> :
                      <Disc2 className={cn(isRecording && recordingList === type && "text-red-600 drop-shadow-[0px_0px_2px_rgb(220_38_38/var(--tw-text-opacity,1))]")} />
                    }
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
