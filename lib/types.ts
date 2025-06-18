export interface Profile {
  name: string
  windows: string[]
  oldName?: string
}

export interface MacroData {
  id?: string
  name: string
  oldName?: string
  mod: boolean
  enabled: boolean
  type: "Hotkey" | "Command"
  activator: string
  loopMode: "Held" | "Toggle"
  interrupt: boolean
  repeatDelay: number
  modifiers: Modifiers
  modifierMode: "Inclusive" | "Exclusive"
  start: MacroAction[]
  loop: MacroAction[]
  finish: MacroAction[]
  cooldown: number
}
export interface MacroAction extends Record<string, any> {
  id: string
  type: "keyboard" | "mouse" | "text" | "delay"
}

export enum Modifiers {
  Shift = 1 << 0,
  Control = 1 << 1,
  Alt = 1 << 2,
  Win = 1 << 3,
  Any = 1 << 4,
  None = 1 << 5,
}
export interface BatchMacroUpdate {
  profile: string
  macro: MacroData
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
  updatedMacros?: MacroData[]
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
  background: string
  foreground: string
  card: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  accent: string
  destructive: string
  border: string
}

export interface WebSocketMessage {
  action: string
  data: any
}
