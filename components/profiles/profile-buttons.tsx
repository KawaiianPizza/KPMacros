"use client"

import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { Profile } from "@/lib/types"

interface ProfileButtonsProps {
  profiles: Profile[]
  selectedProfile: string
  onSelectProfile: (profileName: string) => void
  onNewProfile: () => void
  onEditProfile: (profile: Profile) => void
  onDeleteProfile: (profile: Profile) => void
}

export default function ProfileButtons({
  profiles,
  selectedProfile,
  onSelectProfile,
  onNewProfile,
  onEditProfile,
  onDeleteProfile,
}: ProfileButtonsProps) {
  const isGlobalProfile = (profileName: string) => profileName === "Global" || profileName === "Global Exclusive"

  return (
    <div className="relative">
      <div className="flex overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <div className="flex space-x-2">
          {profiles.map((profile) => {
            const isSelected = selectedProfile === profile.name
            const isGlobal = isGlobalProfile(profile.name)

            return (
              <div key={profile.name} className="relative flex-shrink-0">
                <div className="flex">
                  <Button
                    variant={isSelected ? "default" : "outline"}
                    className={`h-16 whitespace-normal text-center transition-all duration-200 ${
                      isSelected
                        ? "border-2 border-primary bg-primary text-primary-foreground hover:bg-primary/90"
                        : "hover:bg-muted/50"
                    } ${
                      isGlobal
                        ? "border-primary/30 min-w-[120px]"
                        : isSelected
                          ? "rounded-r-none min-w-[120px]"
                          : "min-w-[120px]"
                    }`}
                    onClick={() => onSelectProfile(profile.name)}
                  >
                    <span className="line-clamp-2 px-2">{profile.name}</span>
                  </Button>

                  {isSelected && !isGlobal && (
                    <div className="flex flex-col">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 rounded-l-none rounded-br-none border-l-0 p-0 hover:bg-muted/70"
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditProfile(profile)
                        }}
                        title="Edit Profile"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 rounded-l-none rounded-tr-none border-l-0 border-t-0 p-0 hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteProfile(profile)
                        }}
                        title="Delete Profile"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          <Button
            variant="outline"
            className="h-16 w-16 flex-shrink-0 hover:bg-primary/10 hover:border-primary/50"
            onClick={onNewProfile}
            title="Create New Profile"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  )
}
