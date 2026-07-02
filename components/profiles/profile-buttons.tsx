"use client"

import { Button } from "@/components/ui/button"
import { Plus, Pencil, Trash2, Trash } from "lucide-react"
import type { Profile } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "../ui/scroll-area"
import { ReactElement, useEffect, useRef, WheelEventHandler } from "react"

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
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    const handleWheel = (event: WheelEvent) => {
      console.log(scrollAreaRef)
      if (event.deltaY === 0) return;
      event.preventDefault();
      scrollArea.lastElementChild!.scrollLeft += event.deltaY;
    };

    scrollArea.addEventListener('wheel', handleWheel, { passive: false });
    return () => scrollArea.removeEventListener('wheel', handleWheel);
  }, []);
  return (
    <div className="relative">
      <ScrollArea ref={scrollAreaRef} className="h-full border border-border p-1 rounded-md bg-card blend-66 overflow-clip">
        <div className="flex space-x-1 h-12">
          {profiles.map((profile) => {
            const isSelected = selectedProfile === profile.name
            const isGlobal = isGlobalProfile(profile.name)

            return (
              <div key={profile.name} className="relative shrink-0 overflow-clip rounded-md border border-border bg-card transition-all duration-200 hover:border-active">
                <div className={cn("flex rounded-md h-full", isSelected && "border-active overflow-hidden")}>
                  <Button
                    variant="default"
                    className={cn("h-full min-w-[120px] self-center rounded-none border-none bg-transparent p-1 text-center whitespace-normal transition-all duration-200", isSelected && "text-active"
                    )}
                    onClick={() => onSelectProfile(profile.name)}
                  >
                    <span className="line-clamp-2 px-2">{profile.name}</span>
                  </Button>

                  <div className={cn("flex flex-col transition-all duration-200", isSelected && !isGlobal
                    ? "opacity-100 pointer-events-auto w-8"
                    : "opacity-0 pointer-events-none w-0")}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-full w-auto rounded-none border-r-0 border-t-0 hover:bg-input/65 hover:text-active"
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
                      className="h-full w-auto rounded-none border-0 border-l"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteProfile(profile)
                      }}
                      title="Delete Profile"
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}

          <Button
            variant="outline"
            className="h-full w-12 shrink-0 bg-card transition-all duration-200 hover:border-active"
            onClick={onNewProfile}
            title="Create New Profile"
          >
            <Plus />
          </Button>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
