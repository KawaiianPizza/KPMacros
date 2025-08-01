"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface CountdownTimerProps extends React.HTMLAttributes<HTMLDivElement> {
  from?: number
  finished?: () => void
}

const CountdownTimer = ({ className, from = 3, finished }: CountdownTimerProps) => {
  const [currentNumber, setCurrentNumber] = useState<number>(from);
  const [prevNumber, setPrevNumber] = useState<number | null>(null);

  useEffect(() => {
    if (currentNumber <= 0 && finished)
      finished()
    const timeout = setTimeout(() => {
      setCurrentNumber((prev) => {
        setPrevNumber(prev)
        return Math.max(prev - 1, 0)
      });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [currentNumber]);

  return (
    <div className={cn("relative overflow-visible text-center flex font-bold text-xl *:origin-[50%_200%] *:[animation-timing-function:cubic-bezier(.8,-0.8,.3,1.7)]", className)}>
      <style>{`
        @keyframes slideOutRight {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(45deg);
          }
        }

        @keyframes slideInLeft {
          0% {
            transform: rotate(-45deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
      `}</style>

      <span
        key={`in-${currentNumber}`}
        className={cn("w-full h-full flex-1 items-center justify-center",
          "animate-[slideInLeft_0.5s_forwards]")}>
        {currentNumber}
      </span>
      {prevNumber !== null && currentNumber !== prevNumber && (
        <span
          key={`out-${prevNumber}`}
          className={cn("absolute w-full h-full flex-1 items-center justify-center",
            "animate-[slideOutRight_0.5s_forwards]")}>
          {prevNumber}
        </span>
      )}
    </div>
  )
}

export { CountdownTimer }
