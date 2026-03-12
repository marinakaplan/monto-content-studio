"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  Target,
  Award,
  PartyPopper,
  Heart,
  Rocket,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Calendar as CalendarIcon,
  Linkedin,
  Instagram,
  Mail,
  FileText,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { DS, PILLARS } from "@/lib/constants";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Goal = {
  id: string;
  label: string;
  desc: string;
  icon: LucideIcon;
};

type HookOption = {
  id: string;
  label: string;
  inputType: "events" | "text" | "textarea" | "date" | "none";
  placeholder?: string;
};

type Campaign = {
  name: string;
  key_message: string;
  pillar: string;
  platforms: string[];
  timing: string;
  hook: string;
  sample_headline: string;
};

type EventItem = {
  id: string;
  name: string;
  date: string;
  category: string;
  description?: string;
};

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const GOALS: Goal[] = [
  { id: "awareness", label: "Drive Awareness", desc: "Get Monto's name in front of new prospects", icon: Eye },
  { id: "leads", label: "Generate Leads", desc: "Convert interest into pipeline", icon: Target },
  { id: "authority", label: "Build Authority", desc: "Position Monto as thought leader", icon: Award },
  { id: "wins", label: "Celebrate Wins", desc: "Share milestones & customer success", icon: PartyPopper },
  { id: "community", label: "Engage Community", desc: "Build brand personality & culture", icon: Heart },
  { id: "launch", label: "Launch Product", desc: "Announce new features or updates", icon: Rocket },
];

const HOOK_OPTIONS: HookOption[] = [
  { id: "event", label: "Tie to an upcoming event", inputType: "events" },
  { id: "news", label: "React to industry news", inputType: "text", placeholder: "What's the news or trend?" },
  { id: "customer", label: "Share a customer story", inputType: "text", placeholder: "Customer name and context..." },
  { id: "pain", label: "Address a pain point", inputType: "text", placeholder: "Describe the pain point..." },
  { id: "seasonal", label: "Seasonal / holiday tie-in", inputType: "date" },
  { id: "freeform", label: "Free-form idea", inputType: "textarea", placeholder: "Describe your campaign idea..." },
];

const PLATFORM_ICONS: Record<string, LucideIcon> = {
  linkedin: Linkedin,
  instagram: Instagram,
  email: Mail,
  blog: FileText,
};

const PILLAR_MAP = Object.fromEntries(PILLARS.map((p) => [p.id, p]));

/* ------------------------------------------------------------------ */
/*  Step Indicator                                                     */
/* ------------------------------------------------------------------ */

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-10">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold transition-all duration-300"
              style={{
                background: done ? DS.primary : active ? DS.primary : DS.borderLight,
                color: done || active ? "#fff" : DS.muted,
              }}
            >
              {done ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                step
              )}
            </div>
            {i < total - 1 && (
              <div
                className="h-[2px] w-10 rounded transition-all duration-300"
                style={{ background: done ? DS.primary : DS.borderLight }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function IdeatePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Step 1
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  // Step 2
  const [selectedIcp, setSelectedIcp] = useState<string | null>(null);
  const [selectedSeniority, setSelectedSeniority] = useState<string | null>(null);

  // Step 3
  const [selectedHook, setSelectedHook] = useState<string | null>(null);
  const [hookContext, setHookContext] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  // Step 4
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Transition
  const [visible, setVisible] = useState(true);

  // Fetch events when hook = "event"
  useEffect(() => {
    if (selectedHook === "event" && events.length === 0) {
      setEventsLoading(true);
      fetch("/api/events?upcoming=true")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setEvents(data);
        })
        .catch(() => {})
        .finally(() => setEventsLoading(false));
    }
  }, [selectedHook, events.length]);

  const animateStep = useCallback((next: number) => {
    setVisible(false);
    setTimeout(() => {
      setStep(next);
      setVisible(true);
    }, 200);
  }, []);

  const canNext = () => {
    if (step === 1) return !!selectedGoal;
    if (step === 2) return !!selectedIcp && !!selectedSeniority;
    if (step === 3) {
      if (!selectedHook) return false;
      const hookOpt = HOOK_OPTIONS.find((h) => h.id === selectedHook);
      if (hookOpt?.inputType === "events") return !!selectedEvent;
      if (hookOpt?.inputType === "none") return true;
      return hookContext.trim().length > 0;
    }
    return false;
  };

  const handleNext = () => {
    if (step < 4) {
      animateStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      animateStep(step - 1);
    }
  };

  // Generate campaigns
  const generate = useCallback(async () => {
    setGenerating(true);
    setError(null);
    setCampaigns([]);

    const goalObj = GOALS.find((g) => g.id === selectedGoal);
    const hookObj = HOOK_OPTIONS.find((h) => h.id === selectedHook);

    try {
      const res = await fetch("/api/ideate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: goalObj?.label || selectedGoal,
          icp: selectedIcp,
          seniority: selectedSeniority,
          hook_type: hookObj?.label || selectedHook,
          hook_context:
            selectedHook === "event"
              ? selectedEvent?.description || selectedEvent?.name || ""
              : hookContext,
          event_name: selectedEvent?.name || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Generation failed (${res.status})`);
      }

      const data = await res.json();
      setCampaigns(data.campaigns || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  }, [selectedGoal, selectedIcp, selectedSeniority, selectedHook, hookContext, selectedEvent]);

  // Auto-generate when entering step 4
  useEffect(() => {
    if (step === 4 && campaigns.length === 0 && !generating) {
      generate();
    }
  }, [step, campaigns.length, generating, generate]);

  const handleCreateCampaign = (campaign: Campaign) => {
    const pillar = PILLAR_MAP[campaign.pillar];
    const prefill = {
      campaign_name: campaign.name,
      key_message: campaign.key_message,
      pillar: campaign.pillar,
      icp: selectedIcp === "both" ? "tech" : selectedIcp,
      seniority: selectedSeniority === "both" ? "manager" : selectedSeniority,
      platforms: campaign.platforms,
      context: `Hook: ${campaign.hook}\n\nSample headline: ${campaign.sample_headline}\n\nTiming: ${campaign.timing}`,
      pillar_label: pillar?.label,
    };
    sessionStorage.setItem("eventPrefill", JSON.stringify(prefill));
    router.push("/brief");
  };

  /* ---------------------------------------------------------------- */
  /*  Render helpers                                                   */
  /* ---------------------------------------------------------------- */

  const renderStep1 = () => (
    <div>
      <h2 className="text-[22px] font-bold text-[#1f2128] mb-1">What's the objective?</h2>
      <p className="text-[14px] text-[#545b6d] mb-6">Pick the primary goal for this campaign.</p>
      <div className="grid grid-cols-2 gap-3">
        {GOALS.map((g) => {
          const Icon = g.icon;
          const active = selectedGoal === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setSelectedGoal(g.id)}
              className="flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-150 cursor-pointer bg-white hover:shadow-md"
              style={{
                borderColor: active ? DS.primary : DS.borderLight,
                background: active ? DS.primaryLighter : "#fff",
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: active ? DS.primary : DS.primaryLighter,
                  color: active ? "#fff" : DS.primary,
                }}
              >
                <Icon size={20} />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-[#1f2128]">{g.label}</div>
                <div className="text-[12px] text-[#545b6d] mt-0.5">{g.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <h2 className="text-[22px] font-bold text-[#1f2128] mb-1">Who are we talking to?</h2>
      <p className="text-[14px] text-[#545b6d] mb-6">Select the target audience for this campaign.</p>

      <div className="mb-6">
        <label className="text-[13px] font-semibold text-[#1f2128] mb-3 block">Industry</label>
        <div className="grid grid-cols-3 gap-3">
          {([
            { id: "tech", label: "Tech & Business Services", desc: "500-5K employees" },
            { id: "manufacturing", label: "Manufacturing", desc: "2K-10K employees" },
            { id: "both", label: "Both", desc: "All industries" },
          ] as const).map((opt) => {
            const active = selectedIcp === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedIcp(opt.id)}
                className="p-4 rounded-xl border-2 text-left transition-all duration-150 cursor-pointer bg-white hover:shadow-md"
                style={{
                  borderColor: active ? DS.primary : DS.borderLight,
                  background: active ? DS.primaryLighter : "#fff",
                }}
              >
                <div className="text-[14px] font-semibold text-[#1f2128]">{opt.label}</div>
                <div className="text-[12px] text-[#545b6d] mt-0.5">{opt.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-[13px] font-semibold text-[#1f2128] mb-3 block">Seniority</label>
        <div className="grid grid-cols-3 gap-3">
          {([
            { id: "manager", label: "Manager / Director", desc: "Visibility & efficiency" },
            { id: "executive", label: "VP / CFO", desc: "Cash flow & scalability" },
            { id: "both", label: "Both", desc: "All levels" },
          ] as const).map((opt) => {
            const active = selectedSeniority === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedSeniority(opt.id)}
                className="p-4 rounded-xl border-2 text-left transition-all duration-150 cursor-pointer bg-white hover:shadow-md"
                style={{
                  borderColor: active ? DS.primary : DS.borderLight,
                  background: active ? DS.primaryLighter : "#fff",
                }}
              >
                <div className="text-[14px] font-semibold text-[#1f2128]">{opt.label}</div>
                <div className="text-[12px] text-[#545b6d] mt-0.5">{opt.desc}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div>
      <h2 className="text-[22px] font-bold text-[#1f2128] mb-1">What's the content angle?</h2>
      <p className="text-[14px] text-[#545b6d] mb-6">Choose a hook to ground the campaign ideas.</p>

      <div className="flex flex-col gap-3">
        {HOOK_OPTIONS.map((hook) => {
          const active = selectedHook === hook.id;
          return (
            <div key={hook.id}>
              <button
                onClick={() => {
                  setSelectedHook(hook.id);
                  setHookContext("");
                  setSelectedEvent(null);
                }}
                className="w-full p-4 rounded-xl border-2 text-left transition-all duration-150 cursor-pointer bg-white hover:shadow-md"
                style={{
                  borderColor: active ? DS.primary : DS.borderLight,
                  background: active ? DS.primaryLighter : "#fff",
                }}
              >
                <div className="text-[14px] font-semibold text-[#1f2128]">{hook.label}</div>
              </button>

              {/* Expanded input */}
              {active && hook.inputType === "events" && (
                <div className="mt-2 ml-4 p-3 rounded-lg bg-white border border-[#e6e7eb]">
                  {eventsLoading ? (
                    <div className="flex items-center gap-2 text-[13px] text-[#545b6d]">
                      <Loader2 size={14} className="animate-spin" /> Loading events...
                    </div>
                  ) : events.length === 0 ? (
                    <p className="text-[13px] text-[#545b6d]">No upcoming events found.</p>
                  ) : (
                    <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto">
                      {events.map((ev) => (
                        <button
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          className="flex items-center gap-3 p-2.5 rounded-lg border text-left transition-all cursor-pointer bg-white hover:bg-[#fafafa]"
                          style={{
                            borderColor: selectedEvent?.id === ev.id ? DS.primary : DS.borderLight,
                            background: selectedEvent?.id === ev.id ? DS.primaryLighter : "#fff",
                          }}
                        >
                          <CalendarIcon size={14} className="text-[#545b6d] shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-[13px] font-medium text-[#1f2128] truncate">{ev.name}</div>
                            <div className="text-[11px] text-[#545b6d]">{ev.date} &middot; {ev.category}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {active && hook.inputType === "text" && (
                <div className="mt-2 ml-4">
                  <input
                    type="text"
                    value={hookContext}
                    onChange={(e) => setHookContext(e.target.value)}
                    placeholder={hook.placeholder}
                    className="w-full px-3 py-2.5 rounded-lg border border-[#c4c9d4] text-[13px] text-[#1f2128] outline-none focus:border-[#7B59FF] focus:ring-2 focus:ring-[#7B59FF]/10 transition-all"
                  />
                </div>
              )}

              {active && hook.inputType === "textarea" && (
                <div className="mt-2 ml-4">
                  <textarea
                    value={hookContext}
                    onChange={(e) => setHookContext(e.target.value)}
                    placeholder={hook.placeholder}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-lg border border-[#c4c9d4] text-[13px] text-[#1f2128] outline-none focus:border-[#7B59FF] focus:ring-2 focus:ring-[#7B59FF]/10 transition-all resize-none"
                  />
                </div>
              )}

              {active && hook.inputType === "date" && (
                <div className="mt-2 ml-4">
                  <input
                    type="date"
                    value={hookContext}
                    onChange={(e) => setHookContext(e.target.value)}
                    className="px-3 py-2.5 rounded-lg border border-[#c4c9d4] text-[13px] text-[#1f2128] outline-none focus:border-[#7B59FF] focus:ring-2 focus:ring-[#7B59FF]/10 transition-all"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div>
      <h2 className="text-[22px] font-bold text-[#1f2128] mb-1">Your campaign concepts</h2>
      <p className="text-[14px] text-[#545b6d] mb-6">
        {generating
          ? "Brainstorming campaigns..."
          : `${campaigns.length} ideas generated. Pick one to create a full brief.`}
      </p>

      {generating && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="relative">
            <Sparkles size={40} className="text-[#7B59FF] animate-pulse" />
            <Sparkles
              size={20}
              className="text-[#beadff] absolute -top-2 -right-3 animate-bounce"
              style={{ animationDelay: "0.3s" }}
            />
            <Sparkles
              size={16}
              className="text-[#EFEBFF] absolute -bottom-1 -left-3 animate-bounce"
              style={{ animationDelay: "0.6s" }}
            />
          </div>
          <p className="text-[15px] font-medium text-[#545b6d]">Brainstorming campaigns...</p>
          <div className="w-48 h-1.5 bg-[#EFEBFF] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#7B59FF] rounded-full animate-pulse"
              style={{ width: "60%", animation: "loading 2s ease-in-out infinite" }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-[#FFEBEE] text-[#DF1C41] text-[13px] mb-4">
          {error}
        </div>
      )}

      {!generating && campaigns.length > 0 && (
        <div className="flex flex-col gap-4">
          {campaigns.map((c, i) => {
            const pillar = PILLAR_MAP[c.pillar];
            return (
              <div
                key={i}
                className="p-5 rounded-xl border border-[#e6e7eb] bg-white hover:shadow-md transition-all"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-[17px] font-bold text-[#1f2128]">{c.name}</h3>
                  {pillar && (
                    <span
                      className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                      style={{ background: pillar.color + "18", color: pillar.color }}
                    >
                      {pillar.label}
                    </span>
                  )}
                </div>

                <p className="text-[14px] text-[#1f2128] mb-3 leading-relaxed">{c.key_message}</p>

                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1.5">
                    {c.platforms.map((p) => {
                      const Icon = PLATFORM_ICONS[p];
                      return Icon ? (
                        <span
                          key={p}
                          className="w-7 h-7 rounded-md flex items-center justify-center"
                          style={{ background: DS.primaryLighter, color: DS.primary }}
                          title={p}
                        >
                          <Icon size={14} />
                        </span>
                      ) : null;
                    })}
                  </div>
                  <span className="text-[12px] text-[#545b6d]">{c.timing}</span>
                </div>

                <p className="text-[12px] text-[#71757e] italic mb-4">
                  &ldquo;{c.sample_headline}&rdquo;
                </p>

                <button
                  onClick={() => handleCreateCampaign(c)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold text-white border-0 cursor-pointer transition-all hover:opacity-90"
                  style={{ background: DS.primary }}
                >
                  Create This Campaign <ArrowRight size={14} />
                </button>
              </div>
            );
          })}

          <button
            onClick={() => {
              setCampaigns([]);
              generate();
            }}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed text-[14px] font-medium cursor-pointer transition-all bg-white hover:bg-[#fafafa]"
            style={{ borderColor: DS.border, color: DS.muted }}
          >
            <RefreshCw size={16} /> Regenerate Ideas
          </button>
        </div>
      )}
    </div>
  );

  /* ---------------------------------------------------------------- */
  /*  Layout                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* Header */}
      <header className="bg-white border-b border-[#e6e7eb] px-6 h-16 flex items-center sticky top-0 z-40">
        <nav className="flex items-center gap-1.5 text-[13px]">
          <Link href="/" className="text-[#545b6d] hover:text-[#1f2128] no-underline transition-colors">
            Dashboard
          </Link>
          <ChevronRight size={12} className="text-[#a1a5ae]" />
          <span className="text-[#1f2128] font-medium">Campaign Ideation</span>
        </nav>
      </header>

      {/* Main */}
      <main className="max-w-[800px] mx-auto px-6 py-10">
        <div className="mb-2">
          <h1 className="text-[28px] font-bold text-[#1f2128] mb-1">Campaign Ideation Wizard</h1>
          <p className="text-[14px] text-[#545b6d]">
            Let AI brainstorm creative campaign concepts tailored to your goals.
          </p>
        </div>

        <StepIndicator current={step} total={4} />

        {/* Step content */}
        <div
          className="transition-all duration-200"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(8px)",
          }}
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        {/* Navigation buttons */}
        {step < 4 && (
          <div className="flex items-center justify-between mt-10">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-medium border border-[#e6e7eb] bg-white cursor-pointer transition-all hover:bg-[#fafafa] disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ color: DS.muted }}
            >
              <ChevronLeft size={14} /> Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canNext()}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white border-0 cursor-pointer transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: DS.primary }}
            >
              {step === 3 ? "Generate Ideas" : "Next"} <ChevronRight size={14} />
            </button>
          </div>
        )}

        {step === 4 && !generating && campaigns.length > 0 && (
          <div className="mt-8">
            <button
              onClick={() => animateStep(1)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[13px] font-medium border border-[#e6e7eb] bg-white cursor-pointer transition-all hover:bg-[#fafafa]"
              style={{ color: DS.muted }}
            >
              <ChevronLeft size={14} /> Start Over
            </button>
          </div>
        )}
      </main>

      {/* CSS for loading animation */}
      <style jsx>{`
        @keyframes loading {
          0% { width: 20%; margin-left: 0; }
          50% { width: 60%; margin-left: 20%; }
          100% { width: 20%; margin-left: 80%; }
        }
      `}</style>
    </div>
  );
}
