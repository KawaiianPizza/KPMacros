"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useWebSocketUI } from "./use-websocketUI"
import { useToast } from "@/hooks/use-toast"
import { v4 as uuidv4 } from "uuid"
import { MacroData } from "@/lib/types"

interface PendingChange {
  macroId: string
  macro: MacroData
  timestamp: number
}

const AUTO_SAVE_DELAY = 10000

export function useMacros(profileName: string) {
  const [macros, setMacros] = useState<MacroData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const pendingChangesRef = useRef<Map<string, PendingChange>>(new Map())
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { send, on, off } = useWebSocketUI()

  const ensureMacroUUIDs = useCallback((macrosData: any[]): MacroData[] => {
    return macrosData.map((macro) => ({
      ...macro,
      id: macro.id || uuidv4(),
    }))
  }, [])

  const loadMacros = useCallback(() => {
    if (!profileName) return

    setIsLoading(true)
    send("getMacros", { profile: profileName })
  }, [profileName, send])

  const sendBatchedUpdates = useCallback(async (): Promise<void> => {
    const pendingChanges = pendingChangesRef.current
    if (pendingChanges.size === 0) return

    try {
      const macrosToUpdate = Array.from(pendingChanges.values()).map((change) => change.macro)

      send("batchUpdateMacros", {
        profile: profileName,
        macros: macrosToUpdate,
      })

      pendingChangesRef.current.clear()
    } catch (error) {
      console.error("Error sending batched updates:", error)
    }
  }, [profileName, send])

  const sendModMacros = useCallback(async (): Promise<void> => {
    const mods = macros.filter(e => e.mod)
    for (const mod of mods)
      send("testMacro", { profile: profileName, macro: mod })
  }, [macros, profileName, send])

  const scheduleAutoSave = useCallback((): void => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(sendBatchedUpdates, AUTO_SAVE_DELAY)
  }, [sendBatchedUpdates])

  const addPendingChange = useCallback(
    (macro: MacroData): void => {
      const newChange: PendingChange = {
        macroId: macro.id,
        macro: { ...macro },
        timestamp: Date.now(),
      }

      pendingChangesRef.current.set(macro.id, newChange)
      scheduleAutoSave()
    },
    [scheduleAutoSave],
  )

  const updateMacro = useCallback(
    (macroId: string, updates: Partial<Pick<MacroData, "enabled" | "loopMode">>) => {
      const macro = macros.find((m) => m.id === macroId)
      if (!macro) return

      const updatedMacro = { ...macro, ...updates, oldName: macro.name }

      setMacros((currentMacros) => currentMacros.map((m) => (m.id === macroId ? updatedMacro : m)))

      addPendingChange(updatedMacro)
    },
    [macros, addPendingChange],
  )

  const renameMacro = useCallback(
    (macroId: string, newName: string) => {
      const macro = macros.find((m) => m.id === macroId)
      if (!macro) return

      send("saveMacro", {
        profile: profileName,
        macro: {
          ...macro,
          name: newName,
          oldName: macro.name,
        },
      })

      setMacros((currentMacros) => currentMacros.map((m) => (m.id === macroId ? { ...m, name: newName } : m)))
    },
    [macros, profileName, send],
  )

  const deleteMacro = useCallback(
    (macroId: string) => {
      const macro = macros.find((m) => m.id === macroId)
      if (!macro) return

      send("deleteMacro", {
        profile: profileName,
        name: macro.name,
      })

      setMacros((currentMacros) => currentMacros.filter((m) => m.id !== macroId))
      pendingChangesRef.current.delete(macroId)
    },
    [macros, profileName, send],
  )

  useEffect(() => {
    const handleMacros = (data: any[]) => {
      const macrosWithUUIDs = ensureMacroUUIDs(data)
      setMacros(macrosWithUUIDs)
      setIsLoading(false)
      pendingChangesRef.current.clear()
    }

    const handlebatchMacrosUpdated = (data: { success: boolean; errors?: any[] }) => {
      if (!data.success) {
        console.error("Batch update failed:", data.errors)
      }
    }

    on("macros", handleMacros)
    on("batchMacrosUpdated", handlebatchMacrosUpdated)

    return () => {
      off("macros", handleMacros)
      off("batchMacrosUpdated", handlebatchMacrosUpdated)
    }
  }, [ensureMacroUUIDs, on, off])

  useEffect(() => {
    loadMacros()
  }, [loadMacros])

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  return {
    macros,
    isLoading,
    loadMacros,
    updateMacro,
    renameMacro,
    deleteMacro,
    sendBatchedUpdates,
    sendModMacros
  }
}
