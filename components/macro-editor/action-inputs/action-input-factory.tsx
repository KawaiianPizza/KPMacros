"use client"

import type React from "react"

import KeyboardActionInput from "./keyboard-action-input"
import MouseActionInput from "./mouse-action-input"
import TextActionInput from "./text-action-input"
import DelayActionInput from "./delay-action-input"
import { MacroAction } from "@/lib/types"
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
      return <KeyboardActionInput action={action} onChange={onChange} compact={compact} />
    case "mouse":
      return <MouseActionInput action={action} onChange={onChange} compact={compact} />
    case "text":
      return <TextActionInput action={action} onChange={onChange} compact={compact} />
    case "delay":
      return <DelayActionInput action={action} onChange={onChange} compact={compact} />
    case "sound":
      return <SoundActionInput action={action} onChange={onChange} compact={compact} />
    case "process":
      return <ProcessActionInput action={action} onChange={onChange} compact={compact} />
    default:
      return <div>Unknown action type: {actionType}</div>
  }
}
