"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  variant = "text",
  width,
  height,
  className,
  ...props
}) => {
  const variants = {
    text: "h-4 rounded-[var(--radius-sm)]",
    circular: "rounded-full",
    rectangular: "rounded-[var(--radius-md)]",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-[var(--bg-secondary)]",
        variants[variant],
        className
      )}
      style={{ width, height }}
      {...props}
    />
  );
};

// Pre-built skeleton patterns
export const CardSkeleton = () => (
  <div className="p-5 bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius-md)] space-y-3">
    <Skeleton width="60%" height={20} />
    <Skeleton width="100%" height={14} />
    <Skeleton width="80%" height={14} />
    <div className="flex gap-2 pt-2">
      <Skeleton width={60} height={24} variant="rectangular" />
      <Skeleton width={60} height={24} variant="rectangular" />
    </div>
  </div>
);

export const TableRowSkeleton = () => (
  <div className="flex items-center gap-4 px-4 py-3 border-b border-[var(--border)]">
    <Skeleton variant="circular" width={32} height={32} />
    <Skeleton width="30%" height={14} />
    <Skeleton width="20%" height={14} />
    <Skeleton width="15%" height={24} variant="rectangular" />
  </div>
);

export default Skeleton;
