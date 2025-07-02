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
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

interface SoundActionInputProps {
  action: Omit<MacroAction, "id">
  onChange: (action: Omit<MacroAction, "id">) => void
  compact: boolean
}

export default function SoundActionInput({ action, onChange, compact }: SoundActionInputProps) {
  const { audioDevices } = useMacroEditor()
  const [filePath, setFilePath] = useState<string>(action.filePath || "")
  const [isSelecting, setIsSelecting] = useState<boolean>(false)
  const [selectedDevice, setSelectedDevice] = useState<string>(action.audioDevice || "")
  const [volume, setVolume] = useState<number>(action.volume || 100)
  const debounceTimeoutRef = useRef<NodeJS.Timeout>(null)

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  const debouncedOnChange = useCallback(
    (prop: string, newValue: string | boolean | number) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }

      debounceTimeoutRef.current = setTimeout(() => {
        onChange({ ...action, [prop]: newValue })
      }, 100)
    },
    [action, onChange],
  )

  const handleFilePath = (data: { message: string, error?: string, success?: string }) => {
    setIsSelecting(false)
    if (data.error) return
    setFilePath(data.message)
    onChange({
      ...action,
      filePath: data.message,
    })
  }

  useEffect(() => {
    if (!isSelecting || !websocketService) return
    websocketService.send("getFilePath", { filePath, filter: "Audio Files|*.wav;*.mp3;*.ogg;*.flac;*.aac" })
    websocketService.on("filePath", handleFilePath)
    return () => {
      websocketService?.off("filePath", handleFilePath)
    }
  }, [isSelecting])

  const handleFilePathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilePath = e.target.value
    setFilePath(newFilePath)
    debouncedOnChange("filePath", newFilePath.trim())
  }

  const handleBrowseFile = () => {
    setIsSelecting(true)
  }

  const handleDeviceChange = (deviceId: string) => {
    setSelectedDevice(deviceId)
    debouncedOnChange("audioDevice", deviceId.trim())
  }
  const handleVolumeChange = (value: number[]) => {
    const volume = value[0]
    setVolume(volume)
    debouncedOnChange("volume", volume)
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
      <div className="flex-1 space-y-2 min-w-[220px]">
        <Label htmlFor="volume">Volume: {volume}%</Label>
        <div className={cn(!compact && "pt-2.5")}>
          <Slider id="volume" min={0} max={200} step={1} value={[volume]} onValueChange={handleVolumeChange} className="flex"></Slider>
        </div>
      </div>
    </div>
  )
}
