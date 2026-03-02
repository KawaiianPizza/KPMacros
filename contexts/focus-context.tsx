"use client"

import { useWebSocketUI } from '@/hooks/use-websocketUI'
import { createContext, useContext, useEffect, useState } from 'react'

interface FocusContextType {
  isFocused: boolean
}

const FocusContext = createContext<FocusContextType | undefined>(undefined)

export default function FocusProvider() {
  const { send } = useWebSocketUI()
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsFocused(document.hasFocus())
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    window.addEventListener('blur', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      window.removeEventListener('blur', handleVisibilityChange);
    }
  }, [])

  useEffect(() => {
    send("focusChange", { isFocused })
  }, [isFocused])

  return (
    <FocusContext.Provider
      value={{ isFocused }}>
    </FocusContext.Provider>
  )
}
export function useFocus() {
  const context = useContext(FocusContext)
  if (context === undefined) {
    throw new Error("useFocus must be used within a FocusProvider")
  }
  return context
}