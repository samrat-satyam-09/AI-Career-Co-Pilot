"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  ArrowRight,
  Sparkles,
  LogOut,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { ROUTES } from "@/lib/constants";
import Button from "@/components/ui/Button";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/redux/store";
import { useLogoutMutation } from "@/redux/api/authApi";
import { toast } from "sonner";

function getInitials(name: string = ""): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      toast.success("Logged out successfully");
      setProfileDropdownOpen(false);
      setIsOpen(false);
      router.push(ROUTES.LOGIN);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to logout");
    }
  };

  const navLinks = [
    { name: "Features", href: ROUTES.FEATURES },
    { name: "Pricing", href: ROUTES.PRICING },
    { name: "About", href: ROUTES.ABOUT },
    { name: "Contact", href: ROUTES.CONTACT },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b",
        scrolled
          ? "bg-[var(--bg-primary)]/80 backdrop-blur-md border-[var(--border)] py-3 shadow-[var(--shadow-sm)]"
          : "bg-transparent border-transparent py-5",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            href={ROUTES.HOME}
            className="flex items-center gap-2 font-bold text-xl tracking-tight"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-[var(--radius-sm)] bg-[var(--accent)] text-white shadow-[var(--shadow-glow)]">
              <Sparkles size={18} />
            </div>
            <span className="gradient-text font-extrabold">Co-Pilot</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-[var(--text-primary)]",
                  isActive(link.href)
                    ? "text-[var(--accent)] font-semibold"
                    : "text-[var(--text-secondary)]",
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <ThemeToggle />

            {isAuthenticated && user ? (
              <div className="relative">
                {/* Backdrop closer when dropdown is open */}
                {profileDropdownOpen && (
                  <div
                    className="fixed inset-0 z-40 cursor-default"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                )}

                <button
                  onClick={() => setProfileDropdownOpen((prev) => !prev)}
                  className="relative z-50 flex items-center gap-2.5 py-1.5 px-3 rounded-full border border-[var(--border)] bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] transition-all cursor-pointer"
                >
                  {/* Avatar or Initials Fallback */}
                  {user.avatar?.url ? (
                    <img
                      src={user.avatar.url}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover border border-[#00be50]"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#00be50] to-[#00be50]/70 flex items-center justify-center text-white font-bold text-xs tracking-wider shadow-sm">
                      {getInitials(user.name)}
                    </div>
                  )}

                  <span className="text-sm font-semibold text-[var(--text-primary)] max-w-[130px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-[var(--text-secondary)] transition-transform duration-200 ${
                      profileDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-lg p-2 z-50 flex flex-col gap-1">
                    <div className="px-3 py-2 border-b border-[var(--border)] mb-1">
                      <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] truncate">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      href={ROUTES.DASHBOARD}
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                      <LayoutDashboard size={14} className="text-[#00be50]" />
                      <span>Dashboard</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href={ROUTES.LOGIN}>
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href={ROUTES.REGISTER}>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<ArrowRight size={14} />}
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <div className="lg:hidden bg-[var(--bg-card)] border-b border-[var(--border)] px-4 pt-2 pb-6 space-y-4 shadow-[var(--shadow-md)]">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "px-3 py-2.5 rounded-[var(--radius-sm)] text-base font-medium transition-colors hover:bg-[var(--bg-secondary)]",
                  isActive(link.href)
                    ? "text-[var(--accent)] bg-[var(--accent-light)]"
                    : "text-[var(--text-secondary)]",
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="border-t border-[var(--border)] pt-4 flex flex-col gap-3">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
                  {user.avatar?.url ? (
                    <img
                      src={user.avatar.url}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover border border-[#00be50]"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#00be50] to-[#00be50]/70 flex items-center justify-center text-white font-bold text-xs tracking-wider">
                      {getInitials(user.name)}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <Link
                  href={ROUTES.DASHBOARD}
                  onClick={() => setIsOpen(false)}
                  className="w-full"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    size="md"
                  >
                    <LayoutDashboard size={16} className="text-[#00be50]" />
                    <span>Dashboard</span>
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 text-red-500 hover:bg-red-500/10 border-red-500/20"
                  size="md"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut size={16} />
                  <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                </Button>
              </>
            ) : (
              <>
                <Link
                  href={ROUTES.LOGIN}
                  onClick={() => setIsOpen(false)}
                  className="w-full"
                >
                  <Button variant="outline" className="w-full" size="md">
                    Sign In
                  </Button>
                </Link>
                <Link
                  href={ROUTES.REGISTER}
                  onClick={() => setIsOpen(false)}
                  className="w-full"
                >
                  <Button
                    variant="primary"
                    className="w-full"
                    size="md"
                    icon={<ArrowRight size={14} />}
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
