import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/contexts/theme-context"
import { ProfileProvider } from "@/contexts/profile-context"
import { Toaster } from "@/components/ui/toaster"
import { Inter } from "next/font/google"
import RefreshPrevention from "@/components/common/refresh-prevention"
import { Suspense } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SettingsProvider } from "@/contexts/settings-context"

const inter = Inter({ subsets: ["latin"] })

export const dynamic = "error"

export const metadata: Metadata = {
  title: "KPMacros UI v2025.08.06.105",
  description: "UI for managing macros",
  icons: "icon.ico"
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ScrollArea className="h-screen">
          {!process.env.NODE_ENV ? <RefreshPrevention /> : null}
          <SettingsProvider>
            <ThemeProvider>
              <ProfileProvider>
                <Suspense>
                  {children}
                </Suspense>
                <Toaster />
              </ProfileProvider>
            </ThemeProvider>
          </SettingsProvider>
        </ScrollArea>
      </body>
    </html>
  )
}
