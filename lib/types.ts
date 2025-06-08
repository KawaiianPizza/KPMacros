export interface Profile {
  name: string
  windows: string[]
  oldName?: string
}

export interface Macro {
  id: string
  name: string
  enabled: boolean
  type: "Hotkey" | "Command"
  activator: string
  loopMode: "Held" | "Toggle"
  modifierMode: "Inclusive" | "Exclusive"
  repeatDelay: number
  start: any[]
  loop: any[]
  finish: any[]
  cooldown: number
}

export interface BatchMacroUpdate {
  profile: string
  macro: Macro
}

export interface BatchUpdateRequest {
  profile: string
  macros: BatchMacroUpdate[]
}

export interface BatchUpdateResponse {
  success: boolean
  errors?: Array<{
    macroId: string
    macroName: string
    error: string
  }>
  updatedMacros?: Macro[]
}

export interface Window {
  executable: string
  title: string
  pid: string
}

export interface GeneralSettings {
  runAtStartup: boolean
  runAsAdmin: boolean
}

export interface Settings {
  general: GeneralSettings
  theme: ThemeColors
}

export interface Theme {
  id: string
  name: string
  colors: ThemeColors
  isDefault?: boolean
}

export interface ThemeColors {
  // Base colors
  background: string
  foreground: string
  card: string
  cardForeground: string
  popover: string
  popoverForeground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  destructive: string
  destructiveForeground: string
  border: string
  input: string
  ring: string

  // Extended colors for better theming
  backgroundLighter: string
  backgroundDarker: string
  textMuted: string
  textDisabled: string

  // Interactive states
  primaryHover: string
  primaryActive: string
  secondaryHover: string
  secondaryActive: string
  accentHover: string
  accentActive: string

  // Border variations
  borderLight: string
  borderHeavy: string

  // Input states
  inputHover: string
  inputFocus: string
  inputForeground: string

  // Status colors
  success: string
  warning: string
  error: string
  info: string
}

export interface WebSocketMessage {
  action: string
  data: any
}
