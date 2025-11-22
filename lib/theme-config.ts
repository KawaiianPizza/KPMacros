import { Theme, ThemeColors } from "./types"

export const defaultThemes: Theme[] = [
  {
    name: "VomitTest",
    colors: {
      background: "#000000",
      foreground: "#ffffff",
      input: "#ffaaaa",
      inputText: "#aaffff",
      info: "#aaffaa",
      infoText: "#ff00ff",
      card: "#aaaaff",
      active: "#ffffaa",
      activeText: "#aaaaaa",
      destructive: "#dc2626",
      border: "#bb00bb",
    },
    isDefault: true
  },
  {
    name: "Hallowed Mint",
    colors: {
      background: "#14161b",
      foreground: "#E3E5E8",
      input: "#252629",
      inputText: "#E3E5E8",
      info: "#3e3f41",
      infoText: "#80FFDF",
      card: "#2f3034",
      active: "#80FFDF",
      activeText: "#252629",
      destructive: "#ff0000",
      border: "#80888B"
    },
    isDefault: true
  },
  {
    name: "Bloodclaat",
    colors: {
      background: "#ffaada",
      foreground: "#3a0022",
      input: "#ffaada",
      inputText: "#1a1a1a",
      info: "#ffaada",
      infoText: "#D62839",
      card: "#ffffff",
      active: "#E63946",
      activeText: "#E63946",
      destructive: "#dc2626",
      border: "#fe4cb1",
    },
    isDefault: true
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

export function getThemeByName(name: string): Theme | undefined {
  return defaultThemes.find((theme) => theme.name === name)
}