"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className,
  showLabel = false,
}) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const themes = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ] as const;

  return (
    <div
      className={cn(
        "flex items-center gap-1 p-1 rounded-[var(--radius-full)] bg-[var(--bg-secondary)] border border-[var(--border)]",
        className
      )}
    >
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-full)] text-xs font-medium transition-all duration-200",
            theme === value
              ? "bg-[var(--accent)] text-white shadow-[var(--shadow-sm)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          )}
          title={`Switch to ${label} theme`}
          aria-label={`Switch to ${label} theme`}
        >
          <Icon size={14} />
          {showLabel && <span>{label}</span>}
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;
