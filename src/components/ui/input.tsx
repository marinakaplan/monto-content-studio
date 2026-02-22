"use client";

import { type InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  sub?: string;
  error?: boolean;
};

export function Input({ label, sub, error, className = "", ...props }: InputProps) {
  return (
    <div className="mb-6">
      {label && (
        <label className="block text-[13px] font-semibold tracking-[-0.01em] text-[#1f2128] mb-2.5">
          {label}
        </label>
      )}
      <input
        {...props}
        className={`w-full h-11 px-3.5 rounded-lg text-sm text-[#1f2128] bg-white outline-none transition-all duration-200 placeholder:text-[#a1a5ae] ${
          error
            ? "shadow-[inset_0_0_0_1px_#DF1C41] focus:shadow-[inset_0_0_0_1.5px_#DF1C41,0_0_0_3px_rgba(223,28,65,0.1)]"
            : "shadow-[inset_0_0_0_1px_#e6e7eb] focus:shadow-[inset_0_0_0_1.5px_#7B59FF,0_0_0_3px_rgba(123,89,255,0.12)]"
        } ${className}`}
      />
      {sub && (
        <div className="text-[13px] text-[#a1a5ae] mt-1.5">{sub}</div>
      )}
    </div>
  );
}
