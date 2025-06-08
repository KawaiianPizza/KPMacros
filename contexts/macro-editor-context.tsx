"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"
import websocketService from "@/lib/websocket-service"
import { useToast } from "@/hooks/use-toast"
import { validateActivator } from "@/lib/validation-utils"

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

export interface MacroData {
  id?: string
  name: string
  oldName?: string
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

interface MacroEditorContextType {
  // Macro data
  macro: MacroData
  updateMacro: (updates: Partial<MacroData>) => void
  resetMacro: () => void

  // Current profile and macro info
  currentProfile: string
  currentMacroId: string | null
  currentMacroName: string | null
  isEditingExisting: boolean

  // Action management
  addAction: (listType: "start" | "loop" | "finish", action: Omit<MacroAction, "id">) => void
  updateAction: (
    listType: "start" | "loop" | "finish",
    actionId: string,
    updates: Partial<Omit<MacroAction, "id">>,
  ) => void
  removeAction: (listType: "start" | "loop" | "finish", actionId: string) => void
  reorderActions: (listType: "start" | "loop" | "finish", newOrder: MacroAction[]) => void
  moveActionBetweenLists: (
    sourceListType: "start" | "loop" | "finish",
    destinationListType: "start" | "loop" | "finish",
    sourceIndex: number,
    destinationIndex: number,
  ) => void

  // UI state
  activeTab: string
  setActiveTab: (tab: string) => void
  isRecording: boolean
  setIsRecording: (recording: boolean) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  activeActionList: "start" | "loop" | "finish"
  setActiveActionList: (list: "start" | "loop" | "finish") => void

  // Form state
  hasUnsavedChanges: boolean
  setHasUnsavedChanges: (hasChanges: boolean) => void
  isLoading: boolean
  error: string | null
  isActivatorValid: boolean

  saveMacro: () => Promise<void>
  cancelEditing: () => void
  startRecording: () => void
  toggleModifierMode: () => void
}

const createDefaultMacroData = (): MacroData => ({
  name: "New Macro",
  enabled: true,
  type: "Hotkey",
  activator: "",
  loopMode: "Held",
  interrupt: true,
  repeatDelay: 100,
  modifiers: Modifiers.Any,
  modifierMode: "Inclusive",
  start: [],
  loop: [],
  finish: [],
  cooldown: 0,
})

const MacroEditorContext = createContext<MacroEditorContextType | undefined>(undefined)

interface MacroEditorProviderProps {
  children: React.ReactNode
  initialMacroData?: MacroData
  profileName: string
  macroId?: string | null
  macroName?: string | null
}

export function MacroEditorProvider({
  children,
  initialMacroData,
  profileName,
  macroId = null,
  macroName = null,
}: MacroEditorProviderProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [macro, setMacro] = useState<MacroData>(() => {
    if (initialMacroData) {
      const processedMacro = {
        ...initialMacroData,
        oldName: initialMacroData.name,
        start: initialMacroData.start.map((action) => ({
          ...action,
          id: action.id || uuidv4(),
        })),
        loop: initialMacroData.loop.map((action) => ({
          ...action,
          id: action.id || uuidv4(),
        })),
        finish: initialMacroData.finish.map((action) => ({
          ...action,
          id: action.id || uuidv4(),
        })),
      }
      console.log("Initialized macro with provided data:", processedMacro)
      return processedMacro
    }

    const defaultMacro = createDefaultMacroData()
    console.log("Initialized macro with default data:", defaultMacro)
    return defaultMacro
  })

  const [currentProfile] = useState<string>(profileName)
  const [currentMacroId] = useState<string | null>(macroId)
  const [currentMacroName] = useState<string | null>(macroName)
  const [isEditingExisting] = useState<boolean>(Boolean(macroId && macroName))

  const [activeTab, setActiveTab] = useState<string>("general")
  const [isRecording, setIsRecording] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeActionList, setActiveActionList] = useState<"start" | "loop" | "finish">("start")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isActivatorValid, setIsActivatorValid] = useState(validateActivator(macro.activator, macro.type).isValid)

  useEffect(() => {
    if (initialMacroData) {
      console.log("MacroEditorProvider initialized with:", {
        profile: profileName,
        macroId,
        macroName,
        isEditing: isEditingExisting,
        macroData: initialMacroData,
        isActivatorValid: validateActivator(macro.activator, macro.type).isValid
      })
    }
  }, [initialMacroData, profileName, macroId, macroName, isEditingExisting])

  const updateMacro = useCallback((updates: Partial<MacroData>) => {
    try {
      setMacro((prev) => {
        const updated = { ...prev, ...updates }
        const validation = validateActivator(updated.activator, updated.type)
        //console.log("Updating macro:", { previous: prev, updates, result: updated })
        setIsActivatorValid(validation.isValid)
        return updated
      })
      setHasUnsavedChanges(true)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update macro"
      console.error("Error updating macro:", errorMessage)
      setError(errorMessage)
    }
  }, [])

  const resetMacro = useCallback(() => {
    try {
      const defaultMacro = initialMacroData || createDefaultMacroData()
      setMacro(defaultMacro)
      setHasUnsavedChanges(false)
      setError(null)
      console.log("Reset macro to:", defaultMacro)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to reset macro"
      console.error("Error resetting macro:", errorMessage)
      setError(errorMessage)
    }
  }, [initialMacroData])

  const addAction = useCallback((listType: "start" | "loop" | "finish", action: Omit<MacroAction, "id">) => {
    try {
      const newAction: MacroAction = {
        id: uuidv4(),
        type: action.type,
        ...action,
      }

      setMacro((prev) => ({
        ...prev,
        [listType]: [...prev[listType], newAction],
      }))

      setHasUnsavedChanges(true)
      console.log(`Added action to ${listType}:`, newAction)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add action"
      console.error("Error adding action:", errorMessage)
      setError(errorMessage)
    }
  }, [])

  const updateAction = useCallback(
    (listType: "start" | "loop" | "finish", actionId: string, updates: Partial<Omit<MacroAction, "id">>) => {
      try {
        setMacro((prev) => ({
          ...prev,
          [listType]: prev[listType].map((action) => (action.id === actionId ? { ...action, ...updates } : action)),
        }))

        setHasUnsavedChanges(true)
        console.log(`Updated action ${actionId} in ${listType}:`, updates)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update action"
        console.error("Error updating action:", errorMessage)
        setError(errorMessage)
      }
    },
    [],
  )

  const removeAction = useCallback((listType: "start" | "loop" | "finish", actionId: string) => {
    try {
      setMacro((prev) => ({
        ...prev,
        [listType]: prev[listType].filter((action) => action.id !== actionId),
      }))

      setHasUnsavedChanges(true)
      console.log(`Removed action ${actionId} from ${listType}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to remove action"
      console.error("Error removing action:", errorMessage)
      setError(errorMessage)
    }
  }, [])

  const reorderActions = useCallback((listType: "start" | "loop" | "finish", newOrder: MacroAction[]) => {
    try {
      setMacro((prev) => ({
        ...prev,
        [listType]: newOrder,
      }))

      setHasUnsavedChanges(true)
      console.log(`Reordered actions in ${listType}:`, newOrder)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to reorder actions"
      console.error("Error reordering actions:", errorMessage)
      setError(errorMessage)
    }
  }, [])

  const moveActionBetweenLists = useCallback(
    (
      sourceListType: "start" | "loop" | "finish",
      destinationListType: "start" | "loop" | "finish",
      sourceIndex: number,
      destinationIndex: number,
    ) => {
      try {
        setMacro((prev) => {
          if (sourceListType === destinationListType) {
            const items = Array.from(prev[sourceListType])
            const [reorderedItem] = items.splice(sourceIndex, 1)
            items.splice(destinationIndex, 0, reorderedItem)

            return {
              ...prev,
              [sourceListType]: items,
            }
          }

          const sourceItems = Array.from(prev[sourceListType])
          const destinationItems = Array.from(prev[destinationListType])

          const [movedItem] = sourceItems.splice(sourceIndex, 1)

          destinationItems.splice(destinationIndex, 0, movedItem)

          return {
            ...prev,
            [sourceListType]: sourceItems,
            [destinationListType]: destinationItems,
          }
        })

        setHasUnsavedChanges(true)
        console.log(
          `Moved action from ${sourceListType}[${sourceIndex}] to ${destinationListType}[${destinationIndex}]`,
        )
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to move action between lists"
        console.error("Error moving action between lists:", errorMessage)
        setError(errorMessage)
      }
    },
    [],
  )

  const saveMacro = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)

      if (!currentProfile) {
        throw new Error("Profile is required")
      }

      const macroToSave = {
        ...macro,
        name: macro.name ? macro.name : macro.activator,
        start: macro.start.map(({ id, ...rest }) => rest),
        loop: macro.loop.map(({ id, ...rest }) => rest),
        finish: macro.finish.map(({ id, ...rest }) => rest),
        oldName: isEditingExisting ? macro.oldName : undefined,
      }

      console.log("Saving macro:", {
        profile: currentProfile,
        macroId: currentMacroId,
        isEditing: isEditingExisting,
        macro: macroToSave,
      })

      if (websocketService) {
        const saveData = {
          profile: currentProfile,
          macro: macroToSave,
          isEditing: isEditingExisting,
        }

        websocketService.send("saveMacro", saveData)

        await new Promise((resolve) => setTimeout(resolve, 1000))

        setHasUnsavedChanges(false)

        toast({
          title: isEditingExisting ? "Macro updated" : "Macro created",
          description: `${macro.name} has been ${isEditingExisting ? "updated" : "created"} successfully.`,
        })
        const queryParams = new URLSearchParams({
          profile: currentProfile
        })
        router.push(`/profiles?${queryParams}`)
      } else {
        throw new Error("WebSocket service is not available")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save macro"
      console.error("Error saving macro:", errorMessage)
      setError(errorMessage)

      toast({
        title: "Save failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [macro, currentProfile, currentMacroId, isEditingExisting, router, toast])

  const cancelEditing = useCallback(() => {
    try {
      if (hasUnsavedChanges) {
        if (window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
          router.push("/profiles")
        }
      } else {
        router.push("/profiles")
      }
    } catch (err) {
      console.error("Error during cancel:", err)
      router.push("/profiles")
    }
  }, [hasUnsavedChanges, router])

  const startRecording = useCallback(() => {
    try {
      setIsRecording(true)
      setHasUnsavedChanges(true)

      if (macro.activator) {
        updateMacro({ activator: "" })
      }

      console.log("Started recording")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to start recording"
      console.error("Error starting recording:", errorMessage)
      setError(errorMessage)
    }
  }, [macro.activator, updateMacro])

  const toggleModifierMode = useCallback(() => {
    try {
      const newMode = macro.modifierMode === "Inclusive" ? "Exclusive" : "Inclusive"
      updateMacro({ modifierMode: newMode })
      console.log("Toggled modifier mode to:", newMode)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to toggle modifier mode"
      console.error("Error toggling modifier mode:", errorMessage)
      setError(errorMessage)
    }
  }, [macro.modifierMode, updateMacro])

  const contextValue: MacroEditorContextType = {
    macro,
    updateMacro,
    resetMacro,
    currentProfile,
    currentMacroId,
    currentMacroName,
    isEditingExisting,
    addAction,
    updateAction,
    removeAction,
    reorderActions,
    moveActionBetweenLists,
    activeTab,
    setActiveTab,
    isRecording,
    setIsRecording,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    saveMacro,
    cancelEditing,
    startRecording,
    toggleModifierMode,
    sidebarCollapsed,
    setSidebarCollapsed,
    activeActionList,
    setActiveActionList,
    isLoading,
    error,
    isActivatorValid,
  }

  return <MacroEditorContext.Provider value={contextValue}>{children}</MacroEditorContext.Provider>
}

export function useMacroEditor() {
  const context = useContext(MacroEditorContext)
  if (context === undefined) {
    throw new Error("useMacroEditor must be used within a MacroEditorProvider")
  }
  return context
}
