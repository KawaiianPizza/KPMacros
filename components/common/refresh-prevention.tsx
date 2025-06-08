"use client"

import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export default function RefreshPrevention() {
  const { toast } = useToast()

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { title, description } = { title: "Refresh Disabled", description: "Once you leave this page, it will be unusable until you open the Macro Editor again from the tray icon." }

      // F5 and Ctrl F5
      if (event.key === "F5" || event.keyCode === 116) {
        event.preventDefault()
        toast({
          title,
          description,
          duration: 3000,
        })
        return false
      }

      // Ctrl+R
      if ((event.ctrlKey || event.metaKey) && event.key === "r") {
        event.preventDefault()
        toast({
          title,
          description,
          duration: 3000,
        })
        return false
      }
    }

    document.addEventListener("keydown", handleKeyDown, true)

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true)
    }
  }, [toast])

  return null
}
