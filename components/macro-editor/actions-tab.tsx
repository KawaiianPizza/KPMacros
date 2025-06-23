"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useMacroEditor } from "@/contexts/macro-editor-context"
import { DragDropContext, type DropResult } from "@hello-pangea/dnd"
import ActionList from "@/components/macro-editor/action-list"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RotateCcw, Plus, ArrowUpFromLine, ArrowDownToLine } from "lucide-react"
import ActionInputFactory from "@/components/macro-editor/action-inputs/action-input-factory"
import { cn } from "@/lib/utils"
import type { MacroAction } from "@/lib/types"
import { MacroActionType } from "@/lib/types"
import websocketService from "@/lib/websocket-service"
import TypeRowSelect from "../common/type-row-select"


export default function ActionsTab() {
  const { macro, addAction, moveActionBetweenLists } = useMacroEditor()
  const [selectedLists, setSelectedLists] = useState<("start" | "loop" | "finish")[]>([
    macro.type === "Hotkey" ? "start" : "finish",
  ])
  const [newAction, setNewAction] = useState<Omit<MacroAction, "id">>({
    type: "keyboard",
  })
  const [isCtrlPressed, setIsCtrlPressed] = useState(false)

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
      sound: {},
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

  const handleListSelect = (listType: "start" | "loop" | "finish") => {
    setSelectedLists((prev) => {
      if (isCtrlPressed) {
        return prev.includes(listType) ? prev.filter((item) => item !== listType) : [...prev, listType]
      }
      return [listType]
    })
  }

  const handleAddAction = () => {
    if (selectedLists.length === 0 || !isActionValid()) return

    selectedLists.forEach((listType) => {
      if (getCurrentActionType() === "keyboard" && newAction.state === "press") {
        addAction(listType, {
          ...newAction,
          state: "down",
        })
        addAction(listType, {
          ...newAction,
          state: "up",
        })
      } else {
        addAction(listType, newAction)
      }
    })
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Control") setIsCtrlPressed(true)
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Control") setIsCtrlPressed(false)
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && isActionValid() && selectedLists.length > 0) {
      e.preventDefault()
      handleAddAction()
    }
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
                  <CardContent className="flex-1 pt-0">
                    <ActionList listType={type} compact={true} />
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      </DragDropContext>
      <Card className="border-none mt-6">
        <CardHeader className="py-3 px-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium">Add Action</CardTitle>
            <Badge variant="outline" className="text-xs">
              {selectedLists.length === 0
                ? "Select a list"
                : `Adding to ${selectedLists.length} ${selectedLists.length === 1 ? "list" : "lists"}`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-4 py-0">
          <div className="flex flex-1 gap-x-6">
            <div className="space-y-2">
              <Label htmlFor="action-type" className="text-xs">
                Type
              </Label>
              <TypeRowSelect columns={2} rows={3} id="action-type" options={[...MacroActionType]} value={getCurrentActionType()} onValueChange={handleActionTypeChange}></TypeRowSelect>
            </div>

            <div className="space-y-2 flex-grow border border-border rounded-lg px-3 py-1">
              <ActionInputFactory
                actionType={getCurrentActionType()}
                action={newAction}
                onChange={setNewAction}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="flex items-center justify-end gap-x-6 flex-shrink">
              <div className="text-center border border-border rounded-lg px-3 gap-x-3 pb-3">
                <Button
                  onClick={handleAddAction}
                  disabled={!isActionValid() || selectedLists.length === 0}
                  className={cn("mt-2", isActionValid() && selectedLists.length >= 0 && "border-accent")}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Action
                </Button>
                <div className="text-sm text-foreground/65 flex">
                  <div className="place-items-end flex flex-col gap-y-2 items-center">
                    <p className="text-xs text-foreground/35 pt-3 text-center">
                      <span className="font-medium block">Multi-select mode: </span>
                      Hold Ctrl and click to select multiple lists
                    </p>
                    <div className="flex">
                      {actionListConfigs.map(({ type, title, icon: Icon }) => {
                        const isSelected = selectedLists.includes(type)
                        return (
                          <Button
                            key={type}
                            variant={isSelected ? "default" : "outline"}
                            className={cn(
                              "w-min flex items-center justify-center gap-1 rounded-none first:rounded-l-md last:rounded-r-md",
                              isSelected && "border border-accent text-accent",
                            )}
                            onClick={() => handleListSelect(type)}
                          >
                            <Icon className="h-3 w-3" />
                            <span className="text-xs">{title.split(" ")[0]}</span>
                          </Button>
                        )
                      })}
                    </div>
                    {selectedLists.length === 0 ? (
                      <span>Select a list above to add this action</span>
                    ) : (
                      <span>
                        Adding to:{" "}
                        {selectedLists.map((list, i) => (
                          <>
                            <span key={list} className="font-medium text-accent">
                              {list.replace(/^./, (char) => char.toUpperCase())}
                            </span>
                            {i < selectedLists.length - 1 ? ", " : ""}
                          </>
                        ))}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}
