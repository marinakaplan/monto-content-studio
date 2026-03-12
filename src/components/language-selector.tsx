"use client";

import { LANGUAGES } from "@/lib/constants";

type LanguageSelectorProps = {
  value: string;
  onChange: (lang: string) => void;
  size?: "sm" | "md";
};

export function LanguageSelector({ value, onChange, size = "md" }: LanguageSelectorProps) {
  const selected = LANGUAGES.find((l) => l.id === value);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`appearance-none bg-white border border-[#c4c9d4] rounded-lg text-[#1f2128] font-medium transition-colors cursor-pointer hover:border-[#7B59FF] focus:outline-none focus:border-[#7B59FF] focus:ring-2 focus:ring-[rgba(123,89,255,0.12)] ${
        size === "sm" ? "px-2.5 py-1.5 text-[12px]" : "px-3 py-2 text-[13px]"
      }`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        backgroundPosition: "right 8px center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "16px",
        paddingRight: size === "sm" ? "28px" : "32px",
      }}
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.id} value={lang.id}>
          {lang.flag} {lang.label}
        </option>
      ))}
    </select>
  );
}
