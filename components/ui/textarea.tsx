"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useMemo, useCallback, useEffect } from "react"
import { ArrowDownToLine, ArrowUpToLine } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

interface AnimatedTextareaProps extends React.ComponentProps<"textarea"> {
  animateNewText?: boolean
}

interface AnimatedRange {
  start: number
  end: number
  id: string
  startTime: number
}

interface TextMetrics {
  charWidth: number
  lineHeight: number
  fontSize: number
  fontFamily: string
  font: string
  maxCharsPerLine: number
}

const Textarea = React.forwardRef<HTMLTextAreaElement, AnimatedTextareaProps>(({ className, animateNewText = false, onChange, ...props }, ref) => {
  const [previousValue, setPreviousValue] = React.useState("")
  const [animatedRanges, setAnimatedRanges] = React.useState<AnimatedRange[]>([])
  const [textMetrics, setTextMetrics] = React.useState<TextMetrics>({ charWidth: 8, lineHeight: 20, fontSize: 14, fontFamily: "monospace", font: "", maxCharsPerLine: 69 })

  const textareaRef = React.useRef<HTMLTextAreaElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const animationFrameRef = React.useRef<number>(0)
  const measureCanvasRef = React.useRef<HTMLCanvasElement | null>(null)

  React.useImperativeHandle(ref, () => textareaRef.current!)

  const measureTextMetrics = useCallback(() => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const computedStyle = window.getComputedStyle(textarea)

    if (!measureCanvasRef.current) {
      measureCanvasRef.current = document.createElement("canvas")
    }
    const canvas = measureCanvasRef.current
    const ctx = canvas.getContext("2d")!

    const fontSize = Number.parseInt(computedStyle.fontSize) || 14
    const fontFamily = computedStyle.fontFamily || "monospace"
    const fontWeight = computedStyle.fontWeight || "normal"
    const font = `${fontWeight} ${fontSize}px ${fontFamily}`

    ctx.font = computedStyle.font || font

    const charWidth = ctx.measureText(previousValue).width / previousValue.length

    const lineHeight = Number.parseInt(computedStyle.lineHeight) || fontSize * 1.2
    const paddingLeft = (Number.parseInt(computedStyle.paddingLeft) + Number.parseInt(computedStyle.paddingRight)) || 0

    const scrollbarWidth = textarea.offsetWidth - textarea.clientWidth
    const availableWidth = textarea.clientWidth - paddingLeft - scrollbarWidth
    let maxCharsPerLine = availableWidth / charWidth

    setTextMetrics({ charWidth, lineHeight, fontSize, fontFamily, font, maxCharsPerLine })
  }, [])

  const calculateWrappedLines = useCallback(() => {
    if (!textareaRef.current || !textMetrics.charWidth) return []

    const maxCharsPerLine = textMetrics.maxCharsPerLine
    if (maxCharsPerLine <= 0) return []

    const lines = previousValue.split("\n")
    const wrappedLines: {
      lineNumber: number
      isWrapped: boolean
      content: string
      charIndices: number[]
    }[] = []

    let globalCharIndex = 0

    lines.forEach((line, index) => {
      const realLineLength = line.length
      const trimmedLine = line.trimEnd()
      const trimmedLength = trimmedLine.length

      if (trimmedLength <= maxCharsPerLine) {
        const charIndices = Array.from({ length: trimmedLength }, (_, i) => globalCharIndex + i)
        wrappedLines.push({
          lineNumber: index + 1,
          isWrapped: false,
          content: trimmedLine,
          charIndices,
        })
        globalCharIndex += realLineLength + 1
        return
      }

      const words = line.match(/\S+\s*/g) || []
      let currentLine = ""
      let currentIndices: number[] = []
      let isFirstPart = true
      let lineCursor = 0

      for (const word of words) {
        const wordStart = globalCharIndex + lineCursor
        const wordIndices = Array.from({ length: word.length }, (_, i) => wordStart + i)

        const testLine = currentLine + word
        const testTrimmedLength = testLine.trimEnd().length

        if (testTrimmedLength <= maxCharsPerLine) {
          currentLine = testLine
          currentIndices.push(...wordIndices)
          lineCursor += word.length
        } else {
          if (currentLine.length > 0) {
            const trimmedCurrentLine = currentLine.trimEnd()
            const trimmedLength = trimmedCurrentLine.length
            const trimmedIndices = currentIndices.slice(0, trimmedLength)

            wrappedLines.push({
              lineNumber: index + 1,
              isWrapped: !isFirstPart,
              content: trimmedCurrentLine,
              charIndices: trimmedIndices,
            })
            isFirstPart = false
          }

          currentLine = word
          currentIndices = wordIndices
          lineCursor += word.length

          while (currentLine.length > maxCharsPerLine) {
            const chunk = currentLine.slice(0, maxCharsPerLine)
            const chunkIndices = currentIndices.slice(0, maxCharsPerLine)

            wrappedLines.push({
              lineNumber: index + 1,
              isWrapped: !isFirstPart,
              content: chunk,
              charIndices: chunkIndices,
            })

            currentLine = currentLine.slice(maxCharsPerLine)
            currentIndices = currentIndices.slice(maxCharsPerLine)
            isFirstPart = false
          }
        }
      }

      if (currentLine.trim().length > 0) {
        const trimmedCurrentLine = currentLine.trimEnd()
        const trimmedIndices = currentIndices.slice(0, trimmedCurrentLine.length)
        wrappedLines.push({
          lineNumber: index + 1,
          isWrapped: !isFirstPart,
          content: trimmedCurrentLine,
          charIndices: trimmedIndices,
        })
      }

      globalCharIndex += realLineLength + 1
    })

    return wrappedLines
  }, [textMetrics, previousValue])

  const animatedChars = useMemo(() => {
    const animatedChars = new Set<number>()
    animatedRanges.forEach((range) => {
      for (let i = range.start; i < range.end; i++)
        animatedChars.add(i)
    })
    return animatedChars
  }, [animatedRanges])

  const renderCanvasOverlay = useCallback(() => {
    if (!canvasRef.current || !textareaRef.current || !animateNewText) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")!
    const textarea = textareaRef.current

    // Set canvas size to match textarea
    const rect = textarea.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, rect.width, rect.height)

    ctx.font = textMetrics.font
    ctx.textBaseline = "top"

    const currentTime = Date.now()
    const padding = 12 // Match textarea padding

    const originalText = previousValue || ""
    let originalIndex = 0

    wrappedLines.forEach((wrappedLine, visualLineIndex) => {
      const y = visualLineIndex * textMetrics.lineHeight + padding
      let x = padding

      Array.from(wrappedLine.content).forEach((char, i) => {
        const indexInOriginal = wrappedLine.charIndices[i]
        if (animatedChars.has(indexInOriginal)) {
          const range = animatedRanges.find((r) =>
            indexInOriginal >= r.start &&
            indexInOriginal < r.end)

          if (range) {
            const elapsed = currentTime - range.startTime
            const duration = 2000
            const progress = Math.min(elapsed / duration, 1)

            const opacity = (1 - ((progress - 0.9) / 0.1)) * 100
            const hue = (progress * 360 + elapsed * 0.1) % 360

            ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${opacity}%)`
            ctx.fillText(char, x, y)

            ctx.shadowColor = `hsl(${hue}, 70%, 60%)`
            ctx.shadowBlur = 3
            ctx.fillText(char, x, y)
            ctx.shadowBlur = 0
          }
        }

        x += textMetrics.charWidth
      })

      if (visualLineIndex < wrappedLines.length - 1) {
        const nextLine = wrappedLines[visualLineIndex + 1]
        if (!nextLine.isWrapped && originalIndex < originalText.length && originalText[originalIndex] === "\n")
          originalIndex++
      }
    })
  }, [previousValue, animatedRanges, textMetrics, animateNewText])

  const animate = useCallback(() => {
    renderCanvasOverlay()

    if (animatedRanges.length > 0) {
      animationFrameRef.current = requestAnimationFrame(animate)
    }
  }, [renderCanvasOverlay, animatedRanges.length])

  useEffect(() => {
    if (animatedRanges.length >= 0)
      animate()
    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current)
    }
  }, [animate, animatedRanges.length])

  useEffect(() => {
    measureTextMetrics()

    const handleResize = () => {
      measureTextMetrics()
      renderCanvasOverlay()
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    setPreviousValue(props.value + "")
  }, [props.value])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    const oldValue = previousValue

    if (animateNewText && newValue.length >= oldValue.length) {
      const selectionEnd = textareaRef.current?.selectionEnd || 0
      const lastHalf = newValue.slice(selectionEnd)
      const firstHalf = oldValue.substring(0, oldValue.length - lastHalf.length)
      const newTextLength = newValue.length - oldValue.length
      const animationId = uuidv4()

      const newRange: AnimatedRange = {
        start: firstHalf.length,
        end: firstHalf.length + newTextLength,
        id: animationId,
        startTime: Date.now(),
      }

      setAnimatedRanges((prev) => [...prev, newRange])

      setTimeout(() => {
        setAnimatedRanges((prev) => prev.filter((range) => range.id !== animationId))
      }, 2000)
    }

    setPreviousValue(newValue)
    onChange?.(e)
  }

  const wrappedLines = useMemo(() => calculateWrappedLines(), [previousValue])

  const lineNumbersElement = useMemo(() => {
    const totalVisualLines = Math.max(1, wrappedLines.length)
    const maxLineNumber = wrappedLines.length > 0 ? Math.max(...wrappedLines.map((l) => l.lineNumber)) : 1
    const width = `${maxLineNumber.toString().length + 1}ch`

    return (
      <div className="bg-input/65 px-2 py-2 text-xs text-input-text/65 font-mono select-none border-r">
        {wrappedLines.map((wrappedLine, index) => (
          <div
            key={`${wrappedLine.lineNumber}-${index}`}
            className={cn("relative text-right")}
            style={{
              width,
              height: `${textMetrics.lineHeight}px`,
              lineHeight: `${textMetrics.lineHeight}px`,
            }}
          >
            {index === 0 && <ArrowUpToLine className="absolute h-3 w-3 top-[5px] -left-[6px]" />}
            {index === totalVisualLines - 1 && (
              <ArrowDownToLine className="absolute h-3 w-3 bottom-[5px] -left-[6px]" />
            )}
            {!wrappedLine.isWrapped ? wrappedLine.lineNumber : ""}
          </div>
        ))}
        {wrappedLines.length === 0 && (
          <div
            className={cn("relative text-right")}
            style={{
              width,
              height: `${textMetrics.lineHeight}px`,
              lineHeight: `${textMetrics.lineHeight}px`,
            }}
          >
            <ArrowUpToLine className="absolute h-3 w-3 top-[5px] -left-[6px]" />
            <ArrowDownToLine className="absolute h-3 w-3 bottom-[5px] -left-[6px]" />1
          </div>
        )}
      </div>
    )
  }, [wrappedLines, textMetrics])

  if (animateNewText) {
    return (
      <div
        className={cn(
          "relative flex h-full min-h-[80px] w-full rounded-md overflow-clip border border-border bg-input/100 text-base text-input-text ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
      >
        {lineNumbersElement}
        <div className={cn("h-auto w-full overflow-hidden relative font-mono")}>
          <textarea
            className={cn(
              "h-full w-full resize-none overflow-hidden px-3 py-2 font-mono outline-none placeholder:text-input-text/65 bg-transparent caret-white relative z-10",
            )}
            ref={textareaRef}
            onChange={handleChange}
            {...props}
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-20"
            style={{ mixBlendMode: "screen" }}
          />
        </div>
      </div>
    )
  }

  return (
    <textarea
      className={cn(
        "placeholder:text-muted-foreground flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      ref={textareaRef}
      onChange={onChange}
      {...props}
    />
  )
},
)

Textarea.displayName = "Textarea"

export { Textarea }
