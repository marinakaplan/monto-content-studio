"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, Check } from "lucide-react";
import { DS } from "@/lib/constants";
import type { TeamMember } from "@/lib/supabase";

const STORAGE_KEY = "currentTeamMember";

type TeamMemberPickerProps = {
  onSelect?: (member: TeamMember) => void;
};

export function useCurrentMember(): TeamMember | null {
  const [member, setMember] = useState<TeamMember | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as TeamMember;
      setMember(parsed);
    } catch {
      // ignore
    }

    const handler = () => {
      const updated = localStorage.getItem(STORAGE_KEY);
      if (updated) {
        try {
          setMember(JSON.parse(updated));
        } catch {
          // ignore
        }
      } else {
        setMember(null);
      }
    };

    window.addEventListener("storage", handler);
    // Custom event for same-tab updates
    window.addEventListener("currentMemberChanged", handler);
    return () => {
      window.removeEventListener("storage", handler);
      window.removeEventListener("currentMemberChanged", handler);
    };
  }, []);

  return member;
}

export function TeamMemberPicker({ onSelect }: TeamMemberPickerProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selected, setSelected] = useState<TeamMember | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSelected(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  // Fetch team members
  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/team-members");
      if (res.ok) {
        const data: TeamMember[] = await res.json();
        setMembers(data.filter((m) => m.is_active));

        // If no member selected yet, try to match stored ID
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored) as TeamMember;
            const match = data.find((m) => m.id === parsed.id);
            if (match) setSelected(match);
          } catch {
            // ignore
          }
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleSelect = (member: TeamMember) => {
    setSelected(member);
    setOpen(false);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(member));
    // Dispatch custom event for same-tab listeners
    window.dispatchEvent(new Event("currentMemberChanged"));
    onSelect?.(member);
  };

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 hover:bg-opacity-80"
        style={{
          background: open ? DS.primaryLighter : "transparent",
          border: "none",
        }}
      >
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold shrink-0"
          style={{
            background: selected ? DS.primaryLighter : DS.neutralBg,
            color: selected ? DS.primary : DS.muted,
          }}
        >
          {selected ? getInitial(selected.name) : "?"}
        </div>

        {/* Name */}
        <div className="flex-1 text-left min-w-0">
          <p className="text-[13px] font-semibold truncate" style={{ color: DS.fg }}>
            {loading ? "Loading..." : selected ? selected.name : "Select identity"}
          </p>
          {selected && (
            <p className="text-[11px] truncate" style={{ color: DS.mutedFg }}>
              {selected.role}
            </p>
          )}
        </div>

        <ChevronDown
          size={14}
          className="shrink-0 transition-transform duration-200"
          style={{
            color: DS.mutedFg,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 left-0 right-0 mt-1 rounded-lg py-1 overflow-auto max-h-[280px]"
          style={{
            background: DS.white,
            border: `1px solid ${DS.borderLight}`,
            boxShadow: DS.shadowMd,
          }}
        >
          {members.length === 0 && !loading && (
            <p className="text-[12px] px-3 py-2" style={{ color: DS.mutedFg }}>
              No team members found.
            </p>
          )}
          {members.map((member) => {
            const isSelected = selected?.id === member.id;
            return (
              <button
                key={member.id}
                onClick={() => handleSelect(member)}
                className="flex items-center gap-2.5 w-full px-3 py-2 cursor-pointer transition-colors duration-100 border-0"
                style={{
                  background: isSelected ? DS.primaryLighter : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = DS.bg;
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "transparent";
                }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0"
                  style={{
                    background: isSelected ? DS.primary : DS.neutralBg,
                    color: isSelected ? DS.white : DS.muted,
                  }}
                >
                  {getInitial(member.name)}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-[13px] font-medium truncate" style={{ color: DS.fg }}>
                    {member.name}
                  </p>
                  <p className="text-[11px] truncate" style={{ color: DS.mutedFg }}>
                    {member.email}
                  </p>
                </div>
                <span
                  className="text-[10px] font-medium rounded px-1.5 py-0.5 shrink-0"
                  style={{ color: DS.mutedFg, background: DS.neutralBg }}
                >
                  {member.role}
                </span>
                {isSelected && (
                  <Check size={14} style={{ color: DS.primary }} className="shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
