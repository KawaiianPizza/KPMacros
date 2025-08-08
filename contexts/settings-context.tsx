"use client"

import { useState, useCallback, useEffect, useRef, createContext, useContext } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useWebSocketUI } from "@/hooks/use-websocketUI"


export type Setting = ToggleSetting | ButtonSetting | ButtonGroupSetting | InfoSetting | ThemeSetting;
export interface BaseSetting {
    label: string
    description: string | undefined
    disabled?: boolean
}
interface ToggleSetting extends BaseSetting {
    type: "toggle"
    value: boolean,
}
interface ButtonSetting extends BaseSetting {
    type: "button",
    value: string
}
interface ButtonGroupSetting extends BaseSetting {
    type: "button-group",
    value: string[]
}
interface InfoSetting extends BaseSetting {
    type: "info",
}
interface ThemeSetting extends BaseSetting {
    type: "theme"
    value: string
}

export interface SettingsData {
    [groupKey: string]: {
        [settingKey: string]: Setting
    }
}

const defaultSettings: SettingsData = {
    general: {
        runAsAdmin: {
            type: "toggle",
            value: false,
            label: "Run as administrator",
            description:
                "Run KPMacros with elevated privileges. Needed to work on elevated processes. (KPMacros needs to be restarted to take effect)",
        },
        runAtStartup: {
            type: "toggle",
            value: false,
            label: "Run at startup",
            description: "Automatically start the application when your computer boots",
        },
    },
    updates: {
        checkForUpdates: {
            type: "toggle",
            value: true,
            label: "Check for updates",
            description: "Automatically check for application updates on startup",
        },
        autoUpdateUI: {
            type: "toggle",
            value: true,
            label: "Auto-update UI",
            description: "Automatically download and install UI updates without prompting",
            disabled: false
        },
    },
    theme: {
        selectedTheme: {
            type: "theme",
            value: "Hallowed Mint",
            label: "Selected theme",
            description: "Currently selected theme name",
        },
    },
    about: {
        info: {
            type: "info",
            label: "Application Information",
            description: "Author: KawaiianPizza\n" + "",
        },
        discord: {
            type: "button",
            value: "https://discord.gg/GVCzVagyu7",
            label: "Discord",
            description: "Need help or have a suggestion? Join the Discord and let me know! :D",
        },
        supportMe: {
            type: "button-group",
            value: [
                "https://streamelements.com/kawaiianpizza/tip",
                "https://www.paypal.me/kawaiianpizza",
                "https://www.patreon.com/KawaiianPizza",
                "https://boosty.to/kawaiianpizza",
            ],
            label: "Support me",
            description: "Here are some ways to support me and the development of KPMacros 💝",
        },
        github: {
            type: "button",
            value: "https://github.com/KawaiianPizza/KPMacros",
            label: "Source code",
            description: "View the source code on Github",
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
                    const newSetting = newSettings[group][key];
                    const oldSetting = data[group][key];
                    if ("value" in newSetting && "value" in oldSetting)
                        newSetting.value = oldSetting.value;
                }
            }
            if (newSettings.updates?.autoUpdateUI && newSettings.updates?.checkForUpdates) {
                newSettings.updates.autoUpdateUI.disabled = !(newSettings.updates.checkForUpdates as ToggleSetting).value;
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
                        const newSetting = newSettings[category][key];
                        if ("value" in newSetting)
                            flattenSettings[category][key] = newSetting.value;
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
            const newSetting = settings[groupKey]?.[settingKey];
            if ("value" in newSetting)
                return newSetting?.value
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
