"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/store";
import { toggleMobileSidebar } from "@/redux/slices/uiSlice";
import {
  Menu,
  Bell,
  LogOut,
  User as UserIcon,
  Sparkles,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Dropdown from "@/components/ui/Dropdown"; // Let's build a simple custom dropdown since we imported it in components tree

const DashboardTopbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(2); // Mock count for notifications
  const user = { name: "Sam", email: "sam@example.com" }; // Mock user

  const handleLogout = () => {
    // Implement logout logic (clear sessionStorage, call API, etc.)
    sessionStorage.removeItem("accessToken");
    router.push(ROUTES.LOGIN);
  };

  const handleMobileMenuToggle = () => {
    dispatch(toggleMobileSidebar());
  };

  return (
    <header className="h-16 border-b border-[var(--border)] bg-[var(--bg-card)] px-4 md:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left side: Mobile menu trigger + Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleMobileMenuToggle}
          className="md:hidden p-2 rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>

        {/* Search or Quick Widget */}
        <div className="hidden md:flex items-center gap-2 text-sm text-[var(--text-muted)] font-medium">
          Welcome back, <span className="text-[var(--text-primary)] font-semibold">{user.name}</span>!
        </div>
      </div>

      {/* Right side Actions */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Link href={ROUTES.NOTIFICATIONS} className="relative p-2 rounded-[var(--radius-sm)] hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[var(--error)] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* User Profile dropdown */}
        <Dropdown
          trigger={
            <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-sm font-semibold uppercase hover:opacity-90 transition-opacity">
              {user.name[0]}
            </div>
          }
          items={[
            {
              label: `${user.name} (${user.email})`,
              className: "font-semibold border-b border-[var(--border)] pb-2 pointer-events-none hover:bg-transparent text-[var(--text-primary)]",
            },
            {
              label: "Profile Settings",
              icon: <UserIcon size={16} />,
              onClick: () => router.push(ROUTES.SETTINGS),
            },
            {
              label: "Sign Out",
              icon: <LogOut size={16} />,
              onClick: handleLogout,
              className: "text-[var(--error)] hover:bg-[var(--error-light)] border-t border-[var(--border)] mt-1",
            },
          ]}
        />
      </div>
    </header>
  );
};


export default DashboardTopbar;
