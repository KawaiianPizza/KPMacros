"use client"

import { useState, useCallback, Suspense } from "react"
import { useRouter } from "next/navigation"
import React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CircleUserRound, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useProfiles } from "@/hooks/use-profiles"
import { useMacros } from "@/hooks/use-macros"
import type { Profile } from "@/lib/types"
import ProfileButtons from "@/components/profiles/profile-buttons"
import ProfileForm from "@/components/profiles/profile-form"
import ConfirmationDialog from "@/components/common/confirmation-dialog"
import LoadingSpinner from "@/components/common/loading-spinner"
import MacroList from "@/components/profiles/macro-list"
import { SettingsButton } from "@/components/settings/settings-button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useWebSocketUI } from "@/hooks/use-websocketUI"

function ProfilesContent() {
  const router = useRouter()
  const { toast } = useToast()

  const {
    profiles,
    selectedProfile,
    setSelectedProfile,
    isLoading: isLoadingProfiles,
    loadProfiles,
    saveProfile,
    deleteProfile,
  } = useProfiles()

  const {
    macros,
    isLoading: isLoadingMacros,
    updateMacro,
    renameMacro,
    deleteMacro,
    sendBatchedUpdates,
    sendModMacros
  } = useMacros(selectedProfile)

  const { send } = useWebSocketUI()

  const [showProfileForm, setShowProfileForm] = useState(false)
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null)
  const [isDeletingProfile, setIsDeletingProfile] = useState(false)

  React.useEffect(() => {
    send("testMacroStop", { clearMods: true })
    loadProfiles()
  }, [loadProfiles])

  const handleNewProfile = useCallback(() => {
    setEditingProfile(null)
    setShowProfileForm(true)
  }, [])

  const handleEditProfile = useCallback((profile: Profile) => {
    setEditingProfile(profile)
    setShowProfileForm(true)
  }, [])

  const handleDeleteProfile = useCallback((profile: Profile) => {
    setProfileToDelete(profile)
    setShowDeleteDialog(true)
  }, [])

  const confirmDeleteProfile = useCallback(async () => {
    if (!profileToDelete) return

    setIsDeletingProfile(true)
    try {
      deleteProfile(profileToDelete.name)

      if (selectedProfile === profileToDelete.name) {
        setSelectedProfile("Global")
      }

      setShowDeleteDialog(false)
      setProfileToDelete(null)
    } catch (error) {
      console.error("Error deleting profile:", error)
    } finally {
      setIsDeletingProfile(false)
    }
  }, [profileToDelete, selectedProfile, setSelectedProfile, deleteProfile])

  const handleSaveProfile = useCallback(
    (profile: Profile) => {
      saveProfile(profile)
      setShowProfileForm(false)
      setEditingProfile(null)
    },
    [saveProfile],
  )

  const handleCancelProfileForm = useCallback(() => {
    setShowProfileForm(false)
    setEditingProfile(null)
  }, [])

  const handleToggleEnabled = useCallback(
    (macroId: string, enabled: boolean) => {
      updateMacro(macroId, { enabled })

      const macro = macros.find((m) => m.id === macroId)
      if (macro) {
        toast({
          title: enabled ? "Macro enabled" : "Macro disabled",
          description: `${macro.name} has been ${enabled ? "enabled" : "disabled"}.`,
          duration: 2000,
        })
      }
    },
    [updateMacro, macros, toast],
  )

  const handleUpdateLoopMode = useCallback(
    (macroId: string, loopMode: "Held" | "Toggle") => {
      updateMacro(macroId, { loopMode })

      const macro = macros.find((m) => m.id === macroId)
      if (macro) {
        toast({
          title: "Loop mode updated",
          description: `${macro.name} loop mode changed to ${loopMode}.`,
          duration: 2000,
        })
      }
    },
    [updateMacro, macros, toast],
  )

  const handleEditMacro = useCallback(
    (macroId: string) => {
      const macro = macros.find((m) => m.id === macroId)
      if (!macro) return

      sendBatchedUpdates()
      sendModMacros()

      const queryParams = new URLSearchParams({
        profile: selectedProfile,
        macroId,
        macroName: macro.name,
        macroData: JSON.stringify(macro),
      })
      router.push(`/macro-editor?${queryParams.toString()}`)
    },
    [macros, selectedProfile, router, sendBatchedUpdates, sendModMacros],
  )

  const handleRenameMacro = useCallback(
    (macroId: string) => {
      const macro = macros.find((m) => m.id === macroId)
      if (!macro) return

      const newName = prompt("Enter new macro name:", macro.name)
      if (!newName || newName === macro.name || !newName.trim()) return

      const trimmedName = newName.trim()
      renameMacro(macroId, trimmedName)

      toast({
        title: "Macro renamed",
        description: `Macro renamed from "${macro.name}" to "${trimmedName}".`,
      })
    },
    [macros, renameMacro, toast],
  )

  const handleDeleteMacro = useCallback(
    (macroId: string) => {
      const macro = macros.find((m) => m.id === macroId)
      if (!macro) return

      if (!window.confirm(`Are you sure you want to delete the macro "${macro.name}"?`)) return

      deleteMacro(macroId)

      toast({
        title: "Macro deleted",
        description: `"${macro.name}" has been deleted.`,
      })
    },
    [macros, deleteMacro, toast],
  )

  const handleCreateNewMacro = useCallback(() => {
    sendBatchedUpdates()
    sendModMacros()

    const queryParams = new URLSearchParams({ profile: selectedProfile })
    router.push(`/macro-editor?${queryParams.toString()}`)
  }, [selectedProfile, router, sendBatchedUpdates, sendModMacros])

  return (
    <main className="min-h-screen bg-background">
      <ScrollArea>
        <div className="container mx-auto px-6 py-3 space-y-3 max-h-dvh">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex justify-between text-center text-foreground">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CircleUserRound className="h-5 w-5" />
                  Profiles
                </CardTitle>
                <SettingsButton />
              </div>
              <CardDescription>Select a profile to view and manage its macros</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingProfiles ? (
                <LoadingSpinner text="Loading profiles..." />
              ) : (
                <ProfileButtons
                  profiles={profiles}
                  selectedProfile={selectedProfile}
                  onSelectProfile={setSelectedProfile}
                  onNewProfile={handleNewProfile}
                  onEditProfile={handleEditProfile}
                  onDeleteProfile={handleDeleteProfile}
                />
              )}
            </CardContent>
          </Card>

          <MacroList
            macros={macros}
            isLoading={isLoadingMacros}
            selectedProfile={selectedProfile}
            onToggleEnabled={handleToggleEnabled}
            onUpdateLoopMode={handleUpdateLoopMode}
            onEditMacro={handleEditMacro}
            onRenameMacro={handleRenameMacro}
            onDeleteMacro={handleDeleteMacro}
            onCreateNewMacro={handleCreateNewMacro}
          />

          {showProfileForm && (
            <ProfileForm
              profile={editingProfile}
              profiles={profiles}
              onSave={handleSaveProfile}
              onCancel={handleCancelProfileForm}
            />
          )}

          <ConfirmationDialog
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            title="Delete Profile"
            description={`Are you sure you want to delete the profile "${profileToDelete?.name}"? This action cannot be undone and will also delete all macros associated with this profile.`}
            confirmText="Delete"
            variant="destructive"
            isLoading={isDeletingProfile}
            onConfirm={confirmDeleteProfile}
          />
        </div>
      </ScrollArea>
    </main>
  )
}

export default function ProfilesPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Loading profiles page..." className="p-12" />}>
      <ProfilesContent />
    </Suspense>
  )
}
