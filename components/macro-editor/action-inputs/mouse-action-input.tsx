"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MousePointerClick,
  MousePointerIcon as MousePointerSquare,
  MoveHorizontal,
  MoveVertical,
  ArrowUpDown,
  MoveLeftIcon as MouseLeft,
  MouseIcon as MouseMiddle,
  MousePointerClickIcon as MouseRight,
  MoveDownIcon as MouseDown,
  MousePointerClickIcon as MouseClick,
  MouseIcon as MouseUp,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import type { MacroAction } from "@/contexts/macro-editor-context"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { NumberInput } from "@/components/common/number-input"

interface MouseActionInputProps {
  action: Omit<MacroAction, "id">
  onChange: (action: Omit<MacroAction, "id">) => void
  onKeyDown?: (e: React.KeyboardEvent) => void
}

export default function MouseActionInput({ action, onChange, onKeyDown }: MouseActionInputProps) {
  const getInitialTab = (): "buttons" | "move" | "scroll" => {
    if (action.button && action.state) {
      return "buttons"
    } else if (action.x !== undefined || action.y !== undefined) {
      return "move"
    } else if (action.scroll || action.amount) {
      return "scroll"
    }

    return "buttons"
  }

  const [currentTab, setCurrentTab] = useState<"buttons" | "move" | "scroll">(getInitialTab)
  const emptyAction = {
    type: "mouse",
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
      onChange({
        ...emptyAction,
        actionType: "mouseButton",
        button: action.button || "left",
        state: action.state || "click",
      })
    } else if (currentTab === "move") {
      onChange({
        ...emptyAction,
        actionType: "mouseMove",
        relative: action.relative || false,
        x: action.x !== undefined ? action.x : 0,
        y: action.y !== undefined ? action.y : 0,
      })
    } else if (currentTab === "scroll") {
      onChange({
        ...emptyAction,
        actionType: "mouseScroll",
        scroll: action.scroll || "down",
        amount: action.amount || 1,
      })
    }
  }, [])

  const handleMouseActionTypeChange = (value: string) => {
    const newTab = value as "buttons" | "move" | "scroll"
    setCurrentTab(newTab)

    if (newTab === "buttons") {
      onChange({
        ...emptyAction,
        button: "left",
        state: "click",
      })
    } else if (newTab === "move") {
      onChange({
        ...emptyAction,
        relative: false,
        x: 0,
        y: 0,
      })
    } else if (newTab === "scroll") {
      onChange({
        ...emptyAction,
        scroll: "down",
        amount: 1,
      })
    }
  }

  const handleMouseButtonChange = (button: string) => {
    onChange({
      ...emptyAction,
      button,
      state: action.state || "click",
    })
  }

  const handleMouseStateChange = (state: string) => {
    onChange({
      ...emptyAction,
      button: action.button || "left",
      state,
    })
  }

  const handlePositionModeChange = (relative: boolean) => {
    onChange({
      ...emptyAction,
      relative,
      x: action.x !== undefined ? action.x : 0,
      y: action.y !== undefined ? action.y : 0,
    })
  }

  const handleCoordinateChange = (coord: "x" | "y", value: number) => {
    onChange({
      ...emptyAction,
      relative: !!action.relative,
      x: coord === "x" ? value : action.x !== undefined ? action.x : 0,
      y: coord === "y" ? value : action.y !== undefined ? action.y : 0,
    })
  }

  const handleScrollChange = (scroll: string) => {
    onChange({
      ...emptyAction,
      button: undefined,
      state: undefined,
      scroll,
      amount: action.amount || 1,
    })
  }

  const handleScrollAmountChange = (amount: number) => {
    onChange({
      ...emptyAction,
      scroll: action.scroll || "down",
      amount: amount || 1,
    })
  }

  return (
    <div className="space-y-2">
      <Label>Mouse Action</Label>
      <div className="space-y-4">
        <Tabs value={currentTab} onValueChange={handleMouseActionTypeChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="buttons" className="flex items-center gap-1">
              <MousePointerClick className="h-3.5 w-3.5" />
              <span>Buttons</span>
            </TabsTrigger>
            <TabsTrigger value="move" className="flex items-center gap-1">
              <MousePointerSquare className="h-3.5 w-3.5" />
              <span>Move</span>
            </TabsTrigger>
            <TabsTrigger value="scroll" className="flex items-center gap-1">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span>Scroll</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {currentTab === "buttons" && (
          <div className="pt-2 space-y-3">
            <div className="flex flex-wrap gap-4">
              <div className="space-y-1 flex-1 min-w-[200px]">
                <Label className="text-xs mb-1 block">Button</Label>
                <ToggleGroup
                  type="single"
                  value={action.button || "left"}
                  onValueChange={handleMouseButtonChange}
                  className="justify-start w-min rounded-md"
                >
                  <ToggleGroupItem value="left" aria-label="Left Button" title="Left Button">
                    <MouseLeft className="h-4 w-4 mr-1" />
                    <span>Left</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="middle" aria-label="Middle Button" title="Middle Button">
                    <MouseMiddle className="h-4 w-4 mr-1" />
                    <span>Middle</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="right" aria-label="Right Button" title="Right Button">
                    <MouseRight className="h-4 w-4 mr-1" />
                    <span>Right</span>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="space-y-1 flex-1 min-w-[200px]">
                <Label className="text-xs mb-1 block">State</Label>
                <ToggleGroup
                  type="single"
                  value={action.state || "click"}
                  onValueChange={handleMouseStateChange}
                  className="justify-start w-min rounded-md"
                >
                  <ToggleGroupItem value="down" aria-label="Mouse Down" title="Mouse Down">
                    <MouseDown className="h-4 w-4 mr-1" />
                    <span>Down</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="click" aria-label="Mouse Click" title="Mouse Click">
                    <MouseClick className="h-4 w-4 mr-1" />
                    <span>Click</span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="up" aria-label="Mouse Up" title="Mouse Up">
                    <MouseUp className="h-4 w-4 mr-1" />
                    <span>Up</span>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
          </div>
        )}

        {currentTab === "move" && (
          <div className="pt-2 space-y-3 flex flex-wrap  gap-4">
            <div className="flex flex-col-reverse items-center space-x-2 min-w-[200px]">
              <Switch id="relative-position" checked={!!action.relative} onCheckedChange={handlePositionModeChange} />
              <Label htmlFor="relative-position" className="text-xs">
                {!!action.relative ? "Relative to current" : "Absolute"} position
              </Label>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="space-y-1 min-w-[200px]">
                <div className="flex items-center">
                  <MoveHorizontal className="h-3.5 w-3.5 mr-1" />
                  <Label className="text-xs">X {action.relative ? "offset" : "position"}</Label>
                </div>
                <NumberInput
                  type="number"
                  value={action.x || 0}
                  onChange={(e) => handleCoordinateChange("x", e || 0)}
                  onKeyDown={onKeyDown}
                  className="h-8"
                />
              </div>
              <div className="space-y-1 min-w-[200px]">
                <div className="flex items-center">
                  <MoveVertical className="h-3.5 w-3.5 mr-1" />
                  <Label className="text-xs">Y {action.relative ? "offset" : "position"}</Label>
                </div>
                <NumberInput
                  type="number"
                  value={action.y || 0}
                  onChange={(e) => handleCoordinateChange("y", e || 0)}
                  onKeyDown={onKeyDown}
                  className="h-8"
                />
              </div>
            </div>
          </div>
        )}

        {currentTab === "scroll" && (
            <div className="flex flex-wrap gap-4">
              <div className="space-y-1 min-w-[200px]">
              <Label className="text-xs">Direction</Label>
              <ToggleGroup
                type="single"
                value={action.scroll || "down"}
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
            <div className="space-y-1 flex-1 min-w-[200px]">
              <Label className="text-xs">Amount (clicks)</Label>
              <NumberInput
                type="number"
                min={1}
                value={action.amount || 1}
                onChange={(e) => handleScrollAmountChange(e)}
                onKeyDown={onKeyDown}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
