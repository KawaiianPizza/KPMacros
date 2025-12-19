"use client"

import KeyboardActionInput from "./keyboard-action-input"
import MouseActionInput from "./mouse-action-input"
import TextActionInput from "./text-action-input"
import DelayActionInput from "./delay-action-input"
import { DelayAction, KeyboardAction, MacroAction, MouseButtonAction, MouseMoveAction, MouseScrollAction, ProcessAction, SoundAction, TextAction } from "@/lib/types"
import SoundActionInput from "./sound-action-input"
import ProcessActionInput from "./process-action-input"

interface ActionInputFactoryProps {
  actionType: string
  action: MacroAction
  onChange: (action: MacroAction) => void
  compact: boolean
}

export default function ActionInputFactory({ actionType, action, onChange, compact }: ActionInputFactoryProps) {
  switch (actionType) {
    case "keyboard":
      return <KeyboardActionInput action={(action as KeyboardAction & MacroAction)} onChange={(onChange as (action: KeyboardAction) => void)} compact={compact} />
    case "mouse":
      return <MouseActionInput action={(action as (MouseButtonAction | MouseMoveAction | MouseScrollAction) & MacroAction)} onChange={onChange as (action: MouseButtonAction | MouseMoveAction | MouseScrollAction) => void} compact={compact} />
    case "text":
      return <TextActionInput action={(action as TextAction & MacroAction)} onChange={(onChange as (action: TextAction) => void)} compact={compact} />
    case "delay":
      return <DelayActionInput action={(action as DelayAction & MacroAction)} onChange={(onChange as (action: DelayAction) => void)} compact={compact} />
    case "sound":
      return <SoundActionInput action={(action as SoundAction & MacroAction)} onChange={(onChange as (action: SoundAction) => void)} compact={compact} />
    case "process":
      return <ProcessActionInput action={(action as ProcessAction & MacroAction)} onChange={(onChange as (action: ProcessAction) => void)} compact={compact} />
    default:
      return <div>Unknown action type: {actionType}</div>
  }
}
