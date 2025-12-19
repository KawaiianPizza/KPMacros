"use client"

import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MousePointerClick,
  MousePointerIcon as MousePointerSquare,
  MoveHorizontal,
  MoveVertical,
  ArrowUpDown,
  MouseIcon as MouseMiddle,
  MousePointerClickIcon as MouseClick,
  ArrowUp,
  ArrowDown,
  CircleArrowRight,
  CircleArrowLeft,
  ArrowUpToLine,
  ArrowDownToLine,
} from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { NumberInput } from "@/components/common/number-input"
import { MacroAction, MacroActionType, MouseButtonAction, MouseMoveAction, MouseScrollAction } from "@/lib/types"
import { useWebSocketUI } from "@/hooks/use-websocketUI"

interface MouseActionInputProps {
  action: (MouseButtonAction | MouseMoveAction | MouseScrollAction) & MacroAction
  onChange: (action: MouseButtonAction | MouseMoveAction | MouseScrollAction) => void
  compact: boolean
}

export default function MouseActionInput({ action, onChange, compact }: MouseActionInputProps) {
  const { send, on, off } = useWebSocketUI()

  const getInitialTab = (): "buttons" | "move" | "scroll" => {
    if ("button" in action && "state" in action) {
      return "buttons"
    } else if ("x" in action && "y" in action) {
      return "move"
    } else if ("scroll" in action && "amount" in action) {
      return "scroll"
    }

    return "buttons"
  }

  const [currentTab, setCurrentTab] = useState<"buttons" | "move" | "scroll">(getInitialTab)
  const emptyAction = {
    id: action.id,
    type: "mouse" as typeof MacroActionType[number],
    button: undefined,
    state: undefined,
    x: undefined,
    y: undefined,
    relative: undefined,
    scroll: undefined,
    amount: undefined,
  }

  useEffect(() => {
    if (currentTab === "buttons") {
      const mouseButton = action as MouseButtonAction
      onChange({
        ...emptyAction,
        actionType: "mouseButton",
        button: mouseButton.button || "left",
        state: mouseButton.state || "click",
      } as MouseButtonAction)
    } else if (currentTab === "move") {
      const mouseMove = action as MouseMoveAction
      onChange({
        ...emptyAction,
        actionType: "mouseMove",
        relative: mouseMove.relative || false,
        x: mouseMove.x !== undefined ? mouseMove.x : 0,
        y: mouseMove.y !== undefined ? mouseMove.y : 0,
      } as MouseMoveAction)
    } else if (currentTab === "scroll") {
      const mouseScroll = action as MouseScrollAction
      onChange({
        ...emptyAction,
        actionType: "mouseScroll",
        scroll: mouseScroll.scroll || "down",
        amount: mouseScroll.amount || 1,
      } as MouseScrollAction)
    }
  }, [])

  useEffect(() => {
    const handleMouseLocationUpdate = ({ x, y, id }: { x: number, y: number, id: string }) => {
      if (action.id === id) {
        onChange({
          ...emptyAction,
          relative: (action as MouseMoveAction).relative || false,
          x,
          y,
        } as MouseMoveAction)
      }
    }
    on("previewMouseLocationUpdated", handleMouseLocationUpdate)
    return () => {
      off("previewMouseLocationUpdated", handleMouseLocationUpdate)
    }
  }, [])

  useEffect(() => {
    if (currentTab !== "move") return
    const moveAction = action as MouseMoveAction
    send("previewMouseCursor", {
      id: (action as MacroAction).id,
      relative: moveAction.relative,
      x: moveAction.x,
      y: moveAction.y,
      ...(compact && { color: "#ffff00" })
    }, true)

    return () => {
      send("stopPreviewMouseCursor", { id: action.id }, true)
    }
  }, [currentTab])

  const handleMouseActionTypeChange = (value: string) => {
    const newTab = value as "buttons" | "move" | "scroll"
    setCurrentTab(newTab)

    if (newTab === "buttons") {
      onChange({
        ...emptyAction,
        button: "left",
        state: "click",
      } as MouseButtonAction)
    } else if (newTab === "move") {
      onChange({
        ...emptyAction,
        relative: false,
        x: 0,
        y: 0,
      } as MouseMoveAction)
    } else if (newTab === "scroll") {
      onChange({
        ...emptyAction,
        scroll: "down",
        amount: 1,
      } as MouseScrollAction)
    }
  }

  const handleMouseButtonChange = (button: string) => {
    onChange({
      ...emptyAction,
      button,
      state: (action as MouseButtonAction).state || "click",
    } as MouseButtonAction)
  }

  const handleMouseStateChange = (state: string) => {
    onChange({
      ...emptyAction,
      button: (action as MouseButtonAction).button || "left",
      state,
    } as MouseButtonAction)
  }

  const handlePositionModeChange = (relative: boolean) => {
    const mouseMove = action as MouseMoveAction
    const x = !relative ? mouseMove.x !== undefined ? mouseMove.x : 0 : 0
    const y = !relative ? mouseMove.y !== undefined ? mouseMove.y : 0 : 0
    send("previewMouseCursor", {
      id: action.id,
      relative,
      x,
      y,
    }, true)
    onChange({
      ...emptyAction,
      relative,
      x,
      y,
    } as MouseMoveAction)
  }

  const handleCoordinateChange = (coord: "x" | "y", value: number) => {
    const mouseMove = action as MouseMoveAction
    send("previewMouseCursor", {
      id: action.id,
      relative: mouseMove.relative,
      x: coord === "x" ? value : mouseMove.x,
      y: coord === "y" ? value : mouseMove.y,
    }, true)
    onChange({
      ...emptyAction,
      relative: mouseMove.relative,
      x: coord === "x" ? value : mouseMove.x !== undefined ? mouseMove.x : 0,
      y: coord === "y" ? value : mouseMove.y !== undefined ? mouseMove.y : 0,
    } as MouseMoveAction)
  }

  const handleScrollChange = (scroll: string) => {
    onChange({
      ...emptyAction,
      scroll,
      amount: (action as MouseScrollAction).amount || 1,
    } as MouseScrollAction)
  }

  const handleScrollAmountChange = (amount: number) => {
    onChange({
      ...emptyAction,
      scroll: (action as MouseScrollAction).scroll || "down",
      amount: amount || 1,
    } as MouseScrollAction)
  }

  return (
    <div className="space-y-1">
      <Label>Mouse Action</Label>
      <div className="space-y-3">
        <Tabs value={currentTab} onValueChange={handleMouseActionTypeChange} className="w-full bg-transparent">
          <TabsList className="grid h-auto w-full grid-cols-3 bg-transparent p-0">
            <TabsTrigger value="buttons" className="flex items-center gap-1">
              <MousePointerClick className="h-4 w-4" />
              <span>Buttons</span>
            </TabsTrigger>
            <TabsTrigger value="move" className="flex items-center gap-1">
              <MousePointerSquare className="h-4 w-4" />
              <span>Move</span>
            </TabsTrigger>
            <TabsTrigger value="scroll" className="flex items-center gap-1">
              <ArrowUpDown className="h-4 w-4" />
              <span>Scroll</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {currentTab === "buttons" && (
          <div className="space-y-3">
            <div className="flex flex-wrap shrink gap-3">
              <div className="min-w-72 flex-1 justify-items-center space-y-1">
                <Label className="text-xs mb-1 block">Button</Label>
                <ToggleGroup
                  type="single"
                  value={(action as MouseButtonAction).button || "left"}
                  onValueChange={handleMouseButtonChange}
                  className="justify-start w-min rounded-md"
                >
                  <ToggleGroupItem value="left" aria-label="Left Button" title="Left Button">
                    <CircleArrowLeft className="h-4 w-4 mr-1" />
                    <span>Left</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="middle" aria-label="Middle Button" title="Middle Button">
                    <MouseMiddle className="h-4 w-4 mr-1" />
                    <span>Middle</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="right" aria-label="Right Button" title="Right Button">
                    <CircleArrowRight className="h-4 w-4 mr-1" />
                    <span>Right</span>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="min-w-72 flex-1 justify-items-center space-y-1">
                <Label className="text-xs mb-1 block">State</Label>
                <ToggleGroup
                  type="single"
                  value={(action as MouseButtonAction).state || "click"}
                  onValueChange={handleMouseStateChange}
                  className="justify-start w-min rounded-md"
                >
                  <ToggleGroupItem value="down" aria-label="Mouse Down" title="Mouse Down">
                    <ArrowDownToLine className="h-4 w-4 mr-1" />
                    <span>Down</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="click" aria-label="Mouse Click" title="Mouse Click">
                    <MouseClick className="h-4 w-4 mr-1" />
                    <span>Click</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="up" aria-label="Mouse Up" title="Mouse Up">
                    <ArrowUpToLine className="h-4 w-4 mr-1" />
                    <span>Up</span>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </div>
        )}

        {currentTab === "move" && (
          <div className="flex flex-wrap gap-2">

            <div className="space-y-1 min-w-20 flex-1">
              <div className="flex items-center">
                <MoveHorizontal className="h-3.5 w-3.5 mr-1" />
                <Label className="text-xs">X {!!(action as MouseMoveAction).relative ? "offset" : "position"}</Label>
              </div>
              <NumberInput
                type="number"
                value={(action as MouseMoveAction).x || 0}
                onChange={(e) => handleCoordinateChange("x", e || 0)}
              />
            </div>
            <div className="space-y-1 min-w-20 flex-1">
              <div className="flex items-center">
                <MoveVertical className="h-3.5 w-3.5 mr-1" />
                <Label className="text-xs">Y {!!(action as MouseMoveAction).relative ? "offset" : "position"}</Label>
              </div>
              <NumberInput
                type="number"
                value={(action as MouseMoveAction).y || 0}
                onChange={(e) => handleCoordinateChange("y", e || 0)}
              />
            </div>
            <div className="flex flex-col items-center space-y-1.5 min-w-20">
              <Label htmlFor="relative-position" className="text-xs">
                Position: {!!(action as MouseMoveAction).relative ? "Relative" : "Absolute"}
              </Label>
              <div className="flex items-center h-10">
                <Switch id="relative-position" checked={!!(action as MouseMoveAction).relative} onCheckedChange={handlePositionModeChange} />
              </div>
            </div>
          </div>
        )}

        {currentTab === "scroll" && (
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1 min-w-[180]">
              <Label className="text-xs">Direction</Label>
              <ToggleGroup
                type="single"
                value={(action as MouseScrollAction).scroll || "down"}
                onValueChange={handleScrollChange}
                className="justify-start w-min rounded-md"
              >
                <ToggleGroupItem value="up" aria-label="Scroll Up" title="Scroll Up">
                  <ArrowUp className="h-4 w-4 mr-1" />
                  <span>Up</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="down" aria-label="Scroll Down" title="Scroll Down">
                  <ArrowDown className="h-4 w-4 mr-1" />
                  <span>Down</span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
            <div className="space-y-1 flex-1 min-w-20">
              <Label className="text-xs">Amount (clicks)</Label>
              <NumberInput
                type="number"
                min={1}
                value={(action as MouseScrollAction).amount || 1}
                onChange={(e) => handleScrollAmountChange(e)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
