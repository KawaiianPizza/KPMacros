"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { MacroAction, ProcessAction } from "@/lib/types"
import { Switch } from "@/components/ui/switch"
import { useWebSocketUI } from "@/hooks/use-websocketUI"

interface ProcessActionInputProps {
  action: ProcessAction & MacroAction
  onChange: (action: ProcessAction) => void
  compact: boolean
}

export default function ProcessActionInput({ action, onChange, compact }: ProcessActionInputProps) {
  const { once } = useWebSocketUI()

  const inputRef = useRef<HTMLInputElement>(null)
  const [filePath, setFilePath] = useState<string>(action.filePath || "")
  const [isSelecting, setIsSelecting] = useState<boolean>(false)
  const [_arguments, setArguments] = useState<string>(action.arguments || "")
  const debounceTimeoutRef = useRef<NodeJS.Timeout>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  const debouncedOnChange = useCallback(
    (prop: string, newValue: string | boolean) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }

      debounceTimeoutRef.current = setTimeout(() => {
        onChange({ ...action, [prop]: newValue })
      }, 100)
    },
    [action, onChange],
  )

  const handleFilePath = (data: { message: string; error?: string; success?: string }) => {
    setIsSelecting(false)
    if (data.error) return
    setFilePath(data.message)
    onChange({
      ...action,
      filePath: data.message,
    })
  }

  useEffect(() => {
    if (!isSelecting) return
    once("getFilePath", { filePath }, handleFilePath)
  }, [isSelecting])

  const handleFilePathChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const newFilePath = e.target.value
    setFilePath(newFilePath)
    debouncedOnChange("filePath", newFilePath.trim())
  }

  const handleBrowseFile = () => {
    setIsSelecting(true)
  }

  const handleArgumentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setArguments(newValue)
    debouncedOnChange("arguments", newValue.trim())
  }

  const handleHiddenChange = (hidden: boolean) => {
    debouncedOnChange("hidden", hidden)
  }

  return (
    <div className="flex flex-wrap gap-4 items-start content-center">
      <div className="flex-1 space-y-2 min-w-[220px]">
        <Label htmlFor="file-path">Process path</Label>
        <div className="flex">
          <Input
            id="file-path"
            ref={inputRef}
            value={filePath}
            onChange={handleFilePathChange}
            placeholder="Process path..."
            className="flex-1 rounded-r-none min-w-0"
          />
          <Button type="button" variant="outline" onClick={handleBrowseFile} className="shrink-0 rounded-l-none">
            Browse
          </Button>
        </div>
      </div>

      <div className="flex-1 space-y-2 min-w-[140px]">
        <Label htmlFor="arguments">Arguments</Label>
        <Input
          id="arguments"
          value={_arguments}
          onChange={handleArgumentsChange}
          placeholder="Arguments..."
          className="w-full"
        />
      </div>

      <div className="space-y-2 min-w-[80px]">
        <Label htmlFor="hidden">Hidden</Label>
        <div className="flex items-center h-10">
          <Switch id="hidden" checked={action.hidden} onCheckedChange={handleHiddenChange} />
        </div>
      </div>
    </div>
  )
}
