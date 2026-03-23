"use client";

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
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ArrowLeft, Droplets, LayoutDashboard, MailQuestion, Radio, Server } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Devices",
    href: "/admin/dashboard",
    icon: Server,
  },
  {
    title: "Live Data",
    href: "/admin/live-data",
    icon: Radio,
  },
  {
    title: "Contacts",
    href: "/admin/contacts",
    icon: MailQuestion,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-sidebar-accent/60 transition-colors">
              <Link href="/admin/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-cyan-500 text-white shadow-sm shadow-cyan-500/30">
                  <Droplets className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">JalRakshak AI</span>
                  <span className="truncate text-xs text-sidebar-foreground/50">Admin Panel</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-widest text-sidebar-foreground/40 px-2 mb-1">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "group relative h-9 gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-150",
                        // Hover state
                        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                        // Active state — cyan accent left bar + tinted bg
                        isActive
                          ? "bg-cyan-500/10 text-cyan-500 dark:bg-cyan-400/10 dark:text-cyan-400 hover:bg-cyan-500/15 hover:text-cyan-500 dark:hover:bg-cyan-400/15 dark:hover:text-cyan-400"
                          : "text-sidebar-foreground/70"
                      )}
                    >
                      <Link href={item.href} className="flex items-center gap-3 w-full">
                        {/* Active left bar indicator */}
                        <span
                          className={cn(
                            "absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-r-full bg-cyan-500 dark:bg-cyan-400 transition-all duration-200",
                            isActive ? "h-5 opacity-100" : "h-0 opacity-0"
                          )}
                        />
                        <item.icon
                          className={cn(
                            "size-4 shrink-0 transition-colors duration-150",
                            isActive
                              ? "text-cyan-500 dark:text-cyan-400"
                              : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
                          )}
                        />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border pt-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-9 gap-3 rounded-lg px-3 text-sm font-medium text-sidebar-foreground/50 transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <Link href="/" className="flex items-center gap-3">
                <ArrowLeft className="size-4 shrink-0" />
                <span>Back to App</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
