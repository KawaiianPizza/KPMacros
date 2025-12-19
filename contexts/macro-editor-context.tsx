"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { validateActivator } from "@/lib/validation-utils"
import { MacroAction, MacroData, Modifiers, WebSocketMessage, WSUIMessage } from "@/lib/types"
import { useWebSocketUI } from "@/hooks/use-websocketUI"


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
  addAction: (listType: "start" | "loop" | "finish", action: MacroAction) => void
  lastAddedActionId: string | undefined
  setLastAddedActionId: (id: string) => void
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
  isTesting: boolean
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  activeActionList: "start" | "loop" | "finish"
  setActiveActionList: (list: "start" | "loop" | "finish") => void
  audioDevices: string[]

  // Form state
  hasUnsavedChanges: boolean
  setHasUnsavedChanges: (hasChanges: boolean) => void
  isLoading: boolean
  error: string | null
  isActivatorValid: boolean

  saveMacro: () => Promise<void>
  cancelEditing: () => void
  startRecording: () => void
  toggleTesting: () => void
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
  mod: false
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
  const { send, on, once, off } = useWebSocketUI()
  const { toast } = useToast()

  const [macro, setMacro] = useState<MacroData>(() => {
    if (initialMacroData) {
      const processedMacro = {
        ...initialMacroData,
        oldName: initialMacroData.name,
        start: initialMacroData.start.map((action) => ({
          ...action,
          id: action.id || crypto.randomUUID(),
        })),
        loop: initialMacroData.loop.map((action) => ({
          ...action,
          id: action.id || crypto.randomUUID(),
        })),
        finish: initialMacroData.finish.map((action) => ({
          ...action,
          id: action.id || crypto.randomUUID(),
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
  const [isEditingExisting] = useState<boolean>(Boolean(macroName))

  const [activeTab, setActiveTab] = useState<string>("General")
  const [isRecording, setIsRecording] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [activeActionList, setActiveActionList] = useState<"start" | "loop" | "finish">("start")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isActivatorValid, setIsActivatorValid] = useState(validateActivator(macro.activator, macro.type).isValid)
  const [isTesting, setIsTesting] = useState(false)
  const [audioDevices, setAudioDevices] = useState<string[]>([])
  const [lastAddedActionId, setLastAddedActionId] = useState<string>()

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
      if (isTesting)
        toggleTesting()

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
  }, [isTesting])

  const resetMacro = useCallback(() => {
    try {
      if (isTesting)
        toggleTesting()

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
  }, [initialMacroData, isTesting])

  const addAction = useCallback((listType: "start" | "loop" | "finish", action: MacroAction) => {
    try {
      if (isTesting)
        toggleTesting()

      setMacro((prev) => ({
        ...prev,
        [listType]: [...prev[listType], action],
      }))
      setLastAddedActionId(action.id)
      setHasUnsavedChanges(true)
      console.log(`Added action to ${listType}:`, action)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add action"
      console.error("Error adding action:", errorMessage)
      setError(errorMessage)
    }
  }, [isTesting])

  const updateAction = useCallback(
    (listType: "start" | "loop" | "finish", actionId: string, updates: Partial<Omit<MacroAction, "id">>) => {
      try {
        if (isTesting)
          toggleTesting()

        setMacro((prev) => ({
          ...prev,
          [listType]: prev[listType].map((action) => {
            if(action.id !== actionId) return action
            const updatedAction = { ...action, ...updates }
            Object.keys(updatedAction).forEach(key => (updatedAction as any)[key] === undefined && delete (updatedAction as any)[key])
            return updatedAction
          }),
        }))

        setHasUnsavedChanges(true)
        console.log(`Updated action ${actionId} in ${listType}:`, updates)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to update action"
        console.error("Error updating action:", errorMessage)
        setError(errorMessage)
      }
    },
    [isTesting],
  )

  const removeAction = useCallback((listType: "start" | "loop" | "finish", actionId: string) => {
    try {
      if (isTesting)
        toggleTesting()

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
  }, [isTesting])

  const reorderActions = useCallback((listType: "start" | "loop" | "finish", newOrder: MacroAction[]) => {
    try {
      if (isTesting)
        toggleTesting()

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
  }, [isTesting])

  const moveActionBetweenLists = useCallback(
    (
      sourceListType: "start" | "loop" | "finish",
      destinationListType: "start" | "loop" | "finish",
      sourceIndex: number,
      destinationIndex: number,
    ) => {
      try {
        if (isTesting)
          toggleTesting()
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
    [isTesting],
  )

  const saveMacro = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setError(null)

    if (!currentProfile) {
      throw new Error("Profile is required")
    }

    const macroToSave = macro.mod ? {
      name: macro.name ? macro.name : macro.activator,
      oldName: isEditingExisting ? macro.oldName : undefined,
      activator: macro.activator,
      modifiers: macro.modifiers,
      enabled: macro.enabled,
      interrupt: macro.interrupt,
      modifierMode: macro.modifierMode,
      mod: macro.mod,
    } : {
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

    const saveData = {
      profile: currentProfile,
      macro: macroToSave,
      isEditing: isEditingExisting,
    }
    const macroSaved = ({ message, success, error }: WSUIMessage) => {
      console.log(message, success, error)
      setHasUnsavedChanges(false)
      if (success) {
        toast({
          title: isEditingExisting ? "Macro updated" : "Macro created",
          description: `${macro.name} has been ${isEditingExisting ? "updated" : "created"} successfully.`,
          duration: 2000
        })
        const queryParams = new URLSearchParams({
          profile: currentProfile
        })
        router.push(`/profiles?${queryParams}`)
      }
      if (error) {
        const errorMessage = message || "Failed to save macro"
        console.error("Error saving macro:", errorMessage)
        setError(errorMessage)

        toast({
          title: "Save failed",
          description: errorMessage,
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }
    once("saveMacro", saveData, macroSaved)
  }, [macro, currentProfile, currentMacroId, isEditingExisting, router, toast])

  const toggleTesting = useCallback(async (): Promise<void> => {
    try {
      setError(null)
      setIsTesting(prev => !prev)
      if (isTesting) {
        send("testMacroStop", { profile: currentProfile, clearMods: false })
        return
      }
      if (!currentProfile) {
        throw new Error("Profile is required")
      }

      const macroToTest = {
        ...macro,
        start: macro.start.map(({ id, ...rest }) => rest),
        loop: macro.loop.map(({ id, ...rest }) => rest),
        finish: macro.finish.map(({ id, ...rest }) => rest),
      }

      console.log("Testing macro:", {
        profile: currentProfile,
        macro: macroToTest,
      })

      const macroData = {
        profile: currentProfile,
        macro: macroToTest,
      }

      send("testMacro", macroData)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to test macro"
      console.error("Error testing macro:", errorMessage)
      setError(errorMessage)

      toast({
        title: "Cannot test macro",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }, [macro, profileName, toast, isTesting, setIsTesting])

  const cancelEditing = useCallback(() => {
    const queryParams = new URLSearchParams({
      profile: currentProfile
    })
    try {
      if (hasUnsavedChanges && !window.confirm("You have unsaved changes. Are you sure you want to leave?")) return
    } catch (err) {
      console.error("Error during cancel:", err)
    }
    router.push(`/profiles?${queryParams}`)
  }, [hasUnsavedChanges, router])

  const startRecording = useCallback(() => {
    try {
      if (macro.type !== "Hotkey") return

      setIsRecording(true)
      setHasUnsavedChanges(true)

      console.log("Started recording")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to start recording"
      console.error("Error starting recording:", errorMessage)
      setError(errorMessage)
    }
  }, [macro.activator, macro.type, updateMacro])

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

  useEffect(() => {
    const handleAudioDevices = (data: string[]) => {
      setAudioDevices(data)
    }
    once("getAudioDevices", {}, handleAudioDevices)
  }, [])

  const contextValue: MacroEditorContextType = {
    macro,
    updateMacro,
    resetMacro,
    currentProfile,
    currentMacroId,
    currentMacroName,
    isEditingExisting,
    addAction,
    lastAddedActionId,
    setLastAddedActionId,
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
    isTesting,
    toggleTesting,
    audioDevices
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
