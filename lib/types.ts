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

export const MacroActionType = <const>[
  "keyboard",
  "mouse",
  "text",
  "delay",
  "sound",
  "process",
];

export interface KeyboardAction { type: "keyboard"; key: string; state: "down" | "press" | "up"; }
export interface MouseButtonAction { type: "mouse"; button: "left" | "middle" | "right"; state: "down" | "click" | "up"; }
export interface MouseMoveAction { type: "mouse"; x: number; y: number; relative: boolean; }
export interface MouseScrollAction { type: "mouse"; scroll: "left" | "down" | "right" | "up"; amount: number; }
export interface TextAction { type: "text"; text: string }
export interface DelayAction { type: "delay"; duration: number }
export interface SoundAction { type: "sound"; filePath: string; volume?: number }
export interface ProcessAction { type: "process"; filePath: string; arguments?: string; hidden: boolean }

export type MacroActionUnion =
  | KeyboardAction
  | MouseButtonAction
  | MouseMoveAction
  | MouseScrollAction
  | TextAction
  | DelayAction
  | SoundAction
  | ProcessAction

export type MacroAction = MacroActionUnion & { id: string, type: typeof MacroActionType[number] };

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
  name: string
  colors: ThemeColors
  isDefault?: boolean
}

export type ThemeColors = typeof themeColors
export type ThemeColorKeys = keyof ThemeColors

export const themeColors = {
  background: '',
  foreground: '',
  input: '',
  inputText: '',
  info: '',
  infoText: '',
  card: '',
  active: '',
  activeText: '',
  destructive: '',
  border: ''
};

export interface WebSocketMessage {
  action: string
  data: any
}
export type WSUIMessage = { message: any, success?: string, error?: string }

export type InputData = KeyboardData | MouseData | ScrollData | MoveData | DelayData;

export type KeyboardData = {
  type: "keyboard";
  data: {
    key: number;
    isPressed: boolean;
    isModifier: boolean;
  };
}

export type MouseData = {
  type: "mouse";
  data: {
    button: "left" | "right" | "middle";
    isPressed: boolean;
  };
}

export type ScrollData = {
  type: "scroll";
  data: {
    direction: "up" | "down" | "left" | "right";
  };
}

export type MoveData = {
  type: "move";
  data: {
    x: number;
    y: number;
  };
}

export type DelayData = {
  type: "delay",
  data: {
    duration: number
  }
}