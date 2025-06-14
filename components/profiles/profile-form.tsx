"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import type { Profile, Window } from "@/lib/types"
import websocketService from "@/lib/websocket-service"
import { validateWindowsFilename } from "@/lib/validation-utils"
import { v4 as uuidv4 } from "uuid"
import { cn } from "@/lib/utils"

interface ProfileFormProps {
  profile: Profile | null
  profiles: Profile[]
  onSave: (profile: Profile) => void
  onCancel: () => void
}

export default function ProfileForm({ profile, profiles, onSave, onCancel }: ProfileFormProps) {
  const [name, setName] = useState(profile?.name || "")
  const [windows, setWindows] = useState<Window[]>([])
  const [selectedWindows, setSelectedWindows] = useState<string[]>(profile?.windows || [])
  const [errors, setErrors] = useState<{ name?: string; windows?: string }>({})
  const [isLoadingWindows, setIsLoadingWindows] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [customWindows, setCustomWindows] = useState<Window[]>([])

  useEffect(() => {
    if (!websocketService) return

    const handleWindows = (data: Window[]) => {
      setTimeout(() => {
        websocketService?.send("getWindows", {})
      }, 5000);
      console.log("Received windows:", data)
      setWindows(data)

      if (profile?.windows && profile.windows.length > 0) {
        const missingWindows = profile.windows
          .filter((executable) => !data.some((w) => w.executable === executable))
          .map((executable) => ({
            executable,
            title: executable, // Use executable as title when title is undefined
            pid: uuidv4()
          }))

        if (missingWindows.length > 0) {
          setCustomWindows(missingWindows)
        }
      }

      setIsLoadingWindows(false)
    }

    const handleError = (error: any) => {
      console.error("Error fetching windows:", error)
      setIsLoadingWindows(false)
    }

    websocketService.on("windows", handleWindows)
    websocketService.on("error", handleError)

    websocketService.send("getWindows", {})

    return () => {
      websocketService?.off("windows", handleWindows)
      websocketService?.off("error", handleError)
    }
  }, [profile])

  const validateForm = (): boolean => {
    const newErrors: { name?: string; windows?: string } = {}

    const trimmedName = name.trim()
    const nameError = validateWindowsFilename(trimmedName)

    if (nameError) {
      newErrors.name = nameError
    } else if (
      profiles.some(
        (p) =>
          p.name.toLowerCase() === trimmedName.toLowerCase() &&
          (!profile || p.name.toLowerCase() !== profile.name.toLowerCase()),
      )
    ) {
      newErrors.name = "Profile name already exists"
    } else if (trimmedName.toLowerCase() === "global" || trimmedName.toLowerCase() === "global exclusive") {
      newErrors.name = "Reserved profile name"
    }

    if (selectedWindows.length === 0) {
      newErrors.windows = "At least one window must be selected"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    setName(newName)

    const trimmedName = newName.trim()
    const nameError = validateWindowsFilename(trimmedName)

    if (nameError) {
      setErrors((prev) => ({ ...prev, name: nameError }))
    } else if (
      profiles.some(
        (p) =>
          p.name.toLowerCase() === trimmedName.toLowerCase() &&
          (!profile || p.name.toLowerCase() !== profile.name.toLowerCase()),
      )
    ) {
      setErrors((prev) => ({ ...prev, name: "Profile name already exists" }))
    } else if (trimmedName.toLowerCase() === "global" || trimmedName.toLowerCase() === "global exclusive") {
      setErrors((prev) => ({ ...prev, name: "Reserved profile name" }))
    } else {
      setErrors((prev) => ({ ...prev, name: undefined }))
    }
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)

    try {
      const profileData: Profile = {
        name: name.trim(),
        windows: selectedWindows,
        ...(profile && { oldName: profile.name }),
      }

      onSave(profileData)
    } catch (error) {
      console.error("Error saving profile:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleWindow = (window: Window) => {
    if (!name)
      setName(window.title.replaceAll(/[\\/:*?"<>|]/g, ""))
    setSelectedWindows((prev) => {
      const newSelection = prev.includes(window.executable)
        ? prev.filter((id) => id !== window.executable)
        : [...prev, window.executable]

      if (errors.windows && newSelection.length > 0) {
        setErrors((prevErrors) => ({ ...prevErrors, windows: undefined }))
      }

      return newSelection
    })
  }

  const allWindows = [...windows, ...customWindows.filter((cw) => !windows.some((w) => w.executable === cw.executable))]

  const isFormValid = !errors.name && !errors.windows && name.trim().length > 0 && selectedWindows.length > 0

  return (
    <Dialog open={true} onOpenChange={() => !isSaving && onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {profile ? `Edit Profile: ${profile.name}` : "Create New Profile"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-medium">
              Profile Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={handleNameChange}
              placeholder="Enter profile name..."
              className={cn("border-border",
                errors.name && "border-destructive focus-visible:ring-destructive")}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "profile-name-error" : undefined}
              disabled={isSaving}
            />
            {errors.name && (
              <p className="text-destructive text-sm" id="profile-name-error">
                {errors.name}
              </p>
            )}
            <p className="text-xs text-foreground/65">
              Profile name must not contain invalid characters (\ / : * ? " &lt; &gt; |), cannot be empty, and must be
              unique.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground font-medium">Associated Windows</Label>

            {errors.windows && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.windows}</AlertDescription>
              </Alert>
            )}

            <div className="border border-border rounded-md bg-background">
              <ScrollArea className="h-[250px] p-3">
                {isLoadingWindows ? (
                  <div className="flex items-center justify-center py-8 text-foreground/65">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading available windows...
                  </div>
                ) : allWindows.length === 0 ? (
                  <div className="text-center py-8 text-foreground/65">
                    <p>No windows available</p>
                    <p className="text-xs mt-1">Make sure some applications are running</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allWindows.map((window, index) => ({ ...window, index }))
                      .sort((a, b) => {
                        const aIndex = selectedWindows.indexOf(a.executable);
                        const bIndex = selectedWindows.indexOf(b.executable);

                        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                        if (aIndex !== -1) return -1;
                        if (bIndex !== -1) return 1;
                        return a.index - b.index;
                      }).map((window) => (
                        <div key={window.pid} className="flex items-start space-x-3 p-2 border border-border rounded bg-card text-primary-foreground hover:bg-secondary/65 hover:border-accent" onClick={() => toggleWindow(window)}>
                          <Checkbox
                            id={`window-${window.executable}`}
                            checked={selectedWindows.includes(window.executable)}
                            className="mt-0.5"
                            disabled={isSaving}
                          />
                          <div className="flex-1 min-w-0">
                            <Label
                              htmlFor={`window-${window.executable}`}
                              className="text-foreground font-medium block pointer-events-none"
                            >
                              {window.title || window.executable}
                            </Label>
                            {window.title && window.title !== window.executable && (
                              <p className="text-xs text-foreground/65 mt-1 font-mono cursor-default">{window.executable}</p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            <p className="text-xs text-foreground/65">
              Select one or more windows that this profile should be active for.
              {selectedWindows.length > 0 && ` (${selectedWindows.length} selected)`}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving} className="border-border bg-primary text-primary-foreground hover:bg-primary/65">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!isFormValid || isSaving}
            className="bg-primary text-primary-foreground hover:bg-primary/65"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {profile ? "Updating..." : "Creating..."}
              </>
            ) : profile ? (
              "Update Profile"
            ) : (
              "Create Profile"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
