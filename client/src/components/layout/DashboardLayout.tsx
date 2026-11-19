"use client";

import React from "react";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { setMobileSidebarOpen } from "@/redux/slices/uiSlice";
import DashboardSidebar from "./DashboardSidebar";
import DashboardTopbar from "./DashboardTopbar";
import { AnimatePresence, motion } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const sidebarCollapsed = useAppSelector((state) => state.ui.sidebarCollapsed);
  const mobileSidebarOpen = useAppSelector((state) => state.ui.mobileSidebarOpen);

  const handleCloseMobileSidebar = () => {
    dispatch(setMobileSidebarOpen(false));
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex">
      {/* Desktop Sidebar */}
      <DashboardSidebar />

      {/* Mobile Drawer Sidebar Overlay */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseMobileSidebar}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />

            {/* Sidebar content drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] text-[var(--sidebar-text-muted)] z-50 md:hidden flex flex-col"
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--sidebar-border)]">
                <Link
                  href={ROUTES.DASHBOARD}
                  onClick={handleCloseMobileSidebar}
                  className="flex items-center gap-2.5 font-bold text-white"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--accent)] text-white shadow-[var(--shadow-glow)]">
                    <Sparkles size={18} />
                  </div>
                  <span className="font-extrabold text-white tracking-tight">Co-Pilot</span>
                </Link>
                <button
                  onClick={handleCloseMobileSidebar}
                  className="p-2 rounded-[var(--radius-sm)] hover:bg-[var(--sidebar-bg-hover)] text-[var(--sidebar-text-muted)] hover:text-white"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Sidebar Menu Copy inside Drawer */}
              <div className="flex-1 py-6 px-3 overflow-y-auto" onClick={handleCloseMobileSidebar}>
                {/* DashboardSidebar navigation items list will catch the clicks and route */}
                <div className="text-xs uppercase font-bold text-gray-500 tracking-wider mb-4 px-3">Main Menu</div>
                {/* Placing standard navigation inside drawer */}
                <div className="space-y-1">
                  <Link
                    href={ROUTES.DASHBOARD}
                    className="flex items-center gap-3.5 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium hover:text-white hover:bg-[var(--sidebar-bg-hover)]"
                  >
                    <span>Overview</span>
                  </Link>
                  <Link
                    href={ROUTES.RESUMES}
                    className="flex items-center gap-3.5 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium hover:text-white hover:bg-[var(--sidebar-bg-hover)]"
                  >
                    <span>Resumes</span>
                  </Link>
                  <Link
                    href={ROUTES.APPLICATIONS}
                    className="flex items-center gap-3.5 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium hover:text-white hover:bg-[var(--sidebar-bg-hover)]"
                  >
                    <span>Job Tracker</span>
                  </Link>
                  <Link
                    href={ROUTES.AI_TOOLS}
                    className="flex items-center gap-3.5 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium hover:text-white hover:bg-[var(--sidebar-bg-hover)]"
                  >
                    <span>AI Career Tools</span>
                  </Link>
                  <Link
                    href={ROUTES.INTERVIEWS}
                    className="flex items-center gap-3.5 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium hover:text-white hover:bg-[var(--sidebar-bg-hover)]"
                  >
                    <span>Mock Interviews</span>
                  </Link>
                  <Link
                    href={ROUTES.BILLING}
                    className="flex items-center gap-3.5 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium hover:text-white hover:bg-[var(--sidebar-bg-hover)]"
                  >
                    <span>Billing & Subscriptions</span>
                  </Link>
                  <Link
                    href={ROUTES.SETTINGS}
                    className="flex items-center gap-3.5 px-3 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium hover:text-white hover:bg-[var(--sidebar-bg-hover)]"
                  >
                    <span>Settings</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300",
          sidebarCollapsed ? "md:pl-20" : "md:pl-64"
        )}
      >
        <DashboardTopbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
