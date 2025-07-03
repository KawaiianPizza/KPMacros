"use client"

import type React from "react"
import { useState } from "react"
import { useMacroEditor } from "@/contexts/macro-editor-context"
import { DragDropContext, type DropResult } from "@hello-pangea/dnd"
import ActionList from "@/components/macro-editor/action-list"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RotateCcw, Plus, ArrowUpFromLine, ArrowDownToLine } from "lucide-react"
import ActionInputFactory from "@/components/macro-editor/action-inputs/action-input-factory"
import { cn } from "@/lib/utils"
import type { MacroAction } from "@/lib/types"
import { MacroActionType } from "@/lib/types"
import TypeRowSelect from "../common/type-row-select"


export default function ActionsTab() {
  const { macro, addAction, moveActionBetweenLists } = useMacroEditor()
  const [newAction, setNewAction] = useState<Omit<MacroAction, "id">>({
    type: "keyboard",
  })

  const actionCounts = {
    start: macro.start.length,
    loop: macro.loop.length,
    finish: macro.finish.length,
  }
  const totalCount = Object.values(actionCounts).reduce((sum, count) => sum + count, 0)

  const getCurrentActionType = () => {
    if (["keydown", "keypress", "keyup"].includes(newAction.type)) return "keyboard"
    if (["mouse", "mousemove", "mousescroll"].includes(newAction.type)) return "mouse"
    return newAction.type
  }

  const handleActionTypeChange = (value: string) => {
    const actionMap = {
      keyboard: { state: "press" },
      mouse: { button: "left", state: "click" },
      text: { text: "" },
      delay: { duration: 25 },
      sound: { volume: 100 },
      process: {},
    }
    setNewAction({ type: value, ...actionMap[value as keyof typeof actionMap] })
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const sourceListType = result.source.droppableId.replace("-actions", "") as "start" | "loop" | "finish"
    const destinationListType = result.destination.droppableId.replace("-actions", "") as "start" | "loop" | "finish"

    moveActionBetweenLists(sourceListType, destinationListType, result.source.index, result.destination.index)
  }

  const handleAddAction = (type: "start" | "loop" | "finish") => {

    if (getCurrentActionType() === "keyboard" && newAction.state === "press") {
      addAction(type, {
        ...newAction,
        state: "down",
      })
      addAction(type, {
        ...newAction,
        state: "up",
      })
    } else {
      addAction(type, newAction)
    }
  }

  const isActionValid = () => {
    const type = getCurrentActionType()
    if (type === "keyboard" && !newAction.key) return false
    if (type === "text" && !newAction.text) return false
    if (type === "delay" && !newAction.duration) return false
    if (type === "sound" && !newAction.filePath) return false
    if (type === "process" && !newAction.filePath) return false
    return true
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
    <div className="space-y-6">
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
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      </DragDropContext>
      <Card className="border-none mt-6">
        <CardContent className="rounded-lg border border-border p-4 pt-2">
          <div className="flex flex-1 gap-x-6">
            <div className="space-y-2">
              <Label htmlFor="action-type" className="text-xs">
                Type
              </Label>
              <TypeRowSelect columns={2} rows={3} id="action-type" options={[...MacroActionType]} value={getCurrentActionType()} onValueChange={handleActionTypeChange}></TypeRowSelect>
            </div>

            <div className="flex flex-col flex-grow space-y-3 py-1">
              <ActionInputFactory
                actionType={getCurrentActionType()}
                action={newAction}
                onChange={setNewAction}
                compact={false}
              />
              <div className="flex border-t border-border pt-3 justify-center">
                {actionListConfigs.map(({ type, title, icon: Icon }) => {
                  if (macro.type === "Command" && type !== "finish") return <></>
                  const valid = isActionValid()
                  return (
                    <Button
                      key={type}
                      variant="default"
                      disabled={!valid}
                      className={cn("flex w-min items-center justify-center gap-1 rounded-none first:rounded-l-md last:rounded-r-md", valid && "border-active animate-magic")}
                      onClick={() => handleAddAction(type)}
                    >
                      <Icon className="h-3 w-3" />
                      <span className="text-xs">Add to {title.split(" ")[0]}</span>
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
