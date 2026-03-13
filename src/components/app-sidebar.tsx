"use client";

import React from "react";
import { Dumbbell, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/nav-main";
import { UserButton } from "@/components/user-button";
import { mockUser } from "@/lib/mock-session";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const role = mockUser.app_metadata.roles[0];
  const isPlatformAdmin = mockUser.app_metadata.is_platform_admin;
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const t = useTranslations("sidebar");

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              tooltip={t("brand")}
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-700 text-primary-foreground">
                <Dumbbell className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{t("brand")}</span>
                <span className="truncate text-xs text-sidebar-foreground/70">
                  {t("version")}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain role={role} isPlatformAdmin={isPlatformAdmin} />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleSidebar}
              tooltip={t("expand")}
              className="text-sidebar-foreground/60 hover:text-sidebar-foreground"
            >
              {isCollapsed ? (
                <PanelLeftOpen className="size-4" />
              ) : (
                <PanelLeftClose className="size-4" />
              )}
              <span>{t("collapse")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator />
        <UserButton user={mockUser} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
