import { NavLink, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  FileSpreadsheet,
  Sparkles,
  Linkedin,
  Building2,
  Send,
  Mic,
  Target,
  BookOpen,
  Calendar,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "AI Career Coach", url: "/ai-career-coach", icon: Briefcase },
  { title: "AI Resume Builder", url: "/ai-resume-builder", icon: FileText },
  { title: "Job Specific Resume", url: "/job-specific-resume", icon: FileSpreadsheet },
  { title: "Optimise Resume", url: "/resume-optimizer", icon: Sparkles },
  { title: "Optimise LinkedIn", url: "/optimise-linkedin", icon: Linkedin },
  { title: "Job Search AI Agent", url: "/job-search-ai-agent", icon: Building2 },
  { title: "AI Outreach Templates", url: "/ai-outreach-templates", icon: Send },
  { title: "Mock Interview AI Agent", url: "/mock-interview-ai-agent", icon: Mic },
  { title: "Interview Preparation Hub", url: "/interview-preparation-hub", icon: Target },
  { title: "Interview Question Bank", url: "/interview-question-bank", icon: BookOpen },
  { title: "Book a Mentorship Call", url: "/book-mentorship-call", icon: Calendar },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent>
        {/* Logo Section */}
        <div className="px-4 py-6 border-b">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-accent-foreground" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-accent text-lg">Land Better Jobs</h2>
                <p className="text-xs text-muted-foreground">Your AI Career Copilot</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={isCollapsed ? item.title : undefined}
                    >
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          isActive
                            ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                            : "hover:bg-accent/10 hover:text-accent-foreground"
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
