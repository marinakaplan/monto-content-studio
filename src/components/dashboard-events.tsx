"use client";

import { useState, useEffect } from "react";
import { Calendar, Plus, ArrowRight, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Btn } from "./ui/button";
import { Badge } from "./ui/badge";
import { DS, EVENT_CATEGORIES } from "@/lib/constants";
import type { Event } from "@/lib/supabase";

export function DashboardEvents() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch("/api/events?upcoming=true")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Failed to load events:", err);
        setLoading(false);
      });
  }, []);

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    return {
      month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      day: d.getDate(),
    };
  }

  function daysUntil(dateStr: string): number {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  function getTimingLabel(days: number): { text: string; color: string; bg: string } | null {
    if (days === 0) return { text: "TODAY", color: DS.error, bg: DS.errorBg };
    if (days === 1) return { text: "TOMORROW", color: DS.warning, bg: DS.warningBg };
    if (days <= 7) return { text: "THIS WEEK", color: DS.info, bg: DS.infoBg };
    if (days <= 14) return { text: "NEXT WEEK", color: DS.muted, bg: DS.neutralBg };
    return null;
  }

  function handleCreateFromEvent(event: Event) {
    const dateStr = new Date(event.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    // Map event category to a suggested content pillar
    const pillarMap: Record<string, string> = {
      conference: "milestone",
      holiday: "culture",
      industry: "thought",
      webinar: "product",
      "product-launch": "product",
    };

    // Store structured prefill data
    const prefill = {
      campaign: `${event.name} Campaign`,
      message: event.description || `Content tie-in with ${event.name}`,
      context: `Tie-in with upcoming event: ${event.name} (${dateStr}). ${event.description || ""}`.trim(),
      pillar: pillarMap[event.category] || "",
      deadline: event.date,
    };
    sessionStorage.setItem("eventPrefill", JSON.stringify(prefill));
    router.push("/brief");
  }

  const visibleEvents = expanded ? events : events.slice(0, 3);

  if (loading) {
    return (
      <div className="bg-white border border-[#e6e7eb] rounded-lg overflow-hidden">
        <div className="px-5 py-3 bg-[#f8f9fb] border-b border-[#e6e7eb]">
          <div className="flex items-center gap-2">
            <Calendar size={15} color={DS.mutedFg} />
            <span className="text-sm font-semibold text-[#1f2128]">Upcoming Events</span>
          </div>
        </div>
        <div className="p-6 text-center text-sm text-[#71757e]">Loading events...</div>
      </div>
    );
  }

  if (events.length === 0) return null;

  return (
    <div className="bg-white border border-[#e6e7eb] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 bg-[#f8f9fb] border-b border-[#e6e7eb] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={15} color={DS.primary} />
          <span className="text-sm font-semibold text-[#1f2128]">Upcoming Events</span>
          <span className="text-[13px] text-[#71757e]">({events.length})</span>
        </div>
        <Btn variant="ghost" size="small" onClick={() => router.push("/brief")}>
          <Plus size={13} /> Add Event
        </Btn>
      </div>

      {/* Events grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visibleEvents.map((event) => {
            const { month, day } = formatDate(event.date);
            const days = daysUntil(event.date);
            const cat = EVENT_CATEGORIES.find((c) => c.id === event.category);
            const CatIcon = cat?.icon || Calendar;
            const timing = getTimingLabel(days);
            const isUrgent = days <= 7;

            return (
              <div
                key={event.id}
                className={`group relative bg-white border rounded-lg p-3.5 transition-all hover:shadow-sm cursor-pointer ${
                  isUrgent
                    ? "border-l-[3px]"
                    : "border-[#e6e7eb] hover:border-[#c4c9d4]"
                }`}
                style={isUrgent ? { borderLeftColor: timing?.color || DS.info, borderTopColor: "#e6e7eb", borderRightColor: "#e6e7eb", borderBottomColor: "#e6e7eb" } : {}}
                onClick={() => handleCreateFromEvent(event)}
              >
                <div className="flex items-start gap-3">
                  {/* Date pill */}
                  <div
                    className="w-12 h-12 rounded-lg flex flex-col items-center justify-center shrink-0"
                    style={{
                      background: isUrgent ? `${timing?.color}10` : "#f8f9fb",
                      border: `1px solid ${isUrgent ? `${timing?.color}30` : "#e6e7eb"}`,
                    }}
                  >
                    <span
                      className="text-[10px] font-bold leading-none"
                      style={{ color: isUrgent ? timing?.color : "#a1a5ae" }}
                    >
                      {month}
                    </span>
                    <span
                      className="text-base font-bold leading-none mt-0.5"
                      style={{ color: isUrgent ? timing?.color : "#1f2128" }}
                    >
                      {day}
                    </span>
                  </div>

                  {/* Event details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-sm font-semibold text-[#1f2128] leading-snug truncate">
                        {event.name}
                      </span>
                    </div>
                    {timing && (
                      <span
                        className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mb-1"
                        style={{ color: timing.color, background: timing.bg }}
                      >
                        {timing.text}
                      </span>
                    )}
                    {event.description && (
                      <div className="text-[12px] text-[#545b6d] leading-snug line-clamp-2">
                        {event.description}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Badge
                        color={cat?.color}
                        bg={cat?.bg}
                        icon={CatIcon}
                        className="text-[11px] !py-0.5 !px-2 !gap-0.5"
                      >
                        {cat?.label}
                      </Badge>
                      {!timing && (
                        <span className="text-[11px] text-[#71757e]">
                          in {days}d
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hover CTA */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white via-white to-transparent pt-4 pb-2.5 px-3.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-lg">
                  <div className="flex items-center justify-center gap-1 text-[12px] font-semibold text-[#7B59FF]">
                    <Sparkles size={12} /> Create campaign from this event <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Show more/less */}
        {events.length > 3 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full text-[13px] text-[#7B59FF] font-medium mt-3 flex items-center justify-center gap-1 cursor-pointer hover:underline"
          >
            {expanded ? (
              <>Show less <ChevronUp size={12} /></>
            ) : (
              <>Show {events.length - 3} more events <ChevronDown size={12} /></>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
