"use client"

import { useState, useEffect, useCallback } from "react"
import { useWebSocketUI } from "./use-websocketUI"
import { useToast } from "./use-toast"
import type { Profile } from "@/lib/types"
import { useSearchParams } from "next/navigation"

const DEFAULT_PROFILES: Profile[] = [
  { name: "Global", windows: [] },
  { name: "Global Exclusive", windows: [] },
]

export function useProfiles() {
  const searchParams = useSearchParams()
  const [profiles, setProfiles] = useState<Profile[]>(DEFAULT_PROFILES)
  const [selectedProfile, setSelectedProfile] = useState<string>(searchParams.get("profile") || "Global")
  const [deletingProfile, setDeletingProfile] = useState<string>()
  const [isLoading, setIsLoading] = useState(false)
  const { send, on, off } = useWebSocketUI()
  const { toast } = useToast()

  const loadProfiles = useCallback(() => {
    setIsLoading(true)
    send("getProfiles", {})
  }, [send])

  const saveProfile = useCallback(
    (profile: Profile) => {
      setProfiles((prevProfiles) => {
        if (profile.oldName) {
          return prevProfiles.map((p) =>
            p.name === profile.oldName ? { name: profile.name, windows: profile.windows } : p,
          )
        } else {
          const globalProfiles = prevProfiles.filter((p) => p.name === "Global" || p.name === "Global Exclusive")
          const customProfiles = prevProfiles.filter((p) => p.name !== "Global" && p.name !== "Global Exclusive")
          return [...globalProfiles, ...customProfiles, { name: profile.name, windows: profile.windows }]
        }
      })

      send("saveProfile", profile)
    },
    [send],
  )

  const deleteProfile = useCallback(
    (profileName: string) => {
      send("deleteProfile", { name: profileName })
      setDeletingProfile(profileName)
    },
    [send],
  )

  useEffect(() => {
    const handleProfiles = (data: Profile[]) => {
      const globalProfile = data.find((p) => p.name === "Global") || DEFAULT_PROFILES[0]
      const globalExclusiveProfile = data.find((p) => p.name === "Global Exclusive") || DEFAULT_PROFILES[1]
      const otherProfiles = data.filter((p) => !["Global", "Global Exclusive"].includes(p.name))
      const profile = searchParams.get("profile")

      setProfiles([globalProfile, globalExclusiveProfile, ...otherProfiles])
      setIsLoading(false)
      setSelectedProfile(profile || "Global")
    }

    const handleProfileSaved = (response: { success?: string; error?: string; profile?: Profile }) => {
      if (response.success) {
        toast({
          title: "Profile saved",
          description: `Profile has been saved successfully.`,
        })
      } else if (response.error) {
        toast({
          title: "Error saving profile",
          description: response.error,
          variant: "destructive",
        })
      }
    }

    const handleProfileDeleted = (response: { success?: string; error?: string }) => {
      if (response.success) {
        toast({
          title: "Profile deleted",
          description: "Profile has been deleted successfully.",
        })
        setProfiles(prev => prev.filter(e => e.name !== deletingProfile))
      } else if (response.error) {
        toast({
          title: "Error deleting profile",
          description: response.error,
          variant: "destructive",
        })
      }
    }

    on("profiles", handleProfiles)
    on("profileSaved", handleProfileSaved)
    on("profileDeleted", handleProfileDeleted)

    return () => {
      off("profiles", handleProfiles)
      off("profileSaved", handleProfileSaved)
      off("profileDeleted", handleProfileDeleted)
    }
  }, [on, off, toast])

  return {
    profiles,
    selectedProfile,
    setSelectedProfile,
    isLoading,
    loadProfiles,
    saveProfile,
    deleteProfile,
  }
}
