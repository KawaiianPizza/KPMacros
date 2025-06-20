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
  action: Omit<MacroAction, "id">
  onChange: (action: Omit<MacroAction, "id">) => void
  onKeyDown?: (e: React.KeyboardEvent) => void
}

export default function ActionInputFactory({ actionType, action, onChange, onKeyDown }: ActionInputFactoryProps) {
  switch (actionType) {
    case "keyboard":
      return <KeyboardActionInput action={action} onChange={onChange} onKeyDown={onKeyDown} />
    case "mouse":
      return <MouseActionInput action={action} onChange={onChange} onKeyDown={onKeyDown} />
    case "text":
      return <TextActionInput action={action} onChange={onChange} onKeyDown={onKeyDown} />
    case "delay":
      return <DelayActionInput action={action} onChange={onChange} onKeyDown={onKeyDown} />
    case "sound":
      return <SoundActionInput action={action} onChange={onChange} onKeyDown={onKeyDown} />
    case "process":
      return <ProcessActionInput action={action} onChange={onChange} onKeyDown={onKeyDown} />
    default:
      return <div>Unknown action type: {actionType}</div>
  }
}
