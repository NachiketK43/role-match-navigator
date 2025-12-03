import { ModernSidebar } from "@/components/ModernSidebar"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <ModernSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
