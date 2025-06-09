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
import { ArrowUp, Play, RotateCcw, Square, Plus } from "lucide-react"
import type { MacroAction } from "@/contexts/macro-editor-context"
import ActionInputFactory from "@/components/macro-editor/action-inputs/action-input-factory"
import { cn } from "@/lib/utils"

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
      keyboard: { type: "keyboard" },
      mouse: { type: "mouse", button: "left", state: "click" },
      text: { type: value },
      delay: { type: value },
    }
    setNewAction(actionMap[value as keyof typeof actionMap] || { type: value })
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
      // Special handling for keyboard "press" - add both down and up actions
      if (getCurrentActionType() === "keyboard" && newAction.state === "press") {
        // Add down action first
        addAction(listType, {
          ...newAction,
          state: "down",
        })
        // Add up action second
        addAction(listType, {
          ...newAction,
          state: "up",
        })
      } else {
        // Normal single action
        addAction(listType, newAction)
      }
    })
  }

  const isActionValid = () => {
    const type = getCurrentActionType()
    if (type === "keyboard" && !newAction.key) return false
    if (type === "text" && !newAction.text) return false
    if (type === "delay" && !newAction.duration) return false
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
      icon: Play,
      color: "green",
      hidden: macro.type === "Command",
    },
    {
      type: "loop" as const,
      title: "Loop Actions",
      description: "Executed repeatedly while the macro is active",
      icon: RotateCcw,
      color: "blue",
      hidden: macro.type === "Command",
    },
    {
      type: "finish" as const,
      title: "Finish Actions",
      description: "Executed when the macro ends",
      icon: Square,
      color: "orange",
      hidden: false,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Action Lists</h3>
          <p className="text-sm text-muted-foreground">Define the sequence of actions for your macro</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {totalCount} total {totalCount === 1 ? "action" : "actions"}
        </Badge>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className={cn("grid grid-cols-1 gap-6", macro.type === "Command" ? "" : "lg:grid-cols-3")}>
          {actionListConfigs.map(({ type, title, description, icon: Icon, color, hidden }) => {
            if (hidden) return null

            const count = actionCounts[type]
            const isSelected = selectedLists.includes(type)

            return (
              <div key={type} className="flex flex-col space-y-2">
                <Card className="flex-1">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <div
                        className={`flex items-center justify-center w-6 h-6 rounded-full bg-${color}-100 dark:bg-${color}-900/30`}
                      >
                        <Icon className={`h-3 w-3 text-${color}-600 dark:text-${color}-400`} />
                      </div>
                      {title}
                      {count > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                          {count}
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </CardHeader>
                  <CardContent className="flex-1 pt-0">
                    <ActionList listType={type} compact={true} />
                  </CardContent>
                </Card>
                <Button
                  variant={isSelected ? "default" : "outline"}
                  className="w-full flex items-center justify-center gap-1 h-10"
                  onClick={() => handleListSelect(type)}
                >
                  <ArrowUp className="h-4 w-4" />
                  <span>Add to {title.split(" ")[0]}</span>
                </Button>
              </div>
            )
          })}
        </div>
      </DragDropContext>
      <p className="text-xs text-muted-foreground !mt-2">
        <span className="font-medium">Multi-select mode:</span> Hold Ctrl and click to select multiple lists
      </p>
      <Card className="border border-primary/20 mt-6">
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
        <CardContent className="px-4 pb-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="action-type" className="text-xs">
                Type
              </Label>
              <Select value={getCurrentActionType()} onValueChange={handleActionTypeChange}>
                <SelectTrigger id="action-type" className="h-9">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="keyboard">Keyboard</SelectItem>
                  <SelectItem value="mouse">Mouse</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="delay">Wait</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <ActionInputFactory
                actionType={getCurrentActionType()}
                action={newAction}
                onChange={setNewAction}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {selectedLists.length === 0 ? (
                <span>Select a list above to add this action</span>
              ) : (
                <span>
                  Adding to:{" "}
                  {selectedLists.map((list, i) => (
                    <span key={list} className="font-medium capitalize">
                      {list}
                      {i < selectedLists.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </span>
              )}
            </div>
            <Button onClick={handleAddAction} disabled={!isActionValid() || selectedLists.length === 0} className="h-9">
              <Plus className="h-4 w-4 mr-1" />
              Add Action
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
