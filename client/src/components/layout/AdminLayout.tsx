"use client";

import React from "react";
import AdminSidebar from "./AdminSidebar";
import DashboardTopbar from "./DashboardTopbar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex">
      {/* Admin Sidebar (fixed 64 width) */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen pl-64">
        {/* We reuse the dashboard topbar for theme toggles & notification options */}
        <DashboardTopbar />
        
        {/* Banner highlighting admin state */}
        <div className="bg-[var(--warning-light)] text-[var(--warning)] border-b border-[var(--warning)]/20 px-6 py-2 text-xs font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--warning)] animate-pulse" />
          <span>You are viewing the System Admin Console. Make modifications with caution.</span>
        </div>

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
