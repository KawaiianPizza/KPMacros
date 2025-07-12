"use client"

import { useState, useCallback, useEffect, useRef, createContext, useContext } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useWebSocketUI } from "@/hooks/use-websocketUI"


export interface Setting {
    value: any
    label: string
    description: string | undefined
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
    theme: {
        selectedTheme: {
            value: "Hallowed Mint",
            label: "Selected theme",
            description: "Currently selected theme name",
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

const SettingsContext = createContext<any | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { send, on, off } = useWebSocketUI()

    const [settings, setSettings] = useState(defaultSettings);
    const [isSaving, setIsSaving] = useState(false);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const handleSettings = (data: SettingsData) => {
            const newSettings = { ...defaultSettings };
            for (const group in data) {
                for (const key in data[group]) {
                    newSettings[group][key].value = data[group][key];
                }
            }
            if (newSettings.updates?.autoUpdateUI && newSettings.updates?.checkForUpdates) {
                newSettings.updates.autoUpdateUI.disabled = !newSettings.updates.checkForUpdates.value;
            }
            setSettings(newSettings);
        };

        const handleSettingsSaved = (response: { success?: "Success"; error?: "Error"; message: string }) => {
            setIsSaving(false);
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
        };

        on("settings", handleSettings);
        on("settingsSaved", handleSettingsSaved);
        send("getSettings", {}, false);

        return () => {
            off("settings", handleSettings);
            off("settingsSaved", handleSettingsSaved);
        };
    }, [toast]);

    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        };
    }, []);

    const updateSetting = useCallback((groupKey: string, settingKey: string, value: any) => {
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
                const flattenSettings: any = {};
                for (const category in newSettings) {
                    flattenSettings[category] = {}
                    for (const key in newSettings[category]) {
                        flattenSettings[category][key] = newSettings[category][key].value;
                    }
                }
                send("saveSettings", flattenSettings)
            }, 500)

            return newSettings
        })
    }, [])

    const resetSettings = useCallback(() => {
        setSettings(defaultSettings)

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }

        setIsSaving(true)
        send("saveSettings", defaultSettings)
    }, [])

    const getSettingValue = useCallback(
        (groupKey: string, settingKey: string): any => {
            return settings[groupKey]?.[settingKey]?.value
        },
        [settings],
    )

    return (
        <SettingsContext.Provider
            value={{
                settings,
                updateSetting,
                resetSettings,
                getSettingValue,
                isSaving,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettingsContext = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error("useSettingsData must be used within a SettingsProvider");
    }
    return context;
};
