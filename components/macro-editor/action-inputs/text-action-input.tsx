"use client"

import type React from "react"
import { useRef, useEffect, useCallback, useMemo, useState } from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Copy, RotateCcw, Type } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { MacroAction } from "@/lib/types"

interface TextActionInputProps {
  action: Omit<MacroAction, "id">
  onChange: (action: Omit<MacroAction, "id">) => void
  onKeyDown?: (e: React.KeyboardEvent) => void
}

export default function TextActionInput({ action, onChange, onKeyDown }: TextActionInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [localValue, setLocalValue] = useState(action.text || "")
  const debounceTimeoutRef = useRef<NodeJS.Timeout>(null)

  useEffect(() => {
    if (action.text !== localValue && document.activeElement !== textareaRef.current) {
      setLocalValue(action.text || "")
    }
  }, [action.text, localValue])

  const lineNumbers = useMemo(() => {
    const lines = localValue.split("\n")
    return Array.from({ length: Math.max(1, lines.length) }, (_, i) => i + 1)
  }, [localValue])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  const getLineInfo = useCallback((text: string, position: number) => {
    const lines = text.split("\n")
    let currentPos = 0

    for (let i = 0; i < lines.length; i++) {
      const lineEnd = currentPos + lines[i].length
      if (position <= lineEnd) {
        return {
          lineIndex: i,
          lineStart: currentPos,
          lineEnd: lineEnd,
          lineText: lines[i],
          column: position - currentPos,
        }
      }
      currentPos = lineEnd + 1
    }

    return {
      lineIndex: lines.length - 1,
      lineStart: currentPos - lines[lines.length - 1].length - 1,
      lineEnd: currentPos - 1,
      lineText: lines[lines.length - 1] || "",
      column: 0,
    }
  }, [])

  const debouncedOnChange = useCallback(
    (newValue: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }

      debounceTimeoutRef.current = setTimeout(() => {
        onChange({ ...action, text: newValue })
      }, 100)
    },
    [action, onChange],
  )

  const moveLinesUp = useCallback(() => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const text = textarea.value
    const selectionStart = textarea.selectionStart
    const selectionEnd = textarea.selectionEnd

    const startLineInfo = getLineInfo(text, selectionStart)
    const endLineInfo = getLineInfo(text, selectionEnd)

    if (startLineInfo.lineIndex === 0) return

    const lines = text.split("\n")
    const selectedLines = lines.slice(startLineInfo.lineIndex, endLineInfo.lineIndex + 1)
    const lineAbove = lines[startLineInfo.lineIndex - 1]

    const newLines = [
      ...lines.slice(0, startLineInfo.lineIndex - 1),
      ...selectedLines,
      lineAbove,
      ...lines.slice(endLineInfo.lineIndex + 1),
    ]

    const newText = newLines.join("\n")

    setLocalValue(newText)
    onChange({ ...action, value: newText })

    requestAnimationFrame(() => {
      if (textareaRef.current) {
        const newStartPos = startLineInfo.lineStart - lineAbove.length - 1
        const newEndPos = newStartPos + (selectionEnd - selectionStart)
        textareaRef.current.setSelectionRange(newStartPos, newEndPos)
      }
    })
  }, [action, onChange, getLineInfo])

  const moveLinesDown = useCallback(() => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const text = textarea.value
    const selectionStart = textarea.selectionStart
    const selectionEnd = textarea.selectionEnd

    const startLineInfo = getLineInfo(text, selectionStart)
    const endLineInfo = getLineInfo(text, selectionEnd)

    const lines = text.split("\n")

    if (endLineInfo.lineIndex === lines.length - 1) return

    const selectedLines = lines.slice(startLineInfo.lineIndex, endLineInfo.lineIndex + 1)
    const lineBelow = lines[endLineInfo.lineIndex + 1]

    const newLines = [
      ...lines.slice(0, startLineInfo.lineIndex),
      lineBelow,
      ...selectedLines,
      ...lines.slice(endLineInfo.lineIndex + 2),
    ]

    const newText = newLines.join("\n")

    setLocalValue(newText)
    onChange({ ...action, value: newText })

    requestAnimationFrame(() => {
      if (textareaRef.current) {
        const newStartPos = startLineInfo.lineStart + lineBelow.length + 1
        const newEndPos = newStartPos + (selectionEnd - selectionStart)
        textareaRef.current.setSelectionRange(newStartPos, newEndPos)
      }
    })
  }, [action, onChange, getLineInfo])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.ctrlKey && !e.shiftKey && !e.altKey) {
      e.stopPropagation()
      return
    }

    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault()
      e.stopPropagation()
      onKeyDown?.(e)
      return
    }

    if (e.altKey && !e.ctrlKey && !e.shiftKey) {
      if (e.key === "ArrowUp") {
        e.preventDefault()
        e.stopPropagation()
        moveLinesUp()
        return
      }
      if (e.key === "ArrowDown") {
        e.preventDefault()
        e.stopPropagation()
        moveLinesDown()
        return
      }
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    debouncedOnChange(newValue)
  }

  const clearText = useCallback(() => {
    setLocalValue("")
    onChange({ ...action, text: "" })
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [action, onChange])

  const copyToClipboard = useCallback(async () => {
    if (localValue) {
      try {
        await navigator.clipboard.writeText(localValue)
      } catch (err) {
        console.error("Failed to copy text: ", err)
      }
    }
  }, [localValue])

  const lineNumbersElement = useMemo(
    () => (
      <div className="bg-primary/65 px-2 py-2 text-xs text-primary-foreground/65 font-mono select-none border-r">
        {lineNumbers.map((num) => (
          <div key={num} className="h-5 leading-5 text-right min-w-[2ch]">
            {num}
          </div>
        ))}
      </div>
    ),
    [lineNumbers],
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="text-value" className="flex items-center gap-2">
          <Type className="h-4 w-4" />
          Text to Type
        </Label>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={copyToClipboard} disabled={!localValue}>
            <Copy className="h-3 w-3" />
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={clearText} disabled={!localValue}>
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="relative">
        <div className="flex border rounded-md overflow-hidden bg-background">
          {lineNumbersElement}
          <Textarea
            id="text-value"
            ref={textareaRef}
            value={localValue}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter text to type..."
            className="border-0 resize-none font-mono text-sm leading-5 min-h-[120px] focus-visible:ring-0 placeholder:text-primary-foreground/65 bg-primary rounded-l-none text-primary-foreground"
            style={{
              lineHeight: "1.25rem",
              paddingTop: "0.5rem",
              paddingBottom: "0.5rem",
            }}
          />
        </div>
      </div>

      <div className="text-xs text-foreground/65 space-y-1 bg-background/65 p-3 rounded-md">
        <div className="font-medium mb-2">Keyboard Shortcuts:</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          <div>
            <Badge className="px-1 py-0.5 rounded text-xs">Enter</Badge> New line
          </div>
          <div>
            <Badge className="px-1 py-0.5 rounded text-xs">Ctrl + Enter</Badge> Add action
          </div>
          <div>
            <Badge className="px-1 py-0.5 rounded text-xs">Alt + ↑/↓</Badge> Move lines
          </div>
        </div>
      </div>
    </div>
  )
}
