"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { MacroAction } from "@/lib/types"
import websocketService from "@/lib/websocket-service"
import { useMacroEditor } from "@/contexts/macro-editor-context"

interface SoundActionInputProps {
  action: Omit<MacroAction, "id">
  onChange: (action: Omit<MacroAction, "id">) => void
  onKeyDown?: (e: React.KeyboardEvent) => void
}

export default function SoundActionInput({ action, onChange, onKeyDown }: SoundActionInputProps) {
  const { audioDevices } = useMacroEditor()
  const [filePath, setFilePath] = useState<string>(action.filePath || "")
  const [selectedDevice, setSelectedDevice] = useState<string>(action.audioDevice || "")
  const debounceTimeoutRef = useRef<NodeJS.Timeout>(null)

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
  useEffect(() => {
    if (!websocketService) return
    const handleFilePath = (data: { message: string, error?: string, success?: string }) => {
      if (data.error) return
      setFilePath(data.message)
      onChange({
        ...action,
        filePath: data.message,
      })
    }

    websocketService.on("filePath", handleFilePath)
    return () => {
      websocketService?.off("filePath", handleFilePath)
    }
  }, [action, onChange])

  const handleFilePathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilePath = e.target.value
    setFilePath(newFilePath)
    debouncedOnChange("filePath", newFilePath.trim())
  }

  const handleBrowseFile = () => {
    if (websocketService) {
      websocketService.send("getFilePath", { filePath, filter: "Audio Files|*.wav;*.mp3;*.ogg;*.flac;*.aac" })
    }
  }

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDevice(deviceId)
    debouncedOnChange("audioDevice", deviceId.trim())
  }

  return (
    <div className="flex flex-wrap gap-4 items-start h-[calc(100%_-_2rem)] content-center">
      <div className="flex-1 space-y-2 min-w-[220px]">
        <Label htmlFor="file-path">File Path</Label>
        <div className="flex">
          <Input
            id="file-path"
            value={filePath}
            onChange={handleFilePathChange}
            onKeyDown={onKeyDown}
            placeholder="Select an audio file..."
            className="flex-1 rounded-r-none"
          />
          <Button type="button" variant="outline" onClick={handleBrowseFile} className="shrink-0 rounded-l-none">
            Browse
          </Button>
        </div>
      </div>

      <div className="flex-1 space-y-2 min-w-[220px]">
        <Label htmlFor="audio-device">Audio Device</Label>
        <Select value={selectedDevice} onValueChange={handleDeviceChange}>
          <SelectTrigger id="audio-device">
            <SelectValue placeholder="Select audio device..." />
          </SelectTrigger>
          <SelectContent>
            {audioDevices?.map((device) => (
              <SelectItem key={device} value={device}>
                {device}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
