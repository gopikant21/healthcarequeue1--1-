"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  BarChart3,
  Calendar,
  Clock,
  Home,
  ListChecks,
  Settings,
  Users,
  Bell,
  LogOut,
  Pill,
  CalendarClock,
  QrCode,
  ChevronRight,
  Stethoscope,
  Building2,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()

  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Appointments",
      href: "/appointments",
      icon: Calendar,
    },
    {
      title: "Queue Management",
      href: "/queue",
      icon: Clock,
    },
    {
      title: "Staff Rota",
      href: "/rota",
      icon: CalendarClock,
    },
    {
      title: "Patients",
      href: "/patients",
      icon: Users,
    },
    {
      title: "Waiting List",
      href: "/waiting-list",
      icon: ListChecks,
    },
  ]

  const secondaryNavItems = [
    {
      title: "Prescriptions",
      href: "/prescriptions",
      icon: Pill,
      subItems: [
        { title: "New Prescriptions", href: "/prescriptions/new" },
        { title: "Repeat Prescriptions", href: "/prescriptions/repeat" },
        { title: "Prescription Tracking", href: "/prescriptions/tracking" },
      ],
    },
    {
      title: "Services",
      href: "/services",
      icon: Stethoscope,
      subItems: [
        { title: "NHS Services", href: "/services/nhs" },
        { title: "Private Services", href: "/services/private" },
        { title: "Travel Clinic", href: "/services/travel" },
      ],
    },
    {
      title: "Check-in",
      href: "/check-in",
      icon: QrCode,
    },
    {
      title: "Notifications",
      href: "/notifications",
      icon: Bell,
      badge: 3,
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: BarChart3,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="flex flex-col gap-2 px-3 py-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <div className="flex flex-col">
            <span className="text-xl font-bold">CareQ</span>
            {state === "expanded" && <span className="text-xs text-muted-foreground">North Road Pharmacy</span>}
          </div>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  {item.subItems ? (
                    <Collapsible className="w-full">
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                          tooltip={item.title}
                        >
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="ml-auto mr-2 h-5 w-5 rounded-full p-0 text-xs">
                              {item.badge}
                            </Badge>
                          )}
                          <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.subItems.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.href}>
                              <SidebarMenuSubButton asChild isActive={pathname === subItem.href}>
                                <Link href={subItem.href}>{subItem.title}</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                      <Link href={item.href} className="relative">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto h-5 w-5 rounded-full p-0 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Staff member" />
            <AvatarFallback>SM</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Sarah Johnson</span>
            <span className="text-xs text-muted-foreground">Pharmacy Technician</span>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto">
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Log out</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
