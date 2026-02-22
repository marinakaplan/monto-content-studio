"use client";

import { type TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  sub?: string;
};

export function Textarea({ label, sub, className = "", ...props }: TextareaProps) {
  return (
    <div className="mb-6">
      {label && (
        <label className="block text-[13px] font-semibold tracking-[-0.01em] text-[#1f2128] mb-2.5">
          {label}
        </label>
      )}
      <textarea
        {...props}
        className={`w-full px-3.5 py-3 rounded-lg text-sm text-[#1f2128] bg-white outline-none resize-y transition-all duration-200 placeholder:text-[#a1a5ae] shadow-[inset_0_0_0_1px_#e6e7eb] focus:shadow-[inset_0_0_0_1.5px_#7B59FF,0_0_0_3px_rgba(123,89,255,0.12)] ${className}`}
      />
      {sub && (
        <div className="text-[13px] text-[#a1a5ae] mt-1.5">{sub}</div>
      )}
    </div>
  );
}
