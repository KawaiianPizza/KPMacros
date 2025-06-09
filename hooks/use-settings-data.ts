"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import websocketService from "@/lib/websocket-service"
import { useToast } from "@/components/ui/use-toast"

export type SettingValue = boolean | string | number | undefined

export interface Setting {
  value: SettingValue | any
  label: string
  description: string
  link?: string
  links?: string[]
  disabled?: boolean
}

export interface SettingsData {
  [groupKey: string]: {
    [settingKey: string]: Setting
  }
}

const defaultSettings: SettingsData = {
  general: {
    runAsAdmin: {
      value: false,
      label: "Run as administrator",
      description:
        "Run KPMacros with elevated privileges. Needed to work on elevated processes. (KPMacros needs to be restarted to take effect)",
    },
    runAtStartup: {
      value: false,
      label: "Run at startup",
      description: "Automatically start the application when your computer boots",
    },
  },
  updates: {
    checkForUpdates: {
      value: true,
      label: "Check for updates",
      description: "Automatically check for application updates on startup",
    },
    autoUpdateUI: {
      value: true,
      label: "Auto-update UI",
      description: "Automatically download and install UI updates without prompting",
      disabled: false
    },
  },
  about: {
    info: {
      value: undefined,
      label: "Application Information",
      description: "Author: KawaiianPizza\n" + "",
    },
    discord: {
      value: undefined,
      label: "Discord",
      description: "Need help or have a suggestion? Join the Discord and let me know! :D",
      link: "https://discord.gg/GVCzVagyu7",
    },
    supportMe: {
      value: {},
      label: "Support me",
      description: "Here are some ways to support me and the development of KPMacros 💝",
      links: [
        "https://streamelements.com/kawaiianpizza/tip",
        "https://www.paypal.me/kawaiianpizza",
        "https://www.patreon.com/KawaiianPizza",
        "https://boosty.to/kawaiianpizza",
      ]
    },
    github: {
      value: undefined,
      label: "Source code",
      description: "View the source code on Github",
      link: "https://github.com/KawaiianPizza/KPMacros",
    },
  },
}

export function useSettingsData() {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings)
  const [isSaving, setIsSaving] = useState(false)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const handleSettings = (data: SettingsData) => {
      const newSettings = { ...defaultSettings }
      for (const group in data) {
        for (const key in data[group]) {
          newSettings[group][key].value = data[group][key]
        }
      }
      if (newSettings.updates?.autoUpdateUI && newSettings.updates?.checkForUpdates) {
        newSettings.updates.autoUpdateUI.disabled = !newSettings.updates.checkForUpdates.value
      }
      setSettings(newSettings)
    }
    const handleSettingsSaved = (response: { success?: "Success"; error?: "Error"; message: string }) => {
      setIsSaving(false)

      if (response.success) {
        toast({
          title: "Settings saved",
          description: response.message,
        })
      } else if (response.error) {
        toast({
          title: "Error saving settings",
          description: response.message,
          variant: "destructive",
        })
      }
    }

    if (websocketService) {
      websocketService.on("settings", handleSettings)
      websocketService.on("settingsSaved", handleSettingsSaved)
      websocketService.send("getSettings", {})
    }

    return () => {
      if (websocketService) {
        websocketService.off("settings", handleSettings)
        websocketService.off("settingsSaved", handleSettingsSaved)
      }
    }
  }, [toast])

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const updateSetting = useCallback((groupKey: string, settingKey: string, value: SettingValue) => {
    setSettings((prev) => {
      const newSettings = {
        ...prev,
        [groupKey]: {
          ...prev[groupKey],
          [settingKey]: {
            ...prev[groupKey][settingKey],
            value,
          },
        },
      }
      if (groupKey === "updates" && settingKey === "checkForUpdates") {
        if (newSettings.updates?.autoUpdateUI) {
          newSettings.updates.autoUpdateUI.disabled = !value
        }
      }
      setIsSaving(true)

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(() => {
        if (websocketService) {
          const flattenSettings: any = {};
          for (const category in newSettings) {
            flattenSettings[category] = {}
            for (const key in newSettings[category]) {
              flattenSettings[category][key] = newSettings[category][key].value;
            }
          }
          websocketService.send("saveSettings", flattenSettings)
        }
      }, 4000)

      return newSettings
    })
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(defaultSettings)

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (websocketService) {
      setIsSaving(true)
      websocketService.send("saveSettings", defaultSettings)
    }
  }, [])

  const getSettingValue = useCallback(
    (groupKey: string, settingKey: string): SettingValue => {
      return settings[groupKey]?.[settingKey]?.value
    },
    [settings],
  )

  return {
    settings,
    updateSetting,
    resetSettings,
    getSettingValue,
    isSaving,
  }
}
