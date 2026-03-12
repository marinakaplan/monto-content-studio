"use client";

import { useState, useEffect } from "react";
import { Loader2, Linkedin, Instagram, Mail, FileText } from "lucide-react";
import type { ScheduledItem } from "@/lib/supabase";
import type { LucideIcon } from "lucide-react";

type ScheduleLaneViewProps = {
  dateFrom: string;
  dateTo: string;
  onSchedule?: (date: string, platform: string) => void;
};

const LANES: { id: string; label: string; icon: LucideIcon; color: string }[] = [
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, color: "#0A66C2" },
  { id: "instagram", label: "Instagram", icon: Instagram, color: "#E1306C" },
  { id: "email", label: "Email", icon: Mail, color: "#545b6d" },
  { id: "blog", label: "Blog", icon: FileText, color: "#1750FB" },
];

function getDaysArray(from: string, to: string): string[] {
  const days: string[] = [];
  const start = new Date(from);
  const end = new Date(to);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function formatDay(dateStr: string): { day: string; weekday: string } {
  const d = new Date(dateStr + "T12:00:00");
  return {
    day: d.getDate().toString(),
    weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
  };
}

export function ScheduleLaneView({ dateFrom, dateTo, onSchedule }: ScheduleLaneViewProps) {
  const [items, setItems] = useState<ScheduledItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/scheduled-items?date_from=${dateFrom}&date_to=${dateTo}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [dateFrom, dateTo]);

  const days = getDaysArray(dateFrom, dateTo);

  function getItemsForCell(platform: string, date: string): ScheduledItem[] {
    return items.filter((it) => it.platform === platform && it.scheduled_date === date);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-[#545b6d]">
        <Loader2 size={16} className="animate-spin mr-2" />
        Loading schedule...
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e6e7eb] rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[600px]">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-[#f8f9fb] border-b border-r border-[#e6e7eb] px-3 py-2 text-left w-[120px]">
                <span className="text-[11px] font-semibold text-[#a1a5ae] uppercase">Platform</span>
              </th>
              {days.map((day) => {
                const { day: d, weekday } = formatDay(day);
                const isToday = day === new Date().toISOString().split("T")[0];
                return (
                  <th
                    key={day}
                    className={`border-b border-r border-[#e6e7eb] px-2 py-2 text-center min-w-[80px] ${
                      isToday ? "bg-[#EFEBFF]" : "bg-[#f8f9fb]"
                    }`}
                  >
                    <span className="text-[10px] text-[#a1a5ae] block">{weekday}</span>
                    <span className={`text-[13px] font-semibold ${isToday ? "text-[#7B59FF]" : "text-[#1f2128]"}`}>
                      {d}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {LANES.map((lane) => {
              const Icon = lane.icon;
              return (
                <tr key={lane.id}>
                  <td className="sticky left-0 z-10 bg-white border-b border-r border-[#e6e7eb] px-3 py-3">
                    <div className="flex items-center gap-2">
                      <Icon size={14} style={{ color: lane.color }} />
                      <span className="text-[12px] font-medium text-[#1f2128]">{lane.label}</span>
                    </div>
                  </td>
                  {days.map((day) => {
                    const cellItems = getItemsForCell(lane.id, day);
                    const isToday = day === new Date().toISOString().split("T")[0];
                    return (
                      <td
                        key={day}
                        className={`border-b border-r border-[#e6e7eb] px-1 py-1 align-top min-h-[48px] cursor-pointer hover:bg-[#f8f9fb] transition-colors ${
                          isToday ? "bg-[#EFEBFF20]" : ""
                        }`}
                        onClick={() => {
                          if (cellItems.length === 0 && onSchedule) {
                            onSchedule(day, lane.id);
                          }
                        }}
                      >
                        <div className="flex flex-col gap-1">
                          {cellItems.map((item) => (
                            <div
                              key={item.id}
                              className="rounded px-1.5 py-1 text-[10px] font-medium truncate"
                              style={{
                                background: lane.color + "15",
                                color: lane.color,
                                borderLeft: `2px solid ${lane.color}`,
                              }}
                            >
                              {item.scheduled_time || "All day"}
                            </div>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
