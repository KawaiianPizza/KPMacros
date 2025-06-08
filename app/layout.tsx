import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/contexts/theme-context"
import { ProfileProvider } from "@/contexts/profile-context"
import { Toaster } from "@/components/ui/toaster"
import { Inter } from "next/font/google"
import RefreshPrevention from "@/components/common/refresh-prevention"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const dynamic = "error"

export const metadata: Metadata = {
  title: "KPMacros UI v0.1.0",
  description: "UI for managing macros",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {!process.env.NODE_ENV ? <RefreshPrevention /> : null}
        <ThemeProvider>
          <ProfileProvider>
            <Suspense>
              {children}
            </Suspense>
            <Toaster />
          </ProfileProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
