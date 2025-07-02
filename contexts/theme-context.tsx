"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { defaultThemes, applyThemeColors, getThemeById } from "@/lib/theme-config"
import { Theme, ThemeColors } from "@/lib/types"
import websocketService from "@/lib/websocket-service"

interface ThemeContextType {
  currentTheme: Theme
  themes: Theme[]
  setTheme: (themeId: string) => void
  updateThemeColors: (colors: Partial<ThemeColors>) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [first, setFirst] = useState(1)
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultThemes[first])
  const [themes, setThemes] = useState<Theme[]>(defaultThemes)
  useEffect(() => {
    const handleGetTheme = ({ message, error }: { message: ThemeColors, success?: string, error?: string }) => {
      if (error) return;
      applyThemeColors(message)
    }

    websocketService?.on("theme", handleGetTheme)
    websocketService?.send("getTheme", {})
    return () => {
      websocketService?.off("theme", handleGetTheme)
    }
  }, [])


  useEffect(() => {
    if (process?.env?.NODE_ENV !== "development") return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "F2") return;
      setFirst(prev => {
        const next = (prev + 1) % defaultThemes.length
        setCurrentTheme(defaultThemes[next])
        return next
      })
    }
    document.onkeydown = handleKeyDown
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [])


  useEffect(() => {
    applyThemeColors(currentTheme.colors)
  }, [currentTheme])

  const setTheme = (themeId: string) => {
    const theme = themes.find((t) => t.id === themeId)
    if (theme) {
      setCurrentTheme(theme)
    }
  }

  const updateThemeColors = (colors: Partial<ThemeColors>) => {
    const updatedTheme = {
      ...currentTheme,
      colors: { ...currentTheme.colors, ...colors },
    }
    setCurrentTheme(updatedTheme)
  }

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themes,
        setTheme,
        updateThemeColors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
