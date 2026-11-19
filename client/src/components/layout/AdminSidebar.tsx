"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  LayoutDashboard,
  Users,
  CreditCard,
  Sliders,
  Settings,
  Terminal,
  FileText,
  AlertOctagon,
  Tag,
  Wand2,
  ChevronLeft,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface AdminSidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems: AdminSidebarItem[] = [
    { name: "Overview", href: ROUTES.ADMIN, icon: LayoutDashboard },
    { name: "Users", href: ROUTES.ADMIN_USERS, icon: Users },
    { name: "Subscriptions", href: ROUTES.ADMIN_SUBSCRIPTIONS, icon: CreditCard },
    { name: "Manage Plans", href: ROUTES.ADMIN_PLANS, icon: Sliders },
    { name: "Manage Coupons", href: ROUTES.ADMIN_COUPONS, icon: Tag },
    { name: "AI Provider Config", href: ROUTES.ADMIN_AI_CONFIG, icon: Wand2 },
    { name: "AI Usage & Costs", href: ROUTES.ADMIN_AI_USAGE, icon: Terminal },
    { name: "Application Analytics", href: ROUTES.ADMIN_APPLICATIONS, icon: FileText },
    { name: "Content Blocks", href: ROUTES.ADMIN_CONTENT, icon: FileText },
    { name: "System Settings", href: ROUTES.ADMIN_SETTINGS, icon: Settings },
    { name: "System Logs", href: ROUTES.ADMIN_LOGS, icon: AlertOctagon },
  ];

  const isActive = (href: string) => {
    if (href === ROUTES.ADMIN) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-[#0d0f10] border-r border-[#1a1c1e] text-[var(--sidebar-text-muted)] flex flex-col h-screen fixed top-0 left-0 z-30 transition-all duration-300">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#1a1c1e]">
        <Link href={ROUTES.ADMIN} className="flex items-center gap-2.5 font-bold text-white">
          <div className="flex items-center justify-center w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--warning)] text-black font-extrabold shadow-md shrink-0">
            A
          </div>
          <span className="font-extrabold text-white tracking-tight">Admin Console</span>
        </Link>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3.5 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium transition-all duration-150",
                active
                  ? "bg-[var(--warning)] text-black font-bold"
                  : "text-[var(--sidebar-text-muted)] hover:text-white hover:bg-[#1a1c1e]"
              )}
            >
              <Icon size={18} className={cn("shrink-0", active ? "text-black" : "text-gray-500")} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Exit Admin Console link */}
      <div className="p-4 border-t border-[#1a1c1e]">
        <Link
          href={ROUTES.DASHBOARD}
          className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] text-sm text-[var(--text-muted)] hover:text-white transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Exit Admin</span>
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
