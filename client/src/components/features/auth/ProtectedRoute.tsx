"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { selectIsAuthenticated, selectAuthLoading, selectUserRole, setLoading } from "@/redux/slices/authSlice";
import { ROUTES } from "@/lib/constants";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);
  const role = useAppSelector(selectUserRole);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace(ROUTES.LOGIN);
      } else if (adminOnly && role !== "admin") {
        router.replace(ROUTES.DASHBOARD);
      }
    }
  }, [isAuthenticated, isLoading, router, adminOnly, role]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#00be50] flex items-center justify-center shadow-[0_0_30px_rgba(0,190,80,0.4)] animate-pulse">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || (adminOnly && role !== "admin")) {
    return null;
  }

  return <>{children}</>;
}
