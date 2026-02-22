"use client";

import { useState, useRef, useEffect } from "react";
import {
  Linkedin,
  Instagram,
  Figma,
  Mail,
  Link2,
  Check,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DS } from "@/lib/constants";

type Account = {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  connected: boolean;
  handle?: string;
};

const DEFAULT_ACCOUNTS: Account[] = [
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "#0A66C2", connected: false },
  { id: "instagram", name: "Instagram", icon: Instagram, color: "#E4405F", connected: false },
  { id: "gmail", name: "Gmail", icon: Mail, color: "#EA4335", connected: false },
  { id: "figma", name: "Figma", icon: Figma, color: "#A259FF", connected: false },
];

export function ConnectedAccounts({ variant = "header" }: { variant?: "header" | "sidebar" }) {
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>(DEFAULT_ACCOUNTS);
  const ref = useRef<HTMLDivElement>(null);

  const connectedCount = accounts.filter((a) => a.connected).length;

  // Load saved connection state from localStorage (client-side only)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("monto_connected_accounts");
      if (saved) {
        const parsed = JSON.parse(saved) as Record<string, { connected: boolean; handle?: string }>;
        setAccounts(DEFAULT_ACCOUNTS.map((a) => ({
          ...a,
          connected: parsed[a.id]?.connected ?? false,
          handle: parsed[a.id]?.handle,
        })));
      }
    } catch {
      // ignore bad data
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggleConnect(id: string) {
    setAccounts((prev) => {
      const next = prev.map((a) =>
        a.id === id
          ? { ...a, connected: !a.connected, handle: !a.connected ? `@monto_${id}` : undefined }
          : a
      );
      // Persist to localStorage
      const state: Record<string, { connected: boolean; handle?: string }> = {};
      next.forEach((a) => { state[a.id] = { connected: a.connected, handle: a.handle }; });
      localStorage.setItem("monto_connected_accounts", JSON.stringify(state));
      return next;
    });
  }

  // Sidebar variant: inline list of accounts
  if (variant === "sidebar") {
    return (
      <div className="flex flex-col gap-0.5">
        {accounts.map((account) => {
          const Icon = account.icon;
          return (
            <button
              key={account.id}
              onClick={() => toggleConnect(account.id)}
              className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[13px] font-medium transition-colors cursor-pointer border-0 bg-transparent ${
                account.connected
                  ? "text-[#1f2128]"
                  : "text-[#a1a5ae] hover:text-[#545b6d] hover:bg-[#f8f9fb]"
              }`}
            >
              <Icon size={14} color={account.connected ? account.color : "#c4c9d4"} className="shrink-0" />
              <span className="truncate">{account.name}</span>
              {account.connected && (
                <Check size={10} className="ml-auto shrink-0 text-[#007737]" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Header variant: dropdown button
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 h-8 px-3 rounded-md border border-[#e6e7eb] bg-white hover:bg-[#f8f9fb] transition-colors cursor-pointer text-[13px] font-medium text-[#545b6d]"
      >
        <Link2 size={14} color={connectedCount > 0 ? DS.primary : DS.mutedFg} />
        <span>{connectedCount > 0 ? `${connectedCount} Connected` : "Connect"}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-lg border border-[#e6e7eb] shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[#e6e7eb] bg-[#f8f9fb]">
            <div className="text-sm font-semibold text-[#1f2128]">Connected Accounts</div>
            <div className="text-[12px] text-[#545b6d] mt-0.5">
              Connect services to publish content directly.
            </div>
          </div>

          {/* Account list */}
          <div className="py-1.5">
            {accounts.map((account) => {
              const Icon = account.icon;
              return (
                <div
                  key={account.id}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#f8f9fb] transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                    style={{ background: `${account.color}15` }}
                  >
                    <Icon size={16} color={account.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-[#1f2128]">{account.name}</div>
                    {account.connected && account.handle && (
                      <div className="text-[11px] text-[#a1a5ae] truncate">{account.handle}</div>
                    )}
                  </div>
                  <button
                    onClick={() => toggleConnect(account.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] font-medium transition-all cursor-pointer border ${
                      account.connected
                        ? "bg-[#E6F4EA] text-[#007737] border-[#007737]/20 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                        : "bg-white text-[#7B59FF] border-[#7B59FF]/30 hover:bg-[#EFEBFF]"
                    }`}
                  >
                    {account.connected ? (
                      <>
                        <Check size={11} /> Connected
                      </>
                    ) : (
                      <>
                        <ExternalLink size={11} /> Connect
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-[#e6e7eb] bg-[#f8f9fb]">
            <div className="text-[11px] text-[#a1a5ae] text-center">
              Connections are stored locally. OAuth coming soon.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
