"use client";

import { useState, useEffect } from "react";
import { Plus, ChevronDown, ChevronUp, Mail, Check, Loader2 } from "lucide-react";
import { Btn } from "./ui/button";
import { DS, EVENT_CATEGORIES } from "@/lib/constants";
import type { Event } from "@/lib/supabase";

export type EventPrefill = {
  campaign: string;
  message: string;
  context: string;
  pillar: string;
  deadline: string;
  eventId?: string;
};

type EventsPanelProps = {
  onUseEvent: (prefill: EventPrefill) => void;
};

/** Full-color Gmail icon */
function GmailColorIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 6L2 18C2 19.1 2.9 20 4 20H6V10.5L12 14.5L18 10.5V20H20C21.1 20 22 19.1 22 18V6C22 4.34 20.66 3 19 3H18.5L12 8L5.5 3H5C3.34 3 2 4.34 2 6Z" fill="#EA4335"/>
      <path d="M6 20V10.5L2 7.5V18C2 19.1 2.9 20 4 20H6Z" fill="#34A853"/>
      <path d="M18 20H20C21.1 20 22 19.1 22 18V7.5L18 10.5V20Z" fill="#4285F4"/>
      <path d="M6 10.5V4L12 8L18 4V10.5L12 14.5L6 10.5Z" fill="#FBBC05"/>
      <path d="M2 6V7.5L6 10.5V4L5.5 3.5L5 3C3.34 3 2 4.34 2 6Z" fill="#C5221F"/>
      <path d="M22 6V7.5L18 10.5V4L18.5 3.5L19 3C20.66 3 22 4.34 22 6Z" fill="#1565C0"/>
    </svg>
  );
}

export function EventsPanel({ onUseEvent }: EventsPanelProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addMode, setAddMode] = useState<"manual" | "gmail">("manual");
  const [expanded, setExpanded] = useState(false);
  const [newEvent, setNewEvent] = useState({ name: "", date: "", category: "conference" });

  // Gmail connection state (persisted in localStorage)
  const [gmailConnected, setGmailConnected] = useState(false);
  const [gmailEmail, setGmailEmail] = useState("");
  const [gmailConnecting, setGmailConnecting] = useState(false);
  const [gmailInput, setGmailInput] = useState("");

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

  // Load Gmail connection state
  useEffect(() => {
    try {
      const saved = localStorage.getItem("monto_gmail_connected");
      if (saved) {
        const parsed = JSON.parse(saved);
        setGmailConnected(parsed.connected);
        setGmailEmail(parsed.email || "");
      }
    } catch { /* ignore */ }
  }, []);

  async function handleAddEvent() {
    if (!newEvent.name || !newEvent.date) return;
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvent),
    });
    const created = await res.json();
    if (created.id) {
      setEvents((prev) =>
        [...prev, created].sort((a, b) => a.date.localeCompare(b.date))
      );
      setNewEvent({ name: "", date: "", category: "conference" });
      setShowAdd(false);
    }
  }

  function handleGmailConnect() {
    if (!gmailInput.trim() || !gmailInput.includes("@")) return;
    setGmailConnecting(true);

    // Simulate OAuth flow
    setTimeout(() => {
      const state = { connected: true, email: gmailInput.trim() };
      localStorage.setItem("monto_gmail_connected", JSON.stringify(state));
      setGmailConnected(true);
      setGmailEmail(gmailInput.trim());
      setGmailConnecting(false);
      setGmailInput("");
      setShowAdd(false);
    }, 1500);
  }

  function handleGmailDisconnect() {
    localStorage.removeItem("monto_gmail_connected");
    setGmailConnected(false);
    setGmailEmail("");
  }

  function handleUse(event: Event) {
    const dateStr = new Date(event.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const pillarMap: Record<string, string> = {
      conference: "milestone",
      holiday: "culture",
      industry: "thought",
      webinar: "product",
      "product-launch": "product",
    };

    onUseEvent({
      campaign: `${event.name} Campaign`,
      message: event.description || `Content tie-in with ${event.name}`,
      context: `Tie-in with upcoming event: ${event.name} (${dateStr}). ${event.description || ""}`.trim(),
      pillar: pillarMap[event.category] || "",
      deadline: event.date,
      eventId: event.id,
    });
  }

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
    return null;
  }

  const visibleEvents = expanded ? events : events.slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-[#edeef1] mt-4 overflow-hidden">
      {/* Monto Events header */}
      <div className="px-5 pt-4 pb-1">
        <div className="text-[10px] font-semibold text-[#a1a5ae] uppercase tracking-wider">Monto Events</div>
      </div>
      <div className="px-5 pt-2 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-bold text-[#1f2128]">Upcoming Events</span>
            {events.length > 0 && (
              <span className="text-[11px] text-[#b0b4bc] bg-[#f0f1f3] rounded-full px-1.5 py-0.5 font-medium">{events.length}</span>
            )}
          </div>
        </div>
        {/* Quick actions row */}
        <div className="flex items-center gap-3 mt-2">
          <button
            type="button"
            onClick={() => { setShowAdd(true); setAddMode("manual"); }}
            className="flex items-center gap-1.5 text-[12px] font-medium text-[#7B59FF] hover:text-[#6344E5] cursor-pointer transition-colors border-0 bg-transparent p-0"
          >
            <Plus size={12} /> Add manually
          </button>
          <span className="text-[#e6e7eb]">|</span>
          <button
            type="button"
            onClick={() => { setShowAdd(true); setAddMode("gmail"); }}
            className="flex items-center gap-1.5 text-[12px] font-medium text-[#545b6d] hover:text-[#1f2128] cursor-pointer transition-colors border-0 bg-transparent p-0"
          >
            <GmailColorIcon size={13} />
            {gmailConnected ? (
              <span className="text-[#007737]">Gmail synced</span>
            ) : (
              "Connect Gmail"
            )}
          </button>
        </div>

        {/* Add event forms — inline right under actions */}
        {showAdd && (
          <div className="mt-3 pt-3 border-t border-[#edeef1]">
            {/* Manual add form */}
            {addMode === "manual" && (
              <div className="space-y-2">
                <input
                  value={newEvent.name}
                  onChange={(e) => setNewEvent((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Event name"
                  className="w-full h-9 px-3 rounded-lg text-[13px] text-[#1f2128] outline-none transition-all duration-200 shadow-[inset_0_0_0_1px_#e6e7eb] focus:shadow-[inset_0_0_0_1.5px_#7B59FF,0_0_0_3px_rgba(123,89,255,0.12)]"
                />
                <div className="flex gap-1.5">
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent((p) => ({ ...p, date: e.target.value }))}
                    className="flex-1 h-9 px-3 rounded-lg text-[13px] text-[#1f2128] outline-none transition-all duration-200 shadow-[inset_0_0_0_1px_#e6e7eb] focus:shadow-[inset_0_0_0_1.5px_#7B59FF,0_0_0_3px_rgba(123,89,255,0.12)]"
                  />
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent((p) => ({ ...p, category: e.target.value }))}
                    className="h-9 px-2 rounded-lg text-[13px] text-[#1f2128] outline-none transition-all duration-200 shadow-[inset_0_0_0_1px_#e6e7eb] focus:shadow-[inset_0_0_0_1.5px_#7B59FF,0_0_0_3px_rgba(123,89,255,0.12)]"
                  >
                    {EVENT_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-1.5">
                  <Btn variant="primary" size="small" onClick={handleAddEvent} className="flex-1">
                    Add Event
                  </Btn>
                  <Btn variant="neutral" size="small" onClick={() => setShowAdd(false)}>
                    Cancel
                  </Btn>
                </div>
              </div>
            )}

            {/* Gmail connect */}
            {addMode === "gmail" && (
              <div className="space-y-3">
                {gmailConnected ? (
                  /* Already connected state */
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-[#E6F4EA] rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-[0_1px_3px_rgba(0,0,0,0.08)] shrink-0">
                        <GmailColorIcon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium text-[#007737]">Gmail Connected</div>
                        <div className="text-[11px] text-[#545b6d] truncate">{gmailEmail}</div>
                      </div>
                      <Check size={14} className="text-[#007737] shrink-0" />
                    </div>
                    <p className="text-[11px] text-[#545b6d] leading-relaxed">
                      Calendar events will automatically sync and appear here. Conference invites, meetings, and events from your inbox are imported.
                    </p>
                    <div className="flex gap-1.5">
                      <button
                        onClick={handleGmailDisconnect}
                        className="flex-1 h-8 text-[12px] font-medium text-[#DF1C41] bg-[#FFEBEE] hover:bg-[#fdd] rounded-lg cursor-pointer transition-colors"
                      >
                        Disconnect
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAdd(false)}
                        className="h-8 px-3 text-[12px] font-medium text-[#545b6d] bg-[#f0f1f3] hover:bg-[#e6e7eb] rounded-lg cursor-pointer transition-colors border-0"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Connect Gmail form */
                  <div className="space-y-3">
                    <div className="flex items-center gap-2.5 mb-1">
                      <GmailColorIcon size={20} />
                      <div>
                        <div className="text-[13px] font-semibold text-[#1f2128]">Connect Gmail</div>
                        <div className="text-[11px] text-[#a1a5ae]">Import events from Google Calendar</div>
                      </div>
                    </div>
                    <input
                      type="email"
                      value={gmailInput}
                      onChange={(e) => setGmailInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleGmailConnect()}
                      placeholder="your@gmail.com"
                      className="w-full h-9 px-3 rounded-lg text-[13px] text-[#1f2128] outline-none transition-all duration-200 shadow-[inset_0_0_0_1px_#e6e7eb] focus:shadow-[inset_0_0_0_1.5px_#7B59FF,0_0_0_3px_rgba(123,89,255,0.12)]"
                    />
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={handleGmailConnect}
                        disabled={gmailConnecting || !gmailInput.includes("@")}
                        className="flex-1 flex items-center justify-center gap-1.5 h-8 text-[13px] font-semibold text-white bg-[#7B59FF] hover:bg-[#6a4be0] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg cursor-pointer transition-all duration-200 shadow-[0_1px_3px_rgba(123,89,255,0.3)] border-0"
                      >
                        {gmailConnecting ? (
                          <><Loader2 size={13} className="animate-spin" /> Connecting...</>
                        ) : (
                          <><Mail size={13} /> Connect Account</>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAdd(false)}
                        className="h-8 px-3 text-[12px] font-medium text-[#545b6d] bg-[#f0f1f3] hover:bg-[#e6e7eb] rounded-lg cursor-pointer transition-colors border-0"
                      >
                        Cancel
                      </button>
                    </div>
                    <p className="text-[10px] text-[#a1a5ae] leading-relaxed">
                      We&apos;ll import calendar events, conference invites, and event RSVPs. Your email content is never stored.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-5 pb-5">
        {loading ? (
          <div className="text-[13px] text-[#a1a5ae] text-center py-3">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-[13px] text-[#a1a5ae] text-center py-3">
            No upcoming events. Add one below.
          </div>
        ) : (
          <div className="space-y-1">
            {visibleEvents.map((event) => {
              const { month, day } = formatDate(event.date);
              const days = daysUntil(event.date);
              const cat = EVENT_CATEGORIES.find((c) => c.id === event.category);
              const timing = getTimingLabel(days);
              const isUrgent = days <= 7;

              return (
                <div
                  key={event.id}
                  className="group rounded-lg py-3 px-3 -mx-3 transition-colors duration-150 cursor-default hover:bg-[#f8f9fb]"
                >
                  <div className="flex items-start gap-3">
                    {/* Date pill */}
                    <div
                      className="w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0 bg-[#f5f5f7]"
                      style={isUrgent ? { background: `${timing?.color}08` } : {}}
                    >
                      <span
                        className="text-[9px] font-bold leading-none uppercase tracking-wider"
                        style={{ color: isUrgent ? timing?.color : "#a1a5ae" }}
                      >
                        {month}
                      </span>
                      <span
                        className="text-[15px] font-bold leading-tight"
                        style={{ color: isUrgent ? timing?.color : "#1f2128" }}
                      >
                        {day}
                      </span>
                    </div>

                    {/* Event info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <div className="text-[13px] font-medium text-[#1f2128] leading-snug truncate">
                          {event.name}
                        </div>
                        {timing && (
                          <span
                            className="text-[9px] font-bold px-1 py-px rounded shrink-0 uppercase"
                            style={{ color: timing.color, background: timing.bg }}
                          >
                            {timing.text}
                          </span>
                        )}
                      </div>
                      {event.description && (
                        <div className="text-[11px] text-[#8b8f9a] mt-0.5 leading-snug line-clamp-1">
                          {event.description}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className="text-[10px] font-medium px-1.5 py-px rounded"
                          style={{ color: cat?.color || "#545b6d", background: cat?.bg || "#f3f4f6" }}
                        >
                          {cat?.label}
                        </span>
                        {!timing && (
                          <span className="text-[10px] text-[#b0b4bc]">
                            {days}d
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Use button */}
                    <Btn
                      variant="ghost"
                      size="small"
                      onClick={() => handleUse(event)}
                      className="!px-1.5 !py-0.5 text-[11px] opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0"
                    >
                      Use
                    </Btn>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Show more/less */}
        {events.length > 5 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full text-xs text-[#7B59FF] font-semibold mt-2 flex items-center justify-center gap-1 cursor-pointer hover:underline"
          >
            {expanded ? (
              <>Show less <ChevronUp size={10} /></>
            ) : (
              <>Show {events.length - 5} more <ChevronDown size={10} /></>
            )}
          </button>
        )}

      </div>
    </div>
  );
}
