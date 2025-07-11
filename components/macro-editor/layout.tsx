"use client"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Save, AlertTriangle, Loader2 } from "lucide-react"
import { useMacroEditor } from "@/contexts/macro-editor-context"
import GeneralTab from "@/components/macro-editor/general-tab"
import ActionsTab from "@/components/macro-editor/actions-tab"
import { Alert, AlertDescription } from "@/components/ui/alert"
import TypeSwitch from "../common/type-switch"
import { Card } from "../ui/card"
import { cn } from "@/lib/utils"

export default function MacroEditorLayout() {
  const {
    activeTab,
    setActiveTab,
    hasUnsavedChanges,
    saveMacro,
    cancelEditing,
    isEditingExisting,
    currentMacroName,
    macro,
    isLoading,
    error,
    isActivatorValid,
    toggleTesting,
    isTesting,
    isRecording
  } = useMacroEditor()

  const handleTabChange = (value: string) => {
    if (!macro.mod)
      setActiveTab(value)
  }

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ""
        return ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  const renderTabContent = () => {
    switch (activeTab) {
      case "Actions":
        return <ActionsTab />
      case "General":
      default:
        return <GeneralTab />
    }
  }

  const getPageTitle = () => {
    if (isEditingExisting && currentMacroName) {
      return `Edit Macro: ${currentMacroName}`
    }
    if (isEditingExisting && macro.name) {
      return `Edit Macro: ${macro.name}`
    }
    return "New Macro"
  }

  return (
    <div className="container mx-auto max-w-7xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={cancelEditing} className="mr-2">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">{getPageTitle()}</h1>
        {hasUnsavedChanges && (
          <span className="ml-3 text-sm text-active">• Unsaved changes</span>
        )}
        <Button disabled={isRecording} onClick={toggleTesting} className={cn("ml-auto", isTesting && "border-active")}>{isTesting ? "Testing Macro..." : "Test Macro"}</Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="flex gap-6">
        <div className="rounded-lg border border-border transition-all duration-300 flex-1 overflow-hidden">
          <div className="p-6">
            <TypeSwitch options={["General", "Actions"]} disabled={macro.mod ? "Actions" : undefined} value={activeTab} onValueChange={handleTabChange} className="w-full mb-6" />
            <div className="space-y-6">
              {renderTabContent()}
              <div className="flex justify-end space-x-2 pt-4 border-t border-border mt-6">
                <Button variant="outline" onClick={cancelEditing} disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={saveMacro} disabled={isLoading || !isActivatorValid}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditingExisting ? "Update Macro" : "Save Macro"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
