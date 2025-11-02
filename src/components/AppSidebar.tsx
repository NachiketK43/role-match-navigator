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
  { title: "Skill Gap", url: "/dashboard", icon: Target },
  { title: "Resume Optimizer", url: "/resume-optimizer", icon: Sparkles },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon" className="border-r bg-[#fafafa]">
      <SidebarContent className="bg-[#fafafa]">
        {/* Logo Section */}
        <div className="px-4 py-6 border-b bg-[#fafafa]">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-accent-foreground" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-accent text-lg">Land Better Jobs</h2>
                <p className="text-xs text-gray-600">Your AI Career Copilot</p>
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
                            : "text-gray-700 hover:bg-primary/10 hover:text-primary"
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
