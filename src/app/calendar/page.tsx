"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  ArrowRight,
  Loader2,
  Calendar as CalendarIcon,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Btn } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DS, EVENT_CATEGORIES } from "@/lib/constants";
import type { Event } from "@/lib/supabase";

type Recommendation = {
  campaign_name: string;
  event_name: string;
  pillar: string;
  urgency: "high" | "medium" | "low";
  key_message: string;
  platforms: string[];
  rationale: string;
  icp: string;
};

export default function CalendarPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ name: "", date: "", category: "conference", description: "" });
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const loadEvents = useCallback(() => {
    fetch("/api/events?upcoming=false")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEvents(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  async function seedEvents() {
    setSeeding(true);
    try {
      const res = await fetch("/api/seed-events", { method: "POST" });
      const data = await res.json();
      if (data.seeded > 0) {
        loadEvents();
      }
    } catch (err) {
      console.error("Seed error:", err);
    }
    setSeeding(false);
  }

  async function loadRecommendations() {
    setLoadingRecs(true);
    try {
      const res = await fetch("/api/ai-recommendations", { method: "POST" });
      const data = await res.json();
      if (data.recommendations) {
        setRecommendations(data.recommendations);
      }
    } catch (err) {
      console.error("Recommendations error:", err);
    }
    setLoadingRecs(false);
  }

  async function handleAddEvent() {
    if (!newEvent.name || !newEvent.date) return;
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvent),
    });
    const created = await res.json();
    if (created.id) {
      setEvents((prev) => [...prev, created].sort((a, b) => a.date.localeCompare(b.date)));
      setNewEvent({ name: "", date: "", category: "conference", description: "" });
      setShowAddModal(false);
    }
  }

  function handleCreateCampaign(event: Event) {
    const dateStr = new Date(event.date).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
    const pillarMap: Record<string, string> = {
      conference: "milestone", holiday: "culture", industry: "thought",
      webinar: "product", "product-launch": "product",
    };
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

  function handleUseRecommendation(rec: Recommendation) {
    const prefill = {
      campaign: rec.campaign_name,
      message: rec.key_message,
      context: rec.rationale,
      pillar: rec.pillar,
      deadline: "",
    };
    sessionStorage.setItem("eventPrefill", JSON.stringify(prefill));
    router.push("/brief");
  }

  // Calendar helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  function getEventsForDay(day: number): Event[] {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter((e) => e.date === dateStr);
  }

  function getDayStr(day: number): string {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const selectedEvents = selectedDate ? events.filter((e) => e.date === selectedDate) : [];

  const urgencyColors = {
    high: { color: DS.error, bg: DS.errorBg },
    medium: { color: DS.warning, bg: DS.warningBg },
    low: { color: DS.info, bg: DS.infoBg },
  };

  return (
    <div className="px-8 pb-12 max-w-[1200px] mx-auto pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1f2128]">Calendar</h1>
          <p className="text-sm text-[#545b6d] mt-1">
            Plan campaigns around key events and get AI-powered content recommendations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {events.length === 0 && (
            <Btn variant="secondary" onClick={seedEvents} disabled={seeding}>
              {seeding ? <Loader2 size={14} className="animate-spin" /> : <CalendarIcon size={14} />}
              {seeding ? "Seeding..." : "Load Sample Events"}
            </Btn>
          )}
          <Btn variant="secondary" onClick={loadRecommendations} disabled={loadingRecs}>
            {loadingRecs ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {loadingRecs ? "Analyzing..." : "AI Recommendations"}
          </Btn>
          <Btn variant="primary" onClick={() => setShowAddModal(true)}>
            <Plus size={14} /> Add Event
          </Btn>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Calendar Grid */}
        <div className="bg-white border border-[#e6e7eb] rounded-xl overflow-hidden">
          {/* Month navigation */}
          <div className="px-5 py-4 border-b border-[#e6e7eb] flex items-center justify-between">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#f8f9fb] text-[#545b6d] cursor-pointer transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <h2 className="text-[15px] font-semibold text-[#1f2128]">{monthName}</h2>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#f8f9fb] text-[#545b6d] cursor-pointer transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-[#e6e7eb]">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-center text-[11px] font-semibold text-[#a1a5ae] uppercase tracking-wider py-2.5">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, i) => {
              if (day === null) {
                return <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-[#f0f1f3] bg-[#fafbfc]" />;
              }

              const dayStr = getDayStr(day);
              const dayEvents = getEventsForDay(day);
              const isToday = dayStr === todayStr;
              const isSelected = dayStr === selectedDate;
              const isPast = new Date(dayStr) < today;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDate(dayStr === selectedDate ? null : dayStr)}
                  className={`min-h-[100px] border-b border-r border-[#f0f1f3] p-1.5 cursor-pointer transition-colors ${
                    isSelected ? "bg-[#EFEBFF]" : isPast ? "bg-[#fafbfc]" : "bg-white hover:bg-[#f8f9fb]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[13px] font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                        isToday
                          ? "bg-[#7B59FF] text-white font-bold"
                          : isPast
                            ? "text-[#b0b4bc]"
                            : "text-[#1f2128]"
                      }`}
                    >
                      {day}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-bold text-[#7B59FF] bg-[#EFEBFF] rounded-full w-5 h-5 flex items-center justify-center">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>
                  {dayEvents.slice(0, 2).map((e) => {
                    const cat = EVENT_CATEGORIES.find((c) => c.id === e.category);
                    return (
                      <div
                        key={e.id}
                        className="text-[10px] font-medium px-1.5 py-0.5 rounded mb-0.5 truncate"
                        style={{ color: cat?.color || DS.muted, background: cat?.bg || DS.neutralBg }}
                      >
                        {e.name}
                      </div>
                    );
                  })}
                  {dayEvents.length > 2 && (
                    <div className="text-[10px] text-[#7B59FF] font-medium px-1.5">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Selected date events */}
          {selectedDate && (
            <div className="bg-white border border-[#e6e7eb] rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-[#f8f9fb] border-b border-[#e6e7eb] flex items-center justify-between">
                <span className="text-[13px] font-semibold text-[#1f2128]">
                  {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
                    weekday: "long", month: "long", day: "numeric",
                  })}
                </span>
                <button onClick={() => setSelectedDate(null)} className="text-[#a1a5ae] hover:text-[#545b6d] cursor-pointer">
                  <X size={14} />
                </button>
              </div>
              <div className="p-4">
                {selectedEvents.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-[13px] text-[#a1a5ae] mb-3">No events on this day</p>
                    <Btn
                      variant="secondary"
                      size="small"
                      onClick={() => {
                        setNewEvent((prev) => ({ ...prev, date: selectedDate }));
                        setShowAddModal(true);
                      }}
                    >
                      <Plus size={12} /> Add Event
                    </Btn>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedEvents.map((event) => {
                      const cat = EVENT_CATEGORIES.find((c) => c.id === event.category);
                      const CatIcon = cat?.icon || CalendarIcon;
                      return (
                        <div key={event.id} className="border border-[#e6e7eb] rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1.5">
                            <div
                              className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                              style={{ background: cat?.bg }}
                            >
                              <CatIcon size={13} style={{ color: cat?.color }} />
                            </div>
                            <span className="text-[13px] font-semibold text-[#1f2128]">{event.name}</span>
                          </div>
                          {event.description && (
                            <p className="text-[12px] text-[#545b6d] leading-snug mb-2">{event.description}</p>
                          )}
                          <div className="flex items-center gap-2">
                            <Badge color={cat?.color} bg={cat?.bg} icon={CatIcon} className="text-[10px] !py-0.5 !px-1.5">
                              {cat?.label}
                            </Badge>
                            {event.relevance_tags?.slice(0, 2).map((tag) => (
                              <span key={tag} className="text-[10px] text-[#71757e] bg-[#f3f4f6] rounded px-1.5 py-0.5">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <Btn
                            variant="primary"
                            size="small"
                            className="w-full mt-3"
                            onClick={() => handleCreateCampaign(event)}
                          >
                            <Sparkles size={12} /> Create Campaign <ArrowRight size={12} />
                          </Btn>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-white border border-[#e6e7eb] rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-r from-[#EFEBFF] to-[#f8f9fb] border-b border-[#e6e7eb] flex items-center gap-2">
                <Sparkles size={14} color={DS.primary} />
                <span className="text-[13px] font-semibold text-[#1f2128]">AI Recommendations</span>
              </div>
              <div className="p-3 space-y-2">
                {recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="border border-[#e6e7eb] rounded-lg p-3 hover:border-[#c4c9d4] transition-colors cursor-pointer"
                    onClick={() => handleUseRecommendation(rec)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] font-semibold text-[#1f2128]">{rec.campaign_name}</span>
                      <span
                        className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded"
                        style={{
                          color: urgencyColors[rec.urgency]?.color,
                          background: urgencyColors[rec.urgency]?.bg,
                        }}
                      >
                        {rec.urgency}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#545b6d] leading-snug mb-1.5">{rec.key_message}</p>
                    <p className="text-[10px] text-[#a1a5ae] italic mb-2">{rec.rationale}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-medium text-[#7B59FF] bg-[#EFEBFF] rounded px-1.5 py-0.5">
                        {rec.pillar}
                      </span>
                      {rec.platforms?.slice(0, 3).map((p) => (
                        <span key={p} className="text-[10px] text-[#71757e] bg-[#f3f4f6] rounded px-1.5 py-0.5">
                          {p}
                        </span>
                      ))}
                      <span className="text-[10px] text-[#a1a5ae]">
                        {rec.icp === "both" ? "All ICPs" : rec.icp}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-[11px] font-medium text-[#7B59FF]">
                      <ArrowRight size={10} /> Use this recommendation
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming events list */}
          <div className="bg-white border border-[#e6e7eb] rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-[#f8f9fb] border-b border-[#e6e7eb]">
              <span className="text-[13px] font-semibold text-[#1f2128]">Upcoming Events</span>
            </div>
            <div className="p-3">
              {loading ? (
                <div className="text-center py-4 text-[13px] text-[#a1a5ae]">Loading...</div>
              ) : events.filter((e) => e.date >= todayStr).length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-[13px] text-[#a1a5ae] mb-2">No upcoming events</p>
                  <Btn variant="secondary" size="small" onClick={seedEvents} disabled={seeding}>
                    {seeding ? "Loading..." : "Load Sample Events"}
                  </Btn>
                </div>
              ) : (
                <div className="space-y-1">
                  {events
                    .filter((e) => e.date >= todayStr)
                    .slice(0, 8)
                    .map((event) => {
                      const cat = EVENT_CATEGORIES.find((c) => c.id === event.category);
                      const d = new Date(event.date + "T12:00:00");
                      const daysLeft = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                      return (
                        <div
                          key={event.id}
                          className="flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-[#f8f9fb] cursor-pointer transition-colors"
                          onClick={() => {
                            setCurrentDate(new Date(event.date + "T12:00:00"));
                            setSelectedDate(event.date);
                          }}
                        >
                          <div
                            className="w-8 h-8 rounded-md flex flex-col items-center justify-center shrink-0"
                            style={{ background: cat?.bg || DS.neutralBg }}
                          >
                            <span className="text-[8px] font-bold uppercase" style={{ color: cat?.color }}>
                              {d.toLocaleDateString("en-US", { month: "short" })}
                            </span>
                            <span className="text-[12px] font-bold leading-none" style={{ color: cat?.color }}>
                              {d.getDate()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[12px] font-medium text-[#1f2128] truncate">{event.name}</div>
                            <div className="text-[10px] text-[#a1a5ae]">
                              {daysLeft === 0 ? "Today" : daysLeft === 1 ? "Tomorrow" : `in ${daysLeft}d`}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4 overflow-hidden shadow-xl">
            <div className="px-5 py-4 border-b border-[#e6e7eb] flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-[#1f2128]">Add Event</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#a1a5ae] hover:text-[#545b6d] cursor-pointer">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-[12px] font-medium text-[#545b6d] mb-1">Event Name</label>
                <input
                  value={newEvent.name}
                  onChange={(e) => setNewEvent((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g., SaaStr Annual 2026"
                  className="w-full h-10 px-3 rounded-lg text-[13px] text-[#1f2128] outline-none transition-all shadow-[inset_0_0_0_1px_#e6e7eb] focus:shadow-[inset_0_0_0_1.5px_#7B59FF,0_0_0_3px_rgba(123,89,255,0.12)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-[#545b6d] mb-1">Date</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent((p) => ({ ...p, date: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg text-[13px] text-[#1f2128] outline-none transition-all shadow-[inset_0_0_0_1px_#e6e7eb] focus:shadow-[inset_0_0_0_1.5px_#7B59FF,0_0_0_3px_rgba(123,89,255,0.12)]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#545b6d] mb-1">Category</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent((p) => ({ ...p, category: e.target.value }))}
                    className="w-full h-10 px-3 rounded-lg text-[13px] text-[#1f2128] outline-none transition-all shadow-[inset_0_0_0_1px_#e6e7eb] focus:shadow-[inset_0_0_0_1.5px_#7B59FF,0_0_0_3px_rgba(123,89,255,0.12)]"
                  >
                    {EVENT_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[#545b6d] mb-1">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Why is this event relevant for Monto content?"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg text-[13px] text-[#1f2128] outline-none transition-all resize-none shadow-[inset_0_0_0_1px_#e6e7eb] focus:shadow-[inset_0_0_0_1.5px_#7B59FF,0_0_0_3px_rgba(123,89,255,0.12)]"
                />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-[#e6e7eb] flex justify-end gap-2">
              <Btn variant="neutral" onClick={() => setShowAddModal(false)}>Cancel</Btn>
              <Btn variant="primary" onClick={handleAddEvent}>Add Event</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
