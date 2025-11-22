"use client"

import type React from "react"

import { useRef, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { NumberInput } from "@/components/common/number-input"
import { DelayAction } from "@/lib/types"

interface DelayActionInputProps {
  action: DelayAction
  onChange: (action: DelayAction) => void
  compact: boolean
}

export default function DelayActionInput({ action, onChange }: DelayActionInputProps) {
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
    <div className="space-y-2 content-center">
      <Label htmlFor="delay-value">Wait Duration (ms)</Label>
      <NumberInput
        id="delay-value"
        ref={inputRef}
        type="number"
        min={0}
        value={action.duration}
        onChange={handleDelayChange}
        placeholder="Enter delay in milliseconds"
      />
    </div>
  )
}
