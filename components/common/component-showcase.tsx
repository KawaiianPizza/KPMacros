"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    AlertCircle,
    Info,
    Settings,
    Search,
    CircleUserRound,
    ArrowLeft,
    Save,
    Loader2,
    ArrowUp,
    ArrowDown,
    Trash,
    GripVertical,
    Copy,
    RotateCcw,
    ArrowUpFromLine,
    ArrowDownToLine,
    X,
} from "lucide-react"

// Import custom components
import ProfileButtons from "@/components/profiles/profile-buttons"
import MacroList from "@/components/profiles/macro-list"
import LoadingSpinner from "@/components/common/loading-spinner"
import ConfirmationDialog from "@/components/common/confirmation-dialog"
import { SettingsButton } from "@/components/settings/settings-button"
import TypeRowSelect from "@/components/common/type-row-select"
import TypeSwitch from "@/components/common/type-switch"
import { NumberInput } from "@/components/common/number-input"
import { SettingItem } from "@/components/settings/setting-item"
import { SettingsGroup } from "@/components/settings/settings-group"

// Mock data
const mockProfiles = [
    { name: "Global", windows: [] },
    { name: "Gaming", windows: ["game.exe", "steam.exe"] },
    { name: "Work", windows: ["code.exe", "chrome.exe"] },
    { name: "Streaming", windows: ["obs.exe", "discord.exe"] },
]

const mockMacros = [
    {
        id: "1",
        name: "Quick Save",
        enabled: true,
        mod: false,
        type: "Hotkey" as const,
        activator: "Ctrl+S",
        loopMode: "Held" as const,
        interrupt: true,
        repeatDelay: 100,
        modifiers: 0,
        modifierMode: "Inclusive" as const,
        start: [],
        loop: [],
        finish: [],
        cooldown: 0,
    },
    {
        id: "2",
        name: "Screenshot",
        enabled: false,
        mod: false,
        type: "Hotkey" as const,
        activator: "F12",
        loopMode: "Toggle" as const,
        interrupt: false,
        repeatDelay: 50,
        modifiers: 0,
        modifierMode: "Exclusive" as const,
        start: [],
        loop: [],
        finish: [],
        cooldown: 500,
    },
    {
        id: "3",
        name: "Hello Command",
        enabled: true,
        mod: false,
        type: "Command" as const,
        activator: "/hello",
        loopMode: "Held" as const,
        interrupt: true,
        repeatDelay: 100,
        modifiers: 0,
        modifierMode: "Inclusive" as const,
        start: [],
        loop: [],
        finish: [],
        cooldown: 0,
    },
]

const mockAction = {
    id: "action-1",
    type: "keyboard" as const,
    key: "A",
    state: "press" as const,
}

const mockSettings = {
    general: {
        autoStart: {
            label: "Start with Windows",
            description: "Automatically start the application when Windows boots up",
            value: true,
            disabled: false,
        },
        minimizeToTray: {
            label: "Minimize to System Tray",
            description: "Hide the application in the system tray when minimized instead of the taskbar",
            value: false,
            disabled: false,
        },
    },
    updates: {
        autoUpdate: {
            label: "Automatic Updates",
            description: "Automatically download and install updates when available",
            value: true,
            disabled: false,
        },
    },
}

export function ComponentShowcase() {
    const [sliderValue, setSliderValue] = useState([50])
    const [progressValue, setProgressValue] = useState(65)
    const [date, setDate] = useState<Date | undefined>(new Date())
    const [selectedProfile, setSelectedProfile] = useState("Gaming")
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [showProfileDialog, setShowProfileDialog] = useState(false)
    const [selectedMacroId, setSelectedMacroId] = useState<string | null>(null)
    const [actionSelected, setActionSelected] = useState(false)
    const [typeRowValue, setTypeRowValue] = useState("keyboard")
    const [typeSwitchValue, setTypeSwitchValue] = useState("Hotkey")
    const [numberValue, setNumberValue] = useState(100)

    return (
        <div className="space-y-12">
            {/* Profile Page Components */}
            <section>
                <h2 className="text-3xl font-bold mb-8">Profile Page Components</h2>

                {/* Profile Header */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CircleUserRound className="h-5 w-5" />
                                    Profile Management
                                </CardTitle>
                                <SettingsButton />
                            </div>
                            <CardDescription>Profile selection and management interface</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ProfileButtons
                                profiles={mockProfiles}
                                selectedProfile={selectedProfile}
                                onSelectProfile={setSelectedProfile}
                                onNewProfile={() => setShowProfileDialog(true)}
                                onEditProfile={(profile) => console.log("Edit:", profile.name)}
                                onDeleteProfile={(profile) => console.log("Delete:", profile.name)}
                            />
                        </CardContent>
                    </Card>

                    {/* Macro List */}
                    <MacroList
                        macros={mockMacros}
                        isLoading={false}
                        selectedProfile={selectedProfile}
                        onToggleEnabled={(id, enabled) => console.log("Toggle:", id, enabled)}
                        onUpdateLoopMode={(id, mode) => console.log("Loop mode:", id, mode)}
                        onEditMacro={(id) => console.log("Edit macro:", id)}
                        onRenameMacro={(id) => console.log("Rename macro:", id)}
                        onDeleteMacro={(id) => console.log("Delete macro:", id)}
                        onCreateNewMacro={() => console.log("Create new macro")}
                    />

                    {/* Loading States */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Loading States</CardTitle>
                            <CardDescription>Various loading indicators used throughout the application</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 border rounded-lg">
                                    <LoadingSpinner text="Loading profiles..." />
                                </div>
                                <div className="text-center p-4 border rounded-lg">
                                    <LoadingSpinner text="Saving macro..." className="text-input" />
                                </div>
                                <div className="text-center p-4 border rounded-lg">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span className="text-sm">Processing...</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Macro Editor Components */}
            <section>
                <h2 className="text-3xl font-bold mb-8 text-input">Macro Editor Components</h2>

                <div className="space-y-6">
                    {/* Editor Header */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Macro Editor Header</CardTitle>
                            <CardDescription>Navigation and save controls for macro editing</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 p-4 border rounded-lg">
                                <Button variant="ghost" size="icon">
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                                <h1 className="text-xl font-bold">Edit Macro: Quick Save</h1>
                                <span className="text-sm text-active">• Unsaved changes</span>
                                <div className="ml-auto flex gap-2">
                                    <Button variant="outline">Cancel</Button>
                                    <Button>
                                        <Save className="h-4 w-4 mr-2" />
                                        Update Macro
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Type Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Type Row Select</CardTitle>
                                <CardDescription>Grid-based selection for action types</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium">Action Type</Label>
                                    <TypeRowSelect
                                        columns={3}
                                        rows={2}
                                        id="action-type-demo"
                                        options={["keyboard", "mouse", "text", "delay", "sound", "process"]}
                                        value={typeRowValue}
                                        onValueChange={setTypeRowValue}
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Dance Pad</Label>
                                    <TypeRowSelect
                                        columns={3}
                                        rows={3}
                                        id="compact-demo"
                                        options={[
                                            "↖", "↑", "↗",
                                            "←", "•", "→",
                                            "↙", "↓", "↘"
                                        ]}
                                        value={typeRowValue}
                                        onValueChange={setTypeRowValue}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Type Switch</CardTitle>
                                <CardDescription>Toggle-style type selection</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium">Macro Type</Label>
                                    <TypeSwitch
                                        options={["Hotkey", "Command"]}
                                        value={typeSwitchValue}
                                        onValueChange={setTypeSwitchValue}
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium">Editor Tabs</Label>
                                    <TypeSwitch
                                        options={["General", "Actions"]}
                                        value="General"
                                        onValueChange={() => { }}
                                        className="w-full"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Number Input */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Number Input</CardTitle>
                            <CardDescription>Specialized numeric input with increment/decrement controls</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <Label className="min-w-[120px]">Repeat Delay (ms)</Label>
                                    <div className="flex items-center">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setNumberValue(Math.max(0, numberValue - 5))}
                                            className="rounded-r-none border-r-0"
                                        >
                                            -
                                        </Button>
                                        <NumberInput
                                            value={numberValue}
                                            onChange={setNumberValue}
                                            min={0}
                                            className="rounded-none text-center w-24"
                                        />
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setNumberValue(numberValue + 5)}
                                            className="rounded-l-none border-l-0"
                                        >
                                            +
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Display */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Action Display</CardTitle>
                            <CardDescription>Individual action items with drag handles and controls</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-4 border rounded-lg">
                                    <div
                                        className="flex items-center justify-between cursor-pointer"
                                        onClick={() => setActionSelected(!actionSelected)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <GripVertical className="h-4 w-4 text-foreground/65" />
                                            <div>
                                                <div className="font-medium text-sm">
                                                    Press <span className="text-info-text">A</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                                            <ArrowUp className="h-3 w-3" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Move up</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                                            <ArrowDown className="h-3 w-3" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Move down</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                                            <Copy className="h-3 w-3" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Duplicate</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-600">
                                                            <Trash className="h-3 w-3" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Delete</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </div>
                                    {actionSelected && (
                                        <div className="mt-4 p-4 bg-input/10 rounded border-t">
                                            <div className="text-sm text-foreground/65">
                                                Action configuration panel would appear here with specific inputs for the selected action type.
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 border rounded-lg opacity-75">
                                    <div className="flex items-center gap-3">
                                        <GripVertical className="h-4 w-4 text-foreground/65" />
                                        <div className="font-medium text-sm">
                                            Delay <span className="text-secondary-foreground">250ms</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 border rounded-lg opacity-75">
                                    <div className="flex items-center gap-3">
                                        <GripVertical className="h-4 w-4 text-foreground/65" />
                                        <div className="font-medium text-sm">
                                            Type <span className="text-secondary-foreground">Hello World!</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Lists Layout */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Action Lists Layout</CardTitle>
                            <CardDescription>Three-column layout for Start, Loop, and Finish actions</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {[
                                    { type: "Start Actions", icon: ArrowDownToLine, count: 2 },
                                    { type: "Loop Actions", icon: RotateCcw, count: 1 },
                                    { type: "Finish Actions", icon: ArrowUpFromLine, count: 3 },
                                ].map(({ type, icon: Icon, count }) => (
                                    <Card key={type} className="border-dashed">
                                        <CardHeader className="pb-3">
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <Icon className="h-4 w-4" />
                                                {type}
                                                <Badge className="ml-auto">{count}</Badge>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2 min-h-32">
                                                {count > 0 ? (
                                                    Array.from({ length: Math.min(count, 2) }).map((_, i) => (
                                                        <div key={i} className="p-2 border rounded text-sm bg-card">
                                                            Action {i + 1}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-6 border border-dashed rounded text-foreground/65 text-sm">
                                                        No actions added yet
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Settings Components */}
            <section>
                <h2 className="text-3xl font-bold mb-8 text-input">Settings Components</h2>

                <div className="space-y-6">

                    {/* Setting Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Setting Items</CardTitle>
                            <CardDescription>Individual setting controls with various input types</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-6">
                                <div className="h-auto flex flex-col justify-between">
                                    <div className="w-64 space-y-2">
                                        <SettingsGroup groupKey="general" isSelected={true} onSelect={() => { }} settingsCount={5} />
                                        <SettingsGroup groupKey="updates" isSelected={false} onSelect={() => { }} settingsCount={3} />
                                        <SettingsGroup groupKey="about" isSelected={false} onSelect={() => { }} settingsCount={2} />
                                    </div>
                                    <div className="relative mt-auto">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/65" />
                                        <Input placeholder="Search settings..." className="pl-9 pr-9" />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex-1 p-4 border rounded-lg bg-muted/20">
                                    <SettingItem
                                        groupKey="general"
                                        settingKey="autoStart"
                                        setting={mockSettings.general.autoStart}
                                        onUpdate={(group, key, value) => console.log("Update:", group, key, value)}
                                    />
                                    <SettingItem
                                        groupKey="general"
                                        settingKey="minimizeToTray"
                                        setting={mockSettings.general.minimizeToTray}
                                        onUpdate={(group, key, value) => console.log("Update:", group, key, value)}
                                    />
                                    <SettingItem
                                        groupKey="updates"
                                        settingKey="autoUpdate"
                                        setting={mockSettings.updates.autoUpdate}
                                        onUpdate={(group, key, value) => console.log("Update:", group, key, value)}
                                    />

                                    {/* Example with links */}
                                    <SettingItem
                                        groupKey="about"
                                        settingKey="version"
                                        setting={{
                                            label: "Application Version",
                                            description: "Current version information and release notes",
                                            value: { version: "1.0.0" },
                                            links: ["https://github.com/example/releases", "https://docs.example.com"],
                                        }}
                                        onUpdate={() => { }}
                                    />
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Dialog Components */}
            <section>
                <h2 className="text-3xl font-bold mb-8 text-input">Dialog Components</h2>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Confirmation Dialog</CardTitle>
                            <CardDescription>Used for destructive actions like deleting profiles or macros</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <Button onClick={() => setShowConfirmDialog(true)}>Show Confirmation Dialog</Button>
                                <ConfirmationDialog
                                    open={showConfirmDialog}
                                    onOpenChange={setShowConfirmDialog}
                                    title="Delete Profile"
                                    description='Are you sure you want to delete the profile "Gaming"? This action cannot be undone and will also delete all macros associated with this profile.'
                                    confirmText="Delete"
                                    variant="destructive"
                                    isLoading={false}
                                    onConfirm={() => {
                                        console.log("Confirmed deletion")
                                        setShowConfirmDialog(false)
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Form Dialog</CardTitle>
                            <CardDescription>Modal form for creating and editing profiles</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={() => setShowProfileDialog(true)}>Show Profile Form</Button>
                            {showProfileDialog && (
                                <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
                                    <DialogContent className="sm:max-w-[500px]">
                                        <DialogHeader>
                                            <DialogTitle>Create New Profile</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-6 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="profile-name">Profile Name</Label>
                                                <Input id="profile-name" placeholder="Enter profile name..." />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Associated Windows</Label>
                                                <ScrollArea className="h-[200px] border rounded p-3">
                                                    <div className="space-y-2">
                                                        {["chrome.exe", "notepad.exe", "code.exe"].map((app) => (
                                                            <div key={app} className="flex items-center space-x-2">
                                                                <Checkbox id={app} />
                                                                <Label htmlFor={app}>{app}</Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </ScrollArea>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setShowProfileDialog(false)}>
                                                Cancel
                                            </Button>
                                            <Button onClick={() => setShowProfileDialog(false)}>Create Profile</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Standard UI Components */}
            <section>
                <h2 className="text-3xl font-bold mb-8 text-input">Standard UI Components</h2>

                {/* Buttons Section */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Button Variants</CardTitle>
                            <CardDescription>All button styles used throughout the application</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-3">
                                <Button>Default</Button>
                                <Button variant="secondary">Secondary</Button>
                                <Button variant="destructive">Destructive</Button>
                                <Button variant="outline">Outline</Button>
                                <Button variant="ghost">Ghost</Button>
                                <Button variant="link">Link</Button>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Button size="sm">Small</Button>
                                <Button size="default">Default</Button>
                                <Button size="lg">Large</Button>
                                <Button size="icon">
                                    <Settings className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Button disabled>Disabled</Button>
                                <Button>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Loading
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Form Elements */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Input Fields</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="Enter your email" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" type="password" placeholder="Enter password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="textarea">Message</Label>
                                    <Textarea id="textarea" placeholder="Type your message here..." />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Selection Controls</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label>Select Option</Label>
                                    <Select>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an option" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="option1">Option 1</SelectItem>
                                            <SelectItem value="option2">Option 2</SelectItem>
                                            <SelectItem value="option3">Option 3</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="switch1">Enable notifications</Label>
                                        <Switch id="switch1" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="switch2">Dark mode</Label>
                                        <Switch id="switch2" defaultChecked />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Badges and Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Badges & Status Indicators</CardTitle>
                            <CardDescription>Status indicators used throughout the application</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                <Badge>Enabled</Badge>
                                <Badge variant="secondary">Hotkey</Badge>
                                <Badge variant="destructive">Error</Badge>
                                <Badge variant="outline">Disabled</Badge>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Badge className="bg-green-500">Active</Badge>
                                <Badge className="bg-yellow-500">Warning</Badge>
                                <Badge className="bg-blue-500">Info</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Alerts */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Alerts & Notifications</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertTitle>Information</AlertTitle>
                                <AlertDescription>This is an informational alert with additional context.</AlertDescription>
                            </Alert>
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>Something went wrong. Please try again later.</AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    )
}
