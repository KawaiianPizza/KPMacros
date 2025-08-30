"use client"

import { useEffect } from "react"
import { redirect, useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    redirect("/profiles")
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-active border-t-transparent"></div>
        <p className="text-foreground">Loading...</p>
      </div>
    </div>
  )
}
