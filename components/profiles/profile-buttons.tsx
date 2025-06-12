"use client"

import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2 } from "lucide-react"
import type { Profile } from "@/lib/types"
import { cn } from "@/lib/utils"

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
                    className={cn("h-16 whitespace-normal text-center transition-all duration-200 min-w-[120px]",
                      isSelected && "border-2 border-accent hover:bg-primary", isSelected && !isGlobal && "rounded-r-none border-r-0"
                    )}
                    onClick={() => onSelectProfile(profile.name)}
                  >
                    <span className="line-clamp-2 px-2">{profile.name}</span>
                  </Button>

                  <div className={cn("flex flex-col border-accent transition-all duration-200 rounded-r-md overflow-hidden", isSelected && !isGlobal
                    ? "opacity-100 pointer-events-auto w-8 border-2 border-l-0"
                    : "opacity-0 pointer-events-none w-0 border-0")}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-full w-auto rounded-none rounded-l-none rounded-br-none p-0 border-none"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditProfile(profile)
                      }}
                      title="Edit Profile"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-full w-auto rounded-none rounded-l-none rounded-tr-none border-l-0 border-t-0 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteProfile(profile)
                      }}
                      title="Delete Profile"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}

          <Button
            variant="outline"
            className="h-16 w-16 flex-shrink-0 hover:bg-primary/65 hover:border-primary bg-primary text-primary-foreground"
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
