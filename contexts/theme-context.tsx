"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { defaultThemes, applyThemeColors, getThemeById } from "@/lib/theme-config"
import { Theme, ThemeColors } from "@/lib/types"

interface ThemeContextType {
  currentTheme: Theme
  themes: Theme[]
  setTheme: (themeId: string) => void
  updateThemeColors: (colors: Partial<ThemeColors>) => void
  addCustomTheme: (theme: Theme) => void
  removeCustomTheme: (themeId: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [first, setFirst] = useState(2)
  const [currentTheme, setCurrentTheme] = useState<Theme>(defaultThemes[first])
  const [themes, setThemes] = useState<Theme[]>(defaultThemes)
  // useEffect(() => {
  //   const savedThemeId = localStorage.getItem("app-theme")
  //   const savedCustomThemes = localStorage.getItem("custom-themes")

  //   if (savedCustomThemes) {
  //     try {
  //       const customThemes = JSON.parse(savedCustomThemes)
  //       setThemes((prev) => [...prev, ...customThemes])
  //     } catch (error) {
  //       console.error("Failed to load custom themes:", error)
  //     }
  //   }

  //   if (savedThemeId) {
  //     const theme = getThemeById(savedThemeId) || themes.find((t) => t.id === savedThemeId)
  //     if (theme) {
  //       setCurrentTheme(theme)
  //     }
  //   }
  // }, [])

  useEffect(() => {
    if (process?.env?.NODE_ENV !== "development") return
    applyThemeColors(currentTheme.colors)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "F2") return;
      setFirst(prev => {
        const next = (prev + 1) % defaultThemes.length
        setCurrentTheme(defaultThemes[next])
        return next
      })
    }
    document.onkeydown = handleKeyDown
    localStorage.setItem("app-theme", currentTheme.id)
    return () => document.removeEventListener("keydown", handleKeyDown);
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

    if (currentTheme.id.startsWith("custom-")) {
      setThemes((prev) => prev.map((t) => (t.id === currentTheme.id ? updatedTheme : t)))
      saveCustomThemes(themes.filter((t) => t.id.startsWith("custom-")))
    }
  }

  const addCustomTheme = (theme: Theme) => {
    setThemes((prev) => [...prev, theme])
    saveCustomThemes([...themes.filter((t) => t.id.startsWith("custom-")), theme])
  }

  const removeCustomTheme = (themeId: string) => {
    if (!themeId.startsWith("custom-")) return

    setThemes((prev) => prev.filter((t) => t.id !== themeId))
    const customThemes = themes.filter((t) => t.id.startsWith("custom-") && t.id !== themeId)
    saveCustomThemes(customThemes)

    if (currentTheme.id === themeId) {
      setTheme(defaultThemes[0].id)
    }
  }

  const saveCustomThemes = (customThemes: Theme[]) => {
    //localStorage.setItem("custom-themes", JSON.stringify(customThemes))
  }

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themes,
        setTheme,
        updateThemeColors,
        addCustomTheme,
        removeCustomTheme,
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
