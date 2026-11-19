"use client";

import React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "error" | "info" | "pro" | "free";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  dot?: boolean;
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  size = "sm",
  dot = false,
  children,
  className,
  ...props
}) => {
  const variants: Record<BadgeVariant, string> = {
    default:
      "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border)]",
    success:
      "bg-[var(--success-light)] text-[var(--success)] border-[var(--success)]",
    warning:
      "bg-[var(--warning-light)] text-[var(--warning)] border-[var(--warning)]",
    error:
      "bg-[var(--error-light)] text-[var(--error)] border-[var(--error)]",
    info:
      "bg-[var(--info-light)] text-[var(--info)] border-[var(--info)]",
    pro:
      "bg-[var(--accent-light)] text-[var(--accent)] border-[var(--accent)]",
    free:
      "bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border)]",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  const dotColors: Record<BadgeVariant, string> = {
    default: "bg-[var(--text-muted)]",
    success: "bg-[var(--success)]",
    warning: "bg-[var(--warning)]",
    error: "bg-[var(--error)]",
    info: "bg-[var(--info)]",
    pro: "bg-[var(--accent)]",
    free: "bg-[var(--text-muted)]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-[var(--radius-full)] border",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full", dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
