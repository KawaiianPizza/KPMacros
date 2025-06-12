"use client"

import type React from "react"

import { useRef, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { MacroAction } from "@/contexts/macro-editor-context"
import { NumberInput } from "@/components/common/number-input"

interface DelayActionInputProps {
  action: Omit<MacroAction, "id">
  onChange: (action: Omit<MacroAction, "id">) => void
  onKeyDown?: (e: React.KeyboardEvent) => void
}

export default function DelayActionInput({ action, onChange, onKeyDown }: DelayActionInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const handleDelayChange = (duration: number) => {
    onChange({ ...action, duration })
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="delay-value">Wait Duration (ms)</Label>
      <NumberInput
        id="delay-value"
        ref={inputRef}
        type="number"
        min={0}
        value={action.duration}
        onChange={handleDelayChange}
        onKeyDown={onKeyDown}
        placeholder="Enter delay in milliseconds"
      />
    </div>
  )
}
