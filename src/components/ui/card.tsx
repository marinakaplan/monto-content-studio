"use client";

import { type ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  selected?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
  className?: string;
};

export function Card({ children, selected, hoverable = true, onClick, className = "" }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl transition-all duration-200 ease-out ${
        selected
          ? "shadow-[0_0_0_1.5px_#7B59FF,0_4px_12px_rgba(123,89,255,0.12)] bg-[#FDFCFF] scale-[1.01]"
          : `shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] border border-[#edeef1] ${
              hoverable
                ? "hover:shadow-[0_4px_12px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] hover:border-[#d0d3da]"
                : ""
            }`
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
