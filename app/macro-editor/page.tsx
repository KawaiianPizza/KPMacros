"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import MacroEditorLayout from "@/components/macro-editor/layout"
import { MacroEditorProvider } from "@/contexts/macro-editor-context"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MacroData, Modifiers } from "@/lib/types"
import websocketService from "@/lib/websocket-service"


export default function MacroEditorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [parsedMacroData, setParsedMacroData] = useState<MacroData | null>(null)
  const [profileName, setProfileName] = useState<string>("")
  const [macroName, setMacroName] = useState<string | null>(null)

  useEffect(() => {
    try {
      setIsLoading(true)
      setError(null)

      const profile = searchParams.get("profile")
      const name = searchParams.get("macroName")
      const macroDataString = searchParams.get("macroData")

      console.log("Macro Editor Parameters:", {
        profile,
        macroName: name,
        macroData: macroDataString ? "Present" : "Not provided",
      })

      if (!profile) {
        throw new Error("Profile parameter is required")
      }

      setProfileName(profile)
      setMacroName(name)

      if (macroDataString) {
        try {
          const parsedData = JSON.parse(decodeURIComponent(macroDataString))

          if (!parsedData || typeof parsedData !== "object") {
            throw new Error("Invalid macro data format")
          }

          const validatedMacroData: MacroData = {
            name: parsedData.name || name || "Untitled Macro",
            enabled: typeof parsedData.enabled === "boolean" ? parsedData.enabled : true,
            mod: parsedData.mod || false,
            type: ["Hotkey", "Command"].includes(parsedData.type) ? parsedData.type : "Hotkey",
            activator: typeof parsedData.activator === "string" ? parsedData.activator : "",
            loopMode: ["Held", "Toggle"].includes(parsedData.loopMode) ? parsedData.loopMode : "Held",
            interrupt: typeof parsedData.interrupt === "boolean" ? parsedData.interrupt : true,
            repeatDelay: typeof parsedData.repeatDelay === "number" ? parsedData.repeatDelay : 100,
            modifiers: typeof parsedData.modifiers === "number" ? parsedData.modifiers : 0,
            modifierMode: ["Inclusive", "Exclusive"].includes(parsedData.modifierMode) ? parsedData.modifierMode : "Inclusive",
            start: Array.isArray(parsedData.start) ? parsedData.start : [],
            loop: Array.isArray(parsedData.loop) ? parsedData.loop : [],
            finish: Array.isArray(parsedData.finish) ? parsedData.finish : [],
            cooldown: typeof parsedData.cooldown === "number" ? parsedData.cooldown : 0
          }

          setParsedMacroData(validatedMacroData)
          console.log("Successfully parsed macro data:", validatedMacroData)
        } catch (parseError) {
          console.error("Error parsing macro data:", parseError)
          throw new Error(
            `Failed to parse macro data: ${parseError instanceof Error ? parseError.message : "Unknown error"}`,
          )
        }
      } else {
        const defaultMacroData: MacroData = {
          name: "",
          enabled: true,
          mod: false,
          type: "Hotkey",
          activator: "",
          loopMode: "Held",
          interrupt: true,
          repeatDelay: 100,
          modifiers: 0 as Modifiers,
          modifierMode: "Inclusive",
          start: [],
          loop: [],
          finish: [],
          cooldown: 0
        }

        setParsedMacroData(defaultMacroData)
        console.log("Creating new macro with default data:", defaultMacroData)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      console.error("Macro Editor initialization error:", errorMessage)
      setError(errorMessage)

      toast({
        title: "Error loading macro editor",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [searchParams, toast])

  const handleGoBack = () => {
    router.push("/profiles")
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background p-4 text-foreground">
        <div className="container mx-auto max-w-5xl">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-foreground/65">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-transparent" />
              <span>Loading Macro Editor...</span>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error || !parsedMacroData || !profileName) {
    return (
      <main className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-5xl">
          <Card className="border-red-600">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <AlertTriangle className="h-6 w-6" />
                <h2 className="text-lg font-semibold">Error Loading Macro Editor</h2>
              </div>
              <p className="text-foreground/65 mb-4">
                {error || "Failed to load macro editor. Missing required parameters."}
              </p>
              <button
                onClick={handleGoBack}
                className="px-4 py-2 bg-input text-input-text rounded-md transition-colors"
                type="button"
              >
                Return to Profiles
              </button>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <MacroEditorProvider
      initialMacroData={parsedMacroData}
      profileName={profileName}
      macroName={macroName}
    >
      <main className="min-h-screen bg-background p-4">
        <MacroEditorLayout />
      </main>
    </MacroEditorProvider>
  )
}
