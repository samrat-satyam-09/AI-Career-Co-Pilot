"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { liftOnHover } from "@/lib/motion";

interface CardProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"
  > {
  variant?: "default" | "glass" | "elevated" | "outline";
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  children: React.ReactNode;
}


const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      hover = false,
      padding = "md",
      children,
      className,
      ...props
    },
    ref
  ) => {
    const variants = {
      default:
        "bg-[var(--bg-card)] border border-[var(--border)] shadow-[var(--shadow-sm)]",
      glass:
        "glass",
      elevated:
        "bg-[var(--bg-elevated)] shadow-[var(--shadow-md)]",
      outline:
        "bg-transparent border border-[var(--border)]",
    };

    const paddings = {
      none: "",
      sm: "p-3",
      md: "p-5",
      lg: "p-7",
    };

    const Component = hover ? motion.div : "div";
    const motionProps = hover ? liftOnHover : {};

    return (
      <Component
        ref={ref}
        className={cn(
          "rounded-[var(--radius-md)] transition-all duration-200",
          variants[variant],
          paddings[padding],
          hover && "cursor-pointer",
          className
        )}
        {...motionProps}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = "Card";
export default Card;
