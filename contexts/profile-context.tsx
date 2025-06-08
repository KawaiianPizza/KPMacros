"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface ProfileContextType {
  selectedProfile: string
  setSelectedProfile: (profile: string) => void
  selectedMacro: string | null
  setSelectedMacro: (macro: string | null) => void
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [selectedProfile, setSelectedProfile] = useState<string>("Global")
  const [selectedMacro, setSelectedMacro] = useState<string | null>(null)

  return (
    <ProfileContext.Provider
      value={{
        selectedProfile,
        setSelectedProfile,
        selectedMacro,
        setSelectedMacro,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfiles() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error("useProfiles must be used within a ProfileProvider")
  }
  return context
}
