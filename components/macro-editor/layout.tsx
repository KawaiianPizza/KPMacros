"use client"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, AlertTriangle, Loader2 } from "lucide-react"
import { useMacroEditor } from "@/contexts/macro-editor-context"
import GeneralTab from "@/components/macro-editor/general-tab"
import ActionsTab from "@/components/macro-editor/actions-tab"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
    sidebarCollapsed,
    isActivatorValid
  } = useMacroEditor()

  const handleTabChange = (value: string) => {
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
      case "actions":
        return <ActionsTab />
      case "general":
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
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">{getPageTitle()}</h1>
        {hasUnsavedChanges && (
          <span className="ml-3 text-sm text-amber-600 dark:text-amber-400">• Unsaved changes</span>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-6">
        <div
          className={`bg-secondary rounded-lg border border-border transition-all duration-300 ${
            sidebarCollapsed ? "flex-1" : "flex-1 lg:flex-[2]"
          }`}
        >
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-6">
              {renderTabContent()}

              <div className="flex justify-end space-x-2 pt-4 border-t border-border mt-6">
                <Button variant="outline" onClick={cancelEditing} disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={saveMacro} className="bg-primary text-primary-foreground" disabled={isLoading || !isActivatorValid}>
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
      </div>
    </div>
  )
}
