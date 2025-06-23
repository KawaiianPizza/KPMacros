"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useMemo, useCallback, useEffect } from "react"
import { ArrowDownToLine, ArrowUpToLine } from "lucide-react"
import { v4 as uuidv4 } from "uuid"

interface AnimatedTextareaProps extends React.ComponentProps<"textarea"> {
  animateNewText?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, AnimatedTextareaProps>(
  ({ className, animateNewText = false, onChange, ...props }, ref) => {
    const [previousValue, setPreviousValue] = React.useState("")
    const [animatedRanges, setAnimatedRanges] = React.useState<Array<{ start: number; end: number; id: string }>>([])
    const [textMetrics, setTextMetrics] = React.useState({ charWidth: 8, lineHeight: 20 })
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    const overlayRef = React.useRef<HTMLDivElement>(null)
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null)

    const textarea = textareaRef.current
    const textareaWidth = (textarea?.clientWidth || 0) - 12 // One side padding
    const maxCharsPerLine = Math.round(textareaWidth / textMetrics.charWidth)

    React.useImperativeHandle(ref, () => textareaRef.current!)

    useEffect(() => {
      if (props.value !== previousValue) {
        setPreviousValue(props.value + "")
      }
    }, [props.value, previousValue])


    const measureTextMetrics = useCallback(() => {
      if (!textareaRef.current) return

      const textarea = textareaRef.current
      const computedStyle = window.getComputedStyle(textarea)

      if (!canvasRef.current) {
        canvasRef.current = document.createElement("canvas")
      }
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")!

      const font = computedStyle.font || [
        computedStyle.fontStyle,
        computedStyle.fontVariant,
        computedStyle.fontWeight,
        computedStyle.fontSize,
        computedStyle.lineHeight ? `/${computedStyle.lineHeight}` : '',
        computedStyle.fontFamily,
      ].filter(Boolean).join(' ');

      ctx.font = font;

      const charWidth = Math.round(ctx.measureText("i").width)
      const lineHeight = Number.parseInt(computedStyle.lineHeight) || Number.parseInt(computedStyle.fontSize) * 1.2

      setTextMetrics({ charWidth, lineHeight })
    }, [])

    const calculateWrappedLines = useCallback(
      (text: string) => {
        if (!textareaRef.current) return []

        if (maxCharsPerLine <= 0) return []

        const lines = text.split("\n")
        const wrappedLines: { lineNumber: number; isWrapped: boolean; content: string }[] = []

        lines.forEach((line, index) => {
          if (line.length <= maxCharsPerLine) {
            wrappedLines.push({
              lineNumber: index + 1,
              isWrapped: false,
              content: line,
            })
          } else {
            const words = line.split(/(\s+)/)
            let currentLine = ""
            let isFirstPart = true

            for (let i = 0; i < words.length; i++) {
              const word = words[i]
              if (word.length > maxCharsPerLine) {
                if (currentLine.length > 0) {
                  wrappedLines.push({
                    lineNumber: index + 1,
                    isWrapped: !isFirstPart,
                    content: currentLine,
                  })
                  isFirstPart = false
                }
                let remainingWord = word
                while (remainingWord.length >= maxCharsPerLine) {
                  const chunk = remainingWord.slice(0, maxCharsPerLine)
                  wrappedLines.push({
                    lineNumber: index + 1,
                    isWrapped: !isFirstPart,
                    content: chunk,
                  })
                  remainingWord = remainingWord.slice(maxCharsPerLine)
                  isFirstPart = false
                }
                currentLine = remainingWord
              } else {
                const testLine = currentLine + word

                if (testLine.length <= maxCharsPerLine) {
                  currentLine = testLine
                } else {
                  if (currentLine.length > 0) {
                    wrappedLines.push({
                      lineNumber: index + 1,
                      isWrapped: !isFirstPart,
                      content: currentLine,
                    })
                    isFirstPart = false
                  }
                  currentLine = word
                }
              }
            }

            if (!currentLine.match(/^ +$/g) && currentLine.length > 0) {
              wrappedLines.push({
                lineNumber: index + 1,
                isWrapped: !isFirstPart,
                content: currentLine,
              })
            }
          }
        })

        return wrappedLines
      },
      [textMetrics],
    )

    useEffect(() => {
      measureTextMetrics()

      const handleResize = () => measureTextMetrics()
      window.addEventListener("resize", handleResize)

      return () => window.removeEventListener("resize", handleResize)
    }, [measureTextMetrics])

    useEffect(() => {
      if (textareaRef.current)
        measureTextMetrics()
    }, [measureTextMetrics])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      const oldValue = previousValue

      if (animateNewText && newValue.length > oldValue.length) {
        const lastHalf = newValue.slice(textareaRef.current?.selectionEnd || 0)
        const firstHalf = oldValue.substring(0, oldValue.length - lastHalf.length)
        const newTextLength = newValue.length - oldValue.length
        const animationId = uuidv4()

        const newLocal = {
          start: firstHalf.length,
          end: firstHalf.length + newTextLength,
          id: animationId,
        }
        setAnimatedRanges((prev) => [
          ...prev,
          newLocal,
        ])

        setTimeout(() => {
          setAnimatedRanges((prev) => prev.filter((range) => range.id !== animationId))
        }, 2000)
      }

      setPreviousValue(newValue)
      onChange?.(e)
    }

    const lines = useMemo(() => previousValue.split("\n"), [previousValue]);

    const animatedCharSet = useMemo(() => {
      const set: string[] = [];
      animatedRanges.forEach(({ start, end, id }) => {
        for (let i = start; i < end; i++) {
          set[i] = id + i;
        }
      });
      return set;
    }, [animatedRanges]);

    const renderOverlay = () => {
      if (!animateNewText || !textareaRef.current) return null;

      let globalCharIndex = 0;

      return (
        <div ref={overlayRef}
          className="absolute inset-0 pointer-events-none overflow-hidden whitespace-pre-wrap break-words px-3 py-2 text-base md:text-sm"
          style={copyStyle}
        >
          {lines.map((line, lineIndex) => {
            const spans: React.ReactNode[] = [];
            let buffer = "";
            let bufferStart = 0;

            Array.from(line).forEach((char, charIndex) => {
              const isAnimated = animatedCharSet[globalCharIndex];

              if (isAnimated) {
                if (buffer.length > 0) {
                  spans.push(<span key={`${lineIndex}-${bufferStart}`}>{buffer}</span>);
                  buffer = "";
                }

                spans.push(
                  <span key={`${isAnimated}`} className={cn("animate-magic-a")}>
                    {char}
                  </span>
                );
              } else {
                if (buffer.length === 0)
                  bufferStart = charIndex;
                buffer += char;
              }
              globalCharIndex++;
            });
            if (buffer.length > 0) {
              spans.push(
                <span key={`${lineIndex}-${bufferStart}`}>{buffer}</span>
              );
            }
            globalCharIndex++;

            return (
              <div key={lineIndex}>
                {spans}
                {lineIndex < lines.length - 1 && <br />}
              </div>
            );
          })}
        </div>
      );
    };

    const copyStyle = {
      fontFamily: "inherit",
      fontSize: "inherit",
      lineHeight: "inherit",
      letterSpacing: "inherit",
      color: "inherit",
    }

    const wrappedLines = useMemo(() => {
      return calculateWrappedLines(previousValue || "")
    }, [previousValue, calculateWrappedLines])

    const lineNumbersElement = useMemo(() => {
      const totalVisualLines = Math.max(1, wrappedLines.length)
      const maxLineNumber = wrappedLines.length > 0 ? Math.max(...wrappedLines.map((l) => l.lineNumber)) : 1
      const width = `${maxLineNumber.toString().length + 1}ch`

      return (
        <div className="bg-primary/65 px-2 py-2 text-xs text-primary-foreground/65 font-mono select-none border-r">
          {wrappedLines.map((wrappedLine, index) => (
            <div key={`${wrappedLine.lineNumber}-${index}`} className={cn("relative text-right")}
              style={{
                width,
                height: `${textMetrics.lineHeight}px`,
                lineHeight: `${textMetrics.lineHeight}px`,
              }}
            >
              {index === 0 && <ArrowUpToLine className="absolute h-3 w-3 top-[5px] -left-[6px]" />}
              {index === totalVisualLines - 1 && <ArrowDownToLine className="absolute h-3 w-3 bottom-[5px] -left-[6px]" />}
              {!wrappedLine.isWrapped ? wrappedLine.lineNumber : ""}
            </div>
          ))}
          {wrappedLines.length === 0 && (
            <div className={cn("relative text-right")}
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
        <div className={cn(
          "relative flex h-full min-h-[80px] w-full rounded-md overflow-clip border border-border bg-primary text-base text-primary-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        >
          {lineNumbersElement}
          <div className={cn("h-auto w-full overflow-hidden relative font-mono")}>
            <textarea className={cn(
              "h-full w-full resize-none overflow-hidden px-3 py-2 font-mono outline-none placeholder:text-primary-foreground/65",
              animateNewText && "bg-transparent text-transparent caret-accent",
            )}
              ref={textareaRef}
              onChange={handleChange}
              style={copyStyle}
              {...props}
            />
            {renderOverlay()}
          </div>
        </div>
      )
    }

    return (
      <textarea className={cn(
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
