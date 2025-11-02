import { NavLink, useLocation, useNavigate } from "react-router-dom"
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
  LogOut,
  Mail,
  MessageSquare,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { supabase } from "@/integrations/supabase/client"

const menuItems = [
  { title: "Skill Gap", url: "/dashboard", icon: Target },
  { title: "Resume Optimizer", url: "/resume-optimizer", icon: Sparkles },
  { title: "Cover Letter Generator", url: "/cover-letter-generator", icon: Mail },
  { title: "Practice Interview Questions", url: "/practice-interview-questions", icon: MessageSquare },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const isCollapsed = state === "collapsed"
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState<string>("")

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user?.id)
        .single()

      if (error) throw error
      setFullName(data?.full_name || "")
    } catch (error) {
      console.error("Error loading profile:", error)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    toast.success("Signed out successfully")
    navigate("/signup")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Sidebar collapsible="icon" className="border-r bg-[#fafafa]">
      <SidebarContent className="bg-[#fafafa]">
        {/* Logo Section */}
        <div className="px-4 py-6 border-b bg-[#fafafa]">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-primary text-lg">Skill Lens</h2>
                <p className="text-xs text-[#343434]">AI-Powered Career Growth</p>
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
                            ? "bg-primary text-[#343434] hover:bg-primary hover:text-[#343434]"
                            : "text-[#343434] hover:bg-primary/10 hover:text-[#343434]"
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

      {/* Footer with User Profile */}
      <SidebarFooter className="bg-[#fafafa] border-t p-4">
        {user && (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {fullName ? getInitials(fullName) : "U"}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#343434] truncate">
                  {fullName || "User"}
                </p>
                <p className="text-xs text-[#343434]/70 truncate">
                  {user.email}
                </p>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="h-8 w-8 text-[#343434] hover:text-primary hover:bg-primary/10"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
