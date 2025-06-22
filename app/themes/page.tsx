import { ComponentShowcase } from "@/components/common/component-showcase"
import { FloatingCard } from "@/components/common/floating-card"

export default function Themes() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-6 py-3 space-y-3">
        {" "}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">UI Component Showcase</h1>
          <p className="text-foreground/65 text-lg">
            A comprehensive display of all UI components used throughout the application
          </p>
        </div>
        <ComponentShowcase />
      </div>
      <FloatingCard />
    </div>
  )
}
