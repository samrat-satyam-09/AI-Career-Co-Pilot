"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { toggleSidebar } from "@/redux/slices/uiSlice";
import {
  Sparkles,
  LayoutDashboard,
  FileText,
  Briefcase,
  Wand2,
  Video,
  CreditCard,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const DashboardSidebar: React.FC = () => {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const sidebarCollapsed = useAppSelector((state) => state.ui.sidebarCollapsed);
  const user = useAppSelector((state) => state.auth.user);

  const [isHovered, setIsHovered] = useState(false);

  // Expanded state: either NOT collapsed by user, OR collapsed by user but currently hovered
  const isExpanded = !sidebarCollapsed || isHovered;

  const navItems: SidebarItem[] = [
    { name: "Overview", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { name: "Resumes", href: ROUTES.RESUMES, icon: FileText },
    { name: "Job Tracker", href: ROUTES.APPLICATIONS, icon: Briefcase },
    { name: "AI Career Tools", href: ROUTES.AI_TOOLS, icon: Wand2 },
    { name: "Mock Interviews", href: ROUTES.INTERVIEWS, icon: Video },
    { name: "Billing & Subscriptions", href: ROUTES.BILLING, icon: CreditCard },
    { name: "Notifications", href: ROUTES.NOTIFICATIONS, icon: Bell },
    { name: "Settings", href: ROUTES.SETTINGS, icon: Settings },
  ];

  const handleSidebarToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleSidebar());
  };

  const isActive = (href: string) => {
    if (href === ROUTES.DASHBOARD) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "hidden md:flex flex-col h-screen fixed top-0 left-0 z-30 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden",
        "bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] text-[var(--sidebar-text-muted)] select-none",
        isExpanded ? "w-64" : "w-20",
        sidebarCollapsed && isHovered && "shadow-[0_0_35px_rgba(0,0,0,0.6)] z-40 border-r-[#00be50]/40 ring-1 ring-[#00be50]/20"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-[var(--sidebar-border)] shrink-0">
        <Link
          href={ROUTES.DASHBOARD}
          className="flex items-center gap-3 font-bold text-white w-full overflow-hidden"
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-[var(--radius-sm)] bg-[#00be50] text-white shrink-0">
            <Sparkles size={18} />
          </div>
          <span
            className={cn(
              "font-extrabold text-white tracking-tight text-lg whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
              isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none w-0"
            )}
          >
            Co-Pilot
          </span>
        </Link>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3.5 px-3.5 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium transition-all duration-200 ease-in-out whitespace-nowrap group",
                active
                  ? "bg-[#00be50] text-white font-semibold shadow-[0_0_15px_rgba(0,190,80,0.3)]"
                  : "text-[var(--sidebar-text-muted)] hover:text-white hover:bg-[var(--sidebar-bg-hover)]"
              )}
              title={!isExpanded ? item.name : undefined}
            >
              <Icon
                size={20}
                className={cn(
                  "shrink-0 transition-transform duration-200 group-hover:scale-110",
                  active ? "text-white" : "text-[var(--sidebar-text-muted)] group-hover:text-white"
                )}
              />
              <span
                className={cn(
                  "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] truncate",
                  isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3 pointer-events-none w-0"
                )}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Admin Panel Quick Access */}
      {user?.role === "admin" && (
        <div className="px-3 mb-2 shrink-0">
          <Link
            href={ROUTES.ADMIN}
            className={cn(
              "flex items-center gap-3.5 px-3.5 py-2.5 rounded-[var(--radius-sm)] text-sm font-semibold transition-all duration-200 border border-dashed border-[var(--sidebar-border)] whitespace-nowrap",
              "text-[var(--warning)] hover:text-white hover:border-[var(--warning)] hover:bg-[var(--sidebar-bg-hover)]"
            )}
            title={!isExpanded ? "Admin Panel" : undefined}
          >
            <Shield size={20} className="shrink-0" />
            <span
              className={cn(
                "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] truncate",
                isExpanded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3 pointer-events-none w-0"
              )}
            >
              Admin Panel
            </span>
          </Link>
        </div>
      )}

      {/* Sidebar Toggle Footer */}
      <div
        className={cn(
          "p-3 border-t border-[var(--sidebar-border)] flex items-center shrink-0 h-16 transition-all duration-300",
          isExpanded ? "justify-between" : "justify-center"
        )}
      >
        {/* User Info (Visible only when expanded) */}
        <div
          className={cn(
            "flex items-center gap-2.5 overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
            isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 pointer-events-none"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-[#00be50] flex items-center justify-center text-xs font-bold text-white uppercase shrink-0 shadow-[0_0_10px_rgba(0,190,80,0.3)]">
            {user?.name?.[0] || "U"}
          </div>
          <div className="text-xs truncate">
            <p className="font-semibold text-white truncate max-w-[110px]">{user?.name}</p>
            <p className="text-[var(--sidebar-text-muted)] text-[10px] uppercase font-bold tracking-wider">{user?.role}</p>
          </div>
        </div>

        {/* Always Visible Toggle Arrow Button */}
        <button
          onClick={handleSidebarToggle}
          className={cn(
            "p-2 rounded-[var(--radius-sm)] bg-[var(--sidebar-bg-hover)] border border-[var(--sidebar-border)] text-white hover:bg-[#00be50] hover:border-[#00be50] transition-all duration-200 cursor-pointer shrink-0 flex items-center justify-center shadow-md",
            isExpanded ? "ml-auto" : "mx-auto"
          )}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight size={20} className="text-[#00be50] hover:text-white" />
          ) : (
            <ChevronLeft size={20} />
          )}
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
