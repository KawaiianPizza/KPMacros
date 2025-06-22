import { Theme, ThemeColors } from "./types"

export const defaultThemes: Theme[] = [
  {
    id: "VomitTest",
    name: "VomitTest",
    colors: {
      background: "#000000",
      foreground: "#ffffff",
      primary: "#ffaaaa",
      primaryForeground: "#aaffff",
      secondary: "#aaffaa",
      secondaryForeground: "#ff00ff",
      card: "#aaaaff",
      accent: "#ffffaa",
      destructive: "#dc2626",
      border: "#bb00bb",
    },
  },
  {
    id: "HallowedMint",
    name: "Hallowed Mint",
    colors: {
      background: "#14161b",
      foreground: "#E3E5E8",
      primary: "#252629",
      primaryForeground: "#E3E5E8",
      secondary: "#3e3f41",
      secondaryForeground: "#80FFDF",
      card: "#2f3034",
      accent: "#80FFDF",
      destructive: "#ff0000",
      border: "#80888B"
    },
  },
  {
    id: "bloodclaat",
    name: "Bloodclaat",
    colors: {
      background: "#ffaada",
      foreground: "#ae00ff",
      primary: "#ff79c5",
      primaryForeground: "#ffe9f5",
      secondary: "#fe4cb1",
      secondaryForeground: "#9a5aff",
      card: "#ffffff",
      accent: "#fd4cfd",
      destructive: "#dc2626",
      border: "#bae6fd",
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
