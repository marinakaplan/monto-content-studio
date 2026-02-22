"use client";

import { Check } from "lucide-react";

type Step = {
  label: string;
  sub: string;
};

type StepNavProps = {
  steps: Step[];
  current: number;
};

export function StepNav({ steps, current }: StepNavProps) {
  return (
    <div className="flex items-center py-5 pb-8 max-w-[640px] mx-auto">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const upcoming = i > current;
        return (
          <div key={i} className={`flex items-center ${i < steps.length - 1 ? "flex-1" : ""}`}>
            {/* Step circle + text */}
            <div className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-all duration-300 ${
                  done
                    ? "bg-[#7B59FF] text-white"
                    : active
                    ? "bg-[#1f2128] text-white"
                    : "bg-[#f0f1f3] text-[#c4c9d4]"
                }`}
              >
                {done ? <Check size={12} strokeWidth={3} /> : i + 1}
              </div>
              <div>
                <div
                  className={`text-[13px] leading-none transition-colors duration-300 ${
                    active
                      ? "font-semibold text-[#1f2128]"
                      : done
                      ? "font-medium text-[#545b6d]"
                      : "font-medium text-[#c4c9d4]"
                  }`}
                >
                  {s.label}
                </div>
                <div
                  className={`text-[11px] mt-1 transition-colors duration-300 ${
                    upcoming ? "text-[#d0d3d9]" : "text-[#a1a5ae]"
                  }`}
                >
                  {s.sub}
                </div>
              </div>
            </div>

            {/* Connecting line */}
            {i < steps.length - 1 && (
              <div className="flex-1 mx-5 min-w-[32px]">
                <div
                  className={`h-px transition-colors duration-500 ${
                    done ? "bg-[#7B59FF]" : "bg-[#e6e7eb]"
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
