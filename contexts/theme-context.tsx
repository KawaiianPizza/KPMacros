"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { defaultThemes, applyThemeColors, getThemeByName } from "@/lib/theme-config"
import { Theme, ThemeColors } from "@/lib/types"
import { useSettingsContext } from "./settings-context"
import { useWebSocketUI } from "@/hooks/use-websocketUI"

interface ThemeContextType {
  currentTheme: Theme
  themes: Theme[]
  setTheme: (name: string) => void
  updateThemeColors: (colors: Partial<ThemeColors>) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [first, setFirst] = useState(1)
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultThemes[first])
  const [themes, setThemes] = useState<Theme[]>(defaultThemes)
  const { send, on, off } = useWebSocketUI()

  const { settings } = useSettingsContext()

  useEffect(() => {
    const handleGetTheme = ({ message, error }: { message: ThemeColors, success?: string, error?: string }) => {
      if (error) {
        const theme = themes.find((t) => t.name === settings.theme.selectedTheme.value)
        if (theme)
          setCurrentTheme(theme)
        return
      }
      applyThemeColors(message)
    }

    const handleGetThemes = ({ message, error }: { message: Theme[], success?: string, error?: string }) => {
      if (error) return
      if (!message) return
      setThemes(prev => [...prev, ...message])
    }

    on("theme", handleGetTheme)
    on("themes", handleGetThemes)
    return () => {
      off("theme", handleGetTheme)
      off("themes", handleGetThemes)
    }
  }, [])

  useEffect(() => {
    const theme = settings.theme.selectedTheme.value
    if (theme !== currentTheme.name)
      send("getTheme", { name: theme })
  }, [settings.theme.selectedTheme.value])

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

  const setTheme = (name: string) => {
    const theme = themes.find((t) => t.name === name)
    if (theme)
      setCurrentTheme(theme)
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
