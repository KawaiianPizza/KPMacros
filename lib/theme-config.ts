import { Theme, ThemeColors } from "./types"

export const defaultThemes: Theme[] = [
  {
    id: "default",
    name: "Default",
    isDefault: true,
    colors: {
      background: "#ffffff",
      foreground: "#0f0f0f",
      card: "#ffffff",
      cardForeground: "#0f0f0f",
      popover: "#ffffff",
      popoverForeground: "#0f0f0f",
      primary: "#171717",
      primaryForeground: "#fafafa",
      secondary: "#f5f5f5",
      secondaryForeground: "#171717",
      muted: "#f5f5f5",
      mutedForeground: "#737373",
      accent: "#f5f5f5",
      accentForeground: "#171717",
      destructive: "#ef4444",
      destructiveForeground: "#fafafa",
      border: "#e5e5e5",
      input: "#e5e5e5",
      ring: "#0f0f0f",

      backgroundLighter: "#ffffff",
      backgroundDarker: "#f2f2f2",
      textMuted: "#737373",
      textDisabled: "#a3a3a3",

      primaryHover: "#0d0d0d",
      primaryActive: "#0a0a0a",
      secondaryHover: "#f0f0f0",
      secondaryActive: "#ebebeb",
      accentHover: "#f0f0f0",
      accentActive: "#ebebeb",

      borderLight: "#ebebeb",
      borderHeavy: "#d4d4d4",

      inputHover: "#ebebeb",
      inputFocus: "#f0f0f0",
      inputForeground: "#0f0f0f",

      success: "#22c55e",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#3b82f6",
    },
  },
  {
    id: "slate",
    name: "Slate",
    colors: {
      background: "#121212",
      foreground: "#E3E5E8",
      card: "#2F3136",
      cardForeground: "#E3E5E8",
      popover: "#2F3136",
      popoverForeground: "#E3E5E8",
      primary: "#6366f1",
      primaryForeground: "#E3E5E8",
      secondary: "#2F3136",
      secondaryForeground: "#E3E5E8",
      muted: "#2F3136",
      mutedForeground: "#a3a3a3",
      accent: "#80FFDF",
      accentForeground: "#000000",
      destructive: "#dc2626",
      destructiveForeground: "#E3E5E8",
      border: "#40444B",
      input: "#202225",
      ring: "#6366f1",

      backgroundLighter: "#171717",
      backgroundDarker: "#050505",
      textMuted: "#a3a3a3",
      textDisabled: "#737373",

      primaryHover: "#4f46e5",
      primaryActive: "#4338ca",
      secondaryHover: "#2d2d2d",
      secondaryActive: "#1f1f1f",
      accentHover: "#00c29a",
      accentActive: "#00b08a",

      borderLight: "#4a4a4a",
      borderHeavy: "#363636",

      inputHover: "#262626",
      inputFocus: "#2d2d2d",
      inputForeground: "#fafafa",

      success: "#22c55e",
      warning: "#f59e0b",
      error: "#dc2626",
      info: "#3b82f6",
    },
  },
  {
    id: "ocean",
    name: "Ocean",
    colors: {
      background: "#f0f9ff",
      foreground: "#0c4a6e",
      card: "#ffffff",
      cardForeground: "#0c4a6e",
      popover: "#ffffff",
      popoverForeground: "#0c4a6e",
      primary: "#0284c7",
      primaryForeground: "#ffffff",
      secondary: "#e0f2fe",
      secondaryForeground: "#0c4a6e",
      muted: "#e0f2fe",
      mutedForeground: "#475569",
      accent: "#06b6d4",
      accentForeground: "#ffffff",
      destructive: "#dc2626",
      destructiveForeground: "#ffffff",
      border: "#bae6fd",
      input: "#e0f2fe",
      ring: "#0284c7",

      backgroundLighter: "#ffffff",
      backgroundDarker: "#e0f2fe",
      textMuted: "#475569",
      textDisabled: "#94a3b8",

      primaryHover: "#0369a1",
      primaryActive: "#075985",
      secondaryHover: "#bae6fd",
      secondaryActive: "#7dd3fc",
      accentHover: "#0891b2",
      accentActive: "#0e7490",

      borderLight: "#e0f2fe",
      borderHeavy: "#7dd3fc",

      inputHover: "#bae6fd",
      inputFocus: "#e0f2fe",
      inputForeground: "#0c4a6e",

      success: "#059669",
      warning: "#d97706",
      error: "#dc2626",
      info: "#0284c7",
    },
  },
]

export function hexToHsl(hex: string): string {
  const r = Number.parseInt(hex.slice(1, 3), 16) / 255
  const g = Number.parseInt(hex.slice(3, 5), 16) / 255
  const b = Number.parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

export function applyThemeColors(colors: ThemeColors): void {
  const root = document.documentElement

  Object.entries(colors).forEach(([key, value]) => {
    const cssVarName = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`
    root.style.setProperty(cssVarName, hexToHsl(value))
  })
}

export function getThemeById(id: string): Theme | undefined {
  return defaultThemes.find((theme) => theme.id === id)
}

export function createCustomTheme(name: string, colors: Partial<ThemeColors>): Theme {
  const baseTheme = defaultThemes[0]
  return {
    id: `custom-${Date.now()}`,
    name,
    colors: { ...baseTheme.colors, ...colors },
  }
}
