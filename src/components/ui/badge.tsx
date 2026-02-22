"use client";

import { type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type BadgeProps = {
  children: ReactNode;
  color?: string;
  bg?: string;
  icon?: LucideIcon;
  className?: string;
};

export function Badge({ children, color, bg, icon: Icon, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[12px] font-semibold tracking-wide ${className}`}
      style={{ color: color || "#545b6d", background: bg || "#F3F4F6" }}
    >
      {Icon && <Icon size={11} />}
      {children}
    </span>
  );
}
