"use client";

import { type ButtonHTMLAttributes, type ReactNode } from "react";

const variants = {
  primary: "bg-[#7B59FF] text-white shadow-[0_1px_3px_rgba(123,89,255,0.3),0_1px_2px_rgba(0,0,0,0.06)] hover:bg-[#6344E5] hover:shadow-[0_3px_8px_rgba(123,89,255,0.25),0_1px_3px_rgba(0,0,0,0.06)] active:scale-[0.98]",
  secondary: "bg-transparent text-[#7B59FF] shadow-[inset_0_0_0_1.5px_#7B59FF] hover:bg-[#EFEBFF]",
  tertiary: "bg-transparent text-[#545b6d] shadow-[inset_0_0_0_1px_#d0d3da] hover:bg-[#f8f9fb] hover:shadow-[inset_0_0_0_1px_#c4c9d4]",
  ghost: "bg-transparent text-[#7B59FF] hover:bg-[#EFEBFF]",
  neutral: "bg-[#f0f1f3] text-[#545b6d] hover:bg-[#e6e7eb]",
  destructive: "bg-[#DF1C41] text-white shadow-[0_1px_3px_rgba(223,28,65,0.3)] hover:bg-[#c4183a]",
  successOutline: "bg-[#E6F4EA] text-[#007737] shadow-[inset_0_0_0_1px_#00773725] hover:bg-[#d4edda]",
  errorOutline: "bg-[#FFEBEE] text-[#DF1C41] shadow-[inset_0_0_0_1px_#DF1C4125] hover:bg-[#fdd]",
} as const;

const sizes = {
  small: "px-3 py-[6px] text-[13px]",
  default: "px-4 py-2.5 text-sm",
  large: "px-6 py-3 text-[15px]",
} as const;

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  children: ReactNode;
};

export function Btn({ children, variant = "primary", size = "default", disabled, className = "", ...rest }: BtnProps) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-lg cursor-pointer whitespace-nowrap transition-all duration-200 ease-out ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-50 cursor-not-allowed !shadow-none" : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
