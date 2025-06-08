import KEYCODES from "./KEYCODES"

const hotkeyPattern = /^(?:(?<Modifiers>(?:[Cc](?:trl|ontrol)|[Aa]lt|[Ss]hi?ft|[Ww]in(?:dows)?|[Mm]od)(?:\+(?:[Cc](?:trl|ontrol)|[Aa]lt|[Ss]hi?ft|[Ww]in(?:dows)?|[Mm]od))*))?\+?(?<Key>(?:[A-z][A-z0-9]*|\d{1,3}))$/

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export function validateMacroName(name: string): ValidationResult {
  const errors: string[] = []

  if (!name || !name.trim()) {
    errors.push("Macro name is required")
  } else if (name.trim().length < 1) {
    errors.push("Macro name must be at least 1 character long")
  } else if (name.trim().length > 50) {
    errors.push("Macro name must be less than 50 characters")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateProfileName(name: string, existingProfiles: string[] = []): ValidationResult {
  const errors: string[] = []

  if (!name || !name.trim()) {
    errors.push("Profile name is required")
  } else if (name.trim().length < 1) {
    errors.push("Profile name must be at least 1 character long")
  } else if (name.trim().length > 30) {
    errors.push("Profile name must be less than 30 characters")
  } else if (existingProfiles.includes(name.trim())) {
    errors.push("A profile with this name already exists")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateHotkeyActivator(activator: string): ValidationResult {
  const errors: string[] = []

  if (!activator || !activator.trim()) {
    errors.push("Hotkey activator is required")
    return { isValid: false, errors }
  }

  let match = hotkeyPattern.exec(activator.trim())
  if (!match?.groups) {
    errors.push("Invalid hotkey format. Use format: [Modifiers+]Key (e.g., Ctrl+Alt+A, Shift+F1, or just A)")
  }
  let key = match?.groups!["Key"]
  if (KEYCODES.findIndex(e => e.value.toLowerCase() === key?.toLowerCase() || e.keyCode === Number.parseInt(key || "")) === -1) {
    errors.push(key + " is not a valid keycode")
  }

  const parts = activator.trim().split("+")
  if (parts.length > 1) {
    const modifiers = parts.slice(0, -1)
    const uniqueModifiers = new Set(modifiers)

    if (modifiers.length !== uniqueModifiers.size) {
      errors.push("Duplicate modifiers are not allowed")
    }

    const validModifiers = ["ctrl", "control", "alt", "shift", "shft", "win", "windows", "mod"]
    const invalidModifiers = modifiers.filter((mod) => !validModifiers.includes(mod.toLowerCase()))

    if (invalidModifiers.length > 0) {
      errors.push(`Invalid modifiers: ${invalidModifiers.join(", ")}. Valid modifiers are: Ctrl, Alt, Shift, Win`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateCommandActivator(activator: string): ValidationResult {
  const errors: string[] = []

  if (!activator || !activator.trim()) {
    errors.push("Command activator is required")
  } else if (activator.trim().length < 2) {
    errors.push("Command must be at least 2 characters long")
  } else if (!activator.trim().startsWith("/") && !activator.trim().startsWith("!")) {
    errors.push("Command must start with '/' or '!'")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateActivator(activator: string, type: "Hotkey" | "Command"): ValidationResult {
  if (type === "Hotkey") {
    return validateHotkeyActivator(activator)
  } else {
    return validateCommandActivator(activator)
  }
}

export function validateRepeatDelay(delay: number): ValidationResult {
  const errors: string[] = []

  if (delay < 0) {
    errors.push("Repeat delay cannot be negative")
  } else if (delay > 10000) {
    errors.push("Repeat delay cannot exceed 10 seconds")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateWindowsFilename(name: string): string | undefined {
  if (!name.trim()) {
    return "Name cannot be empty"
  }

  if (name !== name.trim()) {
    return "Name cannot start or end with spaces"
  }

  if (name.startsWith(".") || name.endsWith(".")) {
    return "Name cannot start or end with a period"
  }

  const invalidChars = /[\\/:*?"<>|]/
  if (invalidChars.test(name)) {
    return 'Name contains invalid characters (\\/:*?"<>|)'
  }

  const reservedNames = [
    "CON",
    "PRN",
    "AUX",
    "NUL",
    "COM1",
    "COM2",
    "COM3",
    "COM4",
    "COM5",
    "COM6",
    "COM7",
    "COM8",
    "COM9",
    "LPT1",
    "LPT2",
    "LPT3",
    "LPT4",
    "LPT5",
    "LPT6",
    "LPT7",
    "LPT8",
    "LPT9",
  ]

  if (reservedNames.includes(name.toUpperCase())) {
    return "This name is reserved by Windows and cannot be used"
  }

  return undefined
}

export function parseHotkey(hotkey: string): { modifiers: string[]; key: string } | null {
  const match = hotkey.match(hotkeyPattern)

  if (!match) {
    return null
  }

  const modifiersString = match.groups?.Modifiers || ""
  const key = match.groups?.Key || ""

  const modifiers = modifiersString ? modifiersString.split("+") : []

  return { modifiers, key }
}

export function formatHotkey(modifiers: string[], key: string): string {
  if (modifiers.length === 0) {
    return key
  }
  return `${modifiers.join("+")}+${key}`
}
