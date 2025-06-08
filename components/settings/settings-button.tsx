"use client"

import { useState } from "react"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SettingsDialog } from "./settings-dialog"

export function SettingsButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button variant="outline" size="icon" onClick={() => setIsOpen(true)} className="h-9 w-9">
        <Settings className="h-4 w-4" />
        <span className="sr-only">Open settings</span>
      </Button>
      <SettingsDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  )
}
