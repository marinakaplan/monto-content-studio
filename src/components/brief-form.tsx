"use client";

import { useState, useEffect, type ReactNode } from "react";
import { Star, X, Sparkles, Loader2, PenTool, Type, PanelRightClose, PanelRightOpen, ImagePlus } from "lucide-react";
import { Btn } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { ICPS, SENIORITY, PILLARS, PLATFORMS, DS } from "@/lib/constants";

export type BriefFormData = {
  campaign: string;
  message: string;
  pillar: string;
  platforms: string[];
  deadline: string;
  context: string;
  icp: string;
  seniority: string;
  briefType: "ai" | "manual";
  designerInstructions: string;
  overlayTitle: string;
  eventId: string;
  styleRefs: string[];
};

export type BriefPrefill = {
  campaign?: string;
  message?: string;
  context?: string;
  pillar?: string;
  deadline?: string;
  eventId?: string;
};

type BriefFormProps = {
  onSubmit: (data: BriefFormData) => void;
  sidebarExtras?: ReactNode;
  initialContext?: string;
  prefill?: BriefPrefill | null;
};

function ContextRow({ label, value }: { label: string; value: string | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between py-1">
      <span className="text-[12px] text-[#a1a5ae] shrink-0">{label}</span>
      <span className="text-[13px] text-[#1f2128] font-medium text-right ml-3 truncate">{value}</span>
    </div>
  );
}

export function BriefForm({ onSubmit, sidebarExtras, initialContext, prefill }: BriefFormProps) {
  const [b, setB] = useState<BriefFormData>({
    campaign: "",
    message: "",
    pillar: "",
    platforms: ["linkedin"],
    deadline: "",
    context: "",
    icp: "tech",
    seniority: "manager",
    briefType: "ai",
    designerInstructions: "",
    overlayTitle: "",
    eventId: "",
    styleRefs: [],
  });

  // Track which fields were auto-filled from an event
  const [prefillSource, setPrefillSource] = useState<string | null>(null);
  const [prefilledFields, setPrefilledFields] = useState<Set<string>>(new Set());

  // AI generation state
  const [generating, setGenerating] = useState<"campaign" | "message" | "overlayTitle" | null>(null);
  const [magicError, setMagicError] = useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isManual = b.briefType === "manual";

  async function handleAiGenerate(field: "campaign" | "message" | "overlayTitle") {
    setGenerating(field);
    setMagicError(null);
    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field,
          context: {
            icp: b.icp,
            seniority: b.seniority,
            pillar: b.pillar,
            context: b.context,
            campaign: b.campaign,
            message: b.message,
          },
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setMagicError(errData.error || "Generation failed");
        return;
      }
      const data = await res.json();
      if (data.value) {
        const key = field === "campaign" ? "campaign" : field === "overlayTitle" ? "overlayTitle" : "message";
        setB((prev) => ({ ...prev, [key]: data.value }));
      }
    } catch (err) {
      console.error("AI suggest failed:", err);
      setMagicError("Network error — try again");
    } finally {
      setGenerating(null);
    }
  }

  // Legacy: simple context string
  useEffect(() => {
    if (initialContext && !prefill) {
      setB((p) => ({ ...p, context: initialContext }));
    }
  }, [initialContext, prefill]);

  // Structured prefill from event selection
  useEffect(() => {
    if (prefill) {
      const filled = new Set<string>();
      setB((p) => {
        const next = { ...p };
        if (prefill.campaign) { next.campaign = prefill.campaign; filled.add("campaign"); }
        if (prefill.message) { next.message = prefill.message; filled.add("message"); }
        if (prefill.context) { next.context = prefill.context; filled.add("context"); }
        if (prefill.pillar) { next.pillar = prefill.pillar; filled.add("pillar"); }
        if (prefill.deadline) { next.deadline = prefill.deadline; filled.add("deadline"); }
        if (prefill.eventId) { next.eventId = prefill.eventId; }
        return next;
      });
      setPrefilledFields(filled);
      // Extract event name from campaign (strip " Campaign" suffix)
      const eventName = prefill.campaign?.replace(/ Campaign$/, "") || "event";
      setPrefillSource(eventName);
    }
  }, [prefill]);

  const u = (k: keyof BriefFormData, v: string | string[]) =>
    setB((p) => ({ ...p, [k]: v }));

  const togglePlatform = (id: string) =>
    setB((p) => ({
      ...p,
      platforms: p.platforms.includes(id)
        ? p.platforms.filter((x) => x !== id)
        : [...p.platforms, id],
    }));

  const ok = isManual
    ? b.campaign && b.designerInstructions && b.platforms.length > 0
    : b.campaign && b.message && b.platforms.length > 0;

  return (
    <div className={`grid gap-10 items-start transition-all duration-300 ${sidebarOpen ? "grid-cols-[1fr_520px]" : "grid-cols-[1fr_0px]"}`}>
      {/* LEFT: Form */}
      <div>
        <div className="mb-10 flex items-start justify-between">
          <div>
            <h2 className="text-[28px] font-bold text-[#1f2128] tracking-[-0.02em] m-0">Campaign Brief</h2>
            <p className="text-[15px] text-[#71757e] mt-2 leading-relaxed">
            {isManual
              ? "Create a designer brief with specific instructions for your creative team."
              : "Set audience, message, and content direction. Review generated assets in the next step."
            }
          </p>
          </div>
          <button
            onClick={() => setSidebarOpen((p) => !p)}
            className="mt-1.5 w-8 h-8 rounded-lg hover:bg-[#f0f1f3] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            {sidebarOpen ? <PanelRightClose size={16} color="#71757e" /> : <PanelRightOpen size={16} color="#71757e" />}
          </button>
        </div>

        {/* Brief Type Tabs */}
        <div className="mb-8 border-b border-[#e6e7eb]">
          <div className="flex gap-0">
            <button
              onClick={() => u("briefType", "ai")}
              className={`relative pb-2.5 px-4 text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                !isManual
                  ? "text-[#1f2128]"
                  : "text-[#a1a5ae] hover:text-[#71757e]"
              }`}
            >
              AI Generated
              {!isManual && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#7B59FF] rounded-full" />
              )}
            </button>
            <button
              onClick={() => u("briefType", "manual")}
              className={`relative pb-2.5 px-4 text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                isManual
                  ? "text-[#1f2128]"
                  : "text-[#a1a5ae] hover:text-[#71757e]"
              }`}
            >
              Designer Brief
              {isManual && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#7B59FF] rounded-full" />
              )}
            </button>
          </div>
        </div>

        {/* Magic error toast */}
        {magicError && (
          <div className="mb-6 bg-[#FFEBEE] rounded-xl px-4 py-3 flex items-center justify-between shadow-[inset_0_0_0_1px_rgba(223,28,65,0.15)]">
            <span className="text-sm text-[#DF1C41]">{magicError}</span>
            <button onClick={() => setMagicError(null)} className="text-[#DF1C41]/50 hover:text-[#DF1C41] cursor-pointer transition-colors">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Prefill banner — shown when event data populates the form */}
        {prefillSource && (
          <div className="mb-8 bg-[#FDFCFF] rounded-xl px-4 py-3.5 flex items-center justify-between shadow-[inset_0_0_0_1px_rgba(123,89,255,0.15),0_1px_3px_rgba(123,89,255,0.06)]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#EFEBFF] flex items-center justify-center">
                <Sparkles size={14} color={DS.primary} />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#1f2128]">
                  Pre-filled from: {prefillSource}
                </div>
                <div className="text-[12px] text-[#71757e]">
                  {prefilledFields.size} fields auto-filled. Review and edit before creating assets.
                </div>
              </div>
            </div>
            <button
              onClick={() => { setPrefillSource(null); setPrefilledFields(new Set()); }}
              className="w-6 h-6 rounded-lg hover:bg-[#EFEBFF] flex items-center justify-center cursor-pointer transition-colors"
            >
              <X size={14} color={DS.primary} />
            </button>
          </div>
        )}

        {/* Campaign Name */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-[13px] font-semibold tracking-[-0.01em] text-[#1f2128]">Campaign Name</label>
            {!isManual && (
              <button
                onClick={() => handleAiGenerate("campaign")}
                disabled={generating === "campaign"}
                className="flex items-center gap-1.5 text-[12px] font-semibold bg-[#EFEBFF] text-[#7B59FF] hover:bg-[#e2daff] hover:shadow-[0_2px_6px_rgba(123,89,255,0.15)] px-2.5 py-1.5 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {generating === "campaign" ? (
                  <><Loader2 size={12} className="animate-spin" /> Writing...</>
                ) : (
                  <><Sparkles size={12} /> Magic</>
                )}
              </button>
            )}
          </div>
          <input
            value={b.campaign}
            onChange={(e) => { u("campaign", e.target.value); setPrefilledFields((p) => { const n = new Set(p); n.delete("campaign"); return n; }); }}
            placeholder={isManual ? "e.g., Instagram Stories — Portal Chaos" : "e.g., Q1 Portal Automation Push"}
            className={`w-full h-11 px-3.5 rounded-lg text-sm text-[#1f2128] bg-white outline-none transition-all duration-200 placeholder:text-[#a1a5ae] ${
              prefilledFields.has("campaign")
                ? "shadow-[inset_0_0_0_1.5px_#7B59FF] bg-[#FDFCFF]"
                : "shadow-[inset_0_0_0_1px_#e6e7eb] focus:shadow-[inset_0_0_0_1.5px_#7B59FF,0_0_0_3px_rgba(123,89,255,0.12)]"
            }`}
          />
        </div>

        {/* ICP */}
        <div className="mb-8">
          <label className="block text-[13px] font-semibold tracking-[-0.01em] text-[#1f2128] mb-3">Target ICP</label>
          <div className="grid grid-cols-2 gap-3">
            {ICPS.map((ic) => {
              const Icon = ic.icon;
              const sel = b.icp === ic.id;
              return (
                <Card key={ic.id} selected={sel} onClick={() => u("icp", ic.id)} className="p-5">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200"
                      style={{ background: sel ? `${ic.color}12` : "#f0f1f3" }}
                    >
                      <Icon size={15} color={sel ? ic.color : DS.mutedFg} />
                    </div>
                    <span
                      className="text-sm font-semibold transition-colors duration-200"
                      style={{ color: sel ? ic.color : DS.fg }}
                    >
                      {ic.label}
                    </span>
                  </div>
                  <div className="text-[13px] text-[#71757e] mb-0.5">{ic.size} employees</div>
                  <div
                    className="text-[13px] font-medium leading-snug transition-colors duration-200"
                    style={{ color: sel ? ic.color : DS.muted }}
                  >
                    {ic.painPoint}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Seniority */}
        <div className="mb-8">
          <label className="block text-[13px] font-semibold tracking-[-0.01em] text-[#1f2128] mb-3">Seniority Level</label>
          <div className="grid grid-cols-2 gap-3">
            {SENIORITY.map((s) => {
              const Icon = s.icon;
              const sel = b.seniority === s.id;
              return (
                <Card key={s.id} selected={sel} onClick={() => u("seniority", s.id)} className="p-5">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-200"
                      style={{ background: sel ? DS.primaryLighter : "#f0f1f3" }}
                    >
                      <Icon size={15} color={sel ? DS.primary : DS.mutedFg} />
                    </div>
                    <span
                      className="text-sm font-semibold transition-colors duration-200"
                      style={{ color: sel ? DS.primary : DS.fg }}
                    >
                      {s.label}
                    </span>
                  </div>
                  <div className="text-[13px] text-[#71757e]">{s.titles}</div>
                  <div
                    className="text-[13px] font-medium mt-0.5 leading-snug transition-colors duration-200"
                    style={{ color: sel ? DS.primary : DS.muted }}
                  >
                    {s.focus}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Key Message — always shown but optional for manual */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-[13px] font-semibold tracking-[-0.01em] text-[#1f2128]">
              Key Message {isManual && <span className="text-[#a1a5ae] font-normal">(optional)</span>}
            </label>
            {!isManual && (
              <button
                onClick={() => handleAiGenerate("message")}
                disabled={generating === "message"}
                className="flex items-center gap-1.5 text-[12px] font-semibold bg-[#EFEBFF] text-[#7B59FF] hover:bg-[#e2daff] hover:shadow-[0_2px_6px_rgba(123,89,255,0.15)] px-2.5 py-1.5 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {generating === "message" ? (
                  <><Loader2 size={12} className="animate-spin" /> Writing...</>
                ) : (
                  <><Sparkles size={12} /> Magic</>
                )}
              </button>
            )}
          </div>
          <textarea
            value={b.message}
            onChange={(e) => { u("message", e.target.value); setPrefilledFields((p) => { const n = new Set(p); n.delete("message"); return n; }); }}
            placeholder={isManual ? "High-level message direction (optional)" : "What's the core message for this campaign?"}
            rows={3}
            className={`w-full px-3.5 py-3 rounded-lg text-sm text-[#1f2128] bg-white outline-none resize-y transition-all duration-200 placeholder:text-[#a1a5ae] ${
              prefilledFields.has("message")
                ? "shadow-[inset_0_0_0_1.5px_#7B59FF] bg-[#FDFCFF]"
                : "shadow-[inset_0_0_0_1px_#e6e7eb] focus:shadow-[inset_0_0_0_1.5px_#7B59FF,0_0_0_3px_rgba(123,89,255,0.12)]"
            }`}
          />
        </div>

        {/* Designer Instructions — only for manual mode */}
        {isManual && (
          <div className="mb-8">
            <label className="block text-[13px] font-semibold tracking-[-0.01em] text-[#1f2128] mb-1.5">Designer Instructions</label>
            <div className="text-[13px] text-[#71757e] mb-2.5">
              What needs to be done? Be as specific as possible.
            </div>
            <textarea
              value={b.designerInstructions}
              onChange={(e) => u("designerInstructions", e.target.value)}
              placeholder="e.g., Resize the LinkedIn banner for Instagram stories, add the event logo in the bottom-right corner, update the headline to match the new copy..."
              rows={5}
              className="w-full px-3.5 py-3 rounded-lg text-sm text-[#1f2128] bg-white outline-none resize-y transition-all duration-200 placeholder:text-[#a1a5ae] shadow-[inset_0_0_0_1px_#e6e7eb] focus:shadow-[inset_0_0_0_1.5px_#7B59FF,0_0_0_3px_rgba(123,89,255,0.12)]"
            />
          </div>
        )}

        {/* Overlay Title — shown in both modes */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <Type size={14} className="text-[#71757e]" />
              <label className="block text-[13px] font-semibold tracking-[-0.01em] text-[#1f2128]">
                Title on Post <span className="text-[#a1a5ae] font-normal">(optional)</span>
              </label>
            </div>
            {!isManual && (
              <button
                onClick={() => handleAiGenerate("overlayTitle")}
                disabled={generating === "overlayTitle"}
                className="flex items-center gap-1.5 text-[12px] font-semibold bg-[#EFEBFF] text-[#7B59FF] hover:bg-[#e2daff] hover:shadow-[0_2px_6px_rgba(123,89,255,0.15)] px-2.5 py-1.5 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {generating === "overlayTitle" ? (
                  <><Loader2 size={12} className="animate-spin" /> Writing...</>
                ) : (
                  <><Sparkles size={12} /> Magic</>
                )}
              </button>
            )}
          </div>
          <div className="text-[13px] text-[#71757e] mb-2.5">
            Text that appears on the image itself as an overlay
          </div>
          <input
            value={b.overlayTitle}
            onChange={(e) => u("overlayTitle", e.target.value)}
            placeholder="e.g., The Hidden Costs of Portal Chaos"
            className="w-full h-11 px-3.5 rounded-lg text-sm text-[#1f2128] bg-white outline-none transition-all duration-200 placeholder:text-[#a1a5ae] shadow-[inset_0_0_0_1px_#e6e7eb] focus:shadow-[inset_0_0_0_1.5px_#7B59FF,0_0_0_3px_rgba(123,89,255,0.12)]"
          />
        </div>

        {/* Pillars — only for AI mode */}
        {!isManual && (
          <div className="mb-8">
            <label className="block text-[13px] font-semibold tracking-[-0.01em] text-[#1f2128] mb-1.5">Content Pillar</label>
            <div className="text-[13px] text-[#71757e] mb-3">
              Leave empty to create one variant per pillar (5 assets)
            </div>
            <div className="grid grid-cols-5 gap-3">
              {PILLARS.map((p) => {
                const Icon = p.icon;
                const sel = b.pillar === p.id;
                return (
                  <Card
                    key={p.id}
                    selected={sel}
                    onClick={() => u("pillar", sel ? "" : p.id)}
                    className="py-3.5 px-2.5 text-center"
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1.5 transition-colors duration-200"
                      style={{ background: sel ? `${p.color}12` : "#f0f1f3" }}
                    >
                      <Icon size={13} color={sel ? p.color : DS.mutedFg} />
                    </div>
                    <div
                      className="text-[13px] font-medium leading-tight transition-colors duration-200"
                      style={{ color: sel ? p.color : DS.fg }}
                    >
                      {p.label}
                    </div>
                    <div className="text-[11px] text-[#71757e] mt-0.5 leading-snug">{p.desc}</div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Style References — AI mode only */}
        {!isManual && (
          <div className="mb-8">
            <label className="block text-[13px] font-semibold tracking-[-0.01em] text-[#1f2128] mb-1.5">
              Style Reference <span className="text-[#a1a5ae] font-normal">(optional)</span>
            </label>
            <div className="text-[13px] text-[#71757e] mb-3">
              Upload up to 3 photos — LinkedIn posts, visuals, or mood references. Nano Banana Pro will match the style.
            </div>
            <div className="flex gap-3 flex-wrap">
              {b.styleRefs.map((ref, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#edeef1] group">
                  <img src={ref} alt={`Ref ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => setB((p) => ({ ...p, styleRefs: p.styleRefs.filter((_, j) => j !== i) }))}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <X size={10} color="white" />
                  </button>
                </div>
              ))}
              {b.styleRefs.length < 3 && (
                <label className="w-20 h-20 rounded-lg border border-dashed border-[#c4c9d4] hover:border-[#7B59FF] hover:bg-[#FDFCFF] flex flex-col items-center justify-center cursor-pointer transition-colors">
                  <ImagePlus size={16} className="text-[#a1a5ae] mb-1" />
                  <span className="text-[10px] text-[#a1a5ae]">Add</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file || file.size > 2 * 1024 * 1024) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === "string") {
                          setB((p) => ({ ...p, styleRefs: [...p.styleRefs, reader.result as string] }));
                        }
                      };
                      reader.readAsDataURL(file);
                      e.target.value = "";
                    }}
                  />
                </label>
              )}
            </div>
          </div>
        )}

        {/* Platforms */}
        <div className="mb-8">
          <label className="block text-[13px] font-semibold tracking-[-0.01em] text-[#1f2128] mb-3">Platforms</label>
          <div className="flex gap-2.5 flex-wrap">
            {PLATFORMS.map((p) => {
              const Icon = p.icon;
              const sel = b.platforms.includes(p.id);
              return (
                <Btn
                  key={p.id}
                  variant={sel ? "secondary" : "tertiary"}
                  size="small"
                  onClick={() => togglePlatform(p.id)}
                  className={sel ? "!bg-[#EFEBFF] !shadow-[inset_0_0_0_1.5px_#7B59FF]" : ""}
                >
                  <Icon size={13} /> {p.label}
                </Btn>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <Input
            label="Deadline"
            type="date"
            value={b.deadline}
            onChange={(e) => { u("deadline", e.target.value); setPrefilledFields((p) => { const n = new Set(p); n.delete("deadline"); return n; }); }}
            className={prefilledFields.has("deadline") ? "!shadow-[inset_0_0_0_1.5px_#7B59FF] !bg-[#FDFCFF]" : ""}
          />
          <Textarea
            label="Context (optional)"
            value={b.context}
            onChange={(e) => { u("context", e.target.value); setPrefilledFields((p) => { const n = new Set(p); n.delete("context"); return n; }); }}
            placeholder="Data points, event tie-ins..."
            rows={1}
            className={prefilledFields.has("context") ? "!shadow-[inset_0_0_0_1.5px_#7B59FF] !bg-[#FDFCFF]" : ""}
          />
        </div>

        <Btn
          variant="primary"
          size="large"
          disabled={!ok}
          onClick={() => ok && onSubmit(b)}
          className="w-full mt-4"
        >
          {isManual ? (
            <><PenTool size={15} /> Create Designer Brief</>
          ) : (
            <><Star size={15} /> Create Assets</>
          )}
        </Btn>
      </div>

      {/* RIGHT: Brief Summary Panel */}
      <div className={`sticky top-20 transition-all duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0 overflow-hidden pointer-events-none"}`}>
        <div className="bg-white rounded-xl border border-[#edeef1] overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#EFEBFF] flex items-center justify-center">
              {isManual ? <PenTool size={13} color={DS.primary} /> : <Star size={13} color={DS.primary} />}
            </div>
            <span className="text-[14px] font-bold text-[#1f2128]">Brief Summary</span>
          </div>

          {/* Content */}
          <div className="px-5 pb-5">
            {/* Audience cluster */}
            <div className="bg-[#f8f9fb] rounded-lg p-3.5 mb-3">
              <div className="text-[11px] font-semibold text-[#a1a5ae] uppercase tracking-wider mb-2">Audience</div>
              <ContextRow label="ICP" value={ICPS.find((i) => i.id === b.icp)?.label} />
              <ContextRow label="Seniority" value={SENIORITY.find((s) => s.id === b.seniority)?.label} />
              <ContextRow label="Pain point" value={ICPS.find((i) => i.id === b.icp)?.painPoint} />
            </div>

            {/* Strategy cluster */}
            <div className="bg-[#f8f9fb] rounded-lg p-3.5 mb-3">
              <div className="text-[11px] font-semibold text-[#a1a5ae] uppercase tracking-wider mb-2">Strategy</div>
              <ContextRow label="Type" value={isManual ? "Designer Brief" : "AI Generated"} />
              <ContextRow label="Messaging" value={SENIORITY.find((s) => s.id === b.seniority)?.focus} />
              {!isManual && (
                <ContextRow
                  label="Pillar"
                  value={
                    b.pillar
                      ? PILLARS.find((p) => p.id === b.pillar)?.label
                      : "All 5 (one per pillar)"
                  }
                />
              )}
            </div>

            {/* Voice — condensed */}
            <div className="text-[12px] text-[#a1a5ae] leading-relaxed mb-3 px-1">
              Professional tone, active voice, short sentences
            </div>

            {/* Dynamic fields */}
            {(b.campaign || b.overlayTitle || b.deadline) && (
              <div className="border-t border-[#edeef1] pt-3 mt-1">
                {b.campaign && <ContextRow label="Campaign" value={b.campaign} />}
                {b.overlayTitle && <ContextRow label="Overlay" value={b.overlayTitle} />}
                {b.deadline && (
                  <ContextRow label="Deadline" value={new Date(b.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} />
                )}
              </div>
            )}

            {isManual && b.designerInstructions && (
              <div className="border-t border-[#edeef1] pt-3 mt-1">
                <div className="text-[11px] font-semibold text-[#a1a5ae] uppercase tracking-wider mb-1.5">Instructions</div>
                <div className="text-[12px] text-[#1f2128] leading-relaxed line-clamp-4">
                  {b.designerInstructions}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar extras (events panel, etc.) */}
        {sidebarExtras}

        {/* Color Palette Reference */}
        <div className="bg-white rounded-xl border border-[#edeef1] mt-4 overflow-hidden">
          <div className="px-5 py-3.5 flex items-center gap-2">
            <span className="text-[13px] font-bold text-[#1f2128]">Brand Palette</span>
          </div>
          <div className="px-5 pb-4 flex gap-2.5 flex-wrap">
            {[
              { c: "#7B59FF", n: "Primary" },
              { c: "#6344E5", n: "Dark" },
              { c: "#EFEBFF", n: "Light" },
              { c: "#1f2128", n: "Black" },
              { c: "#FFD93D", n: "Yellow" },
              { c: "#1750FB", n: "Info" },
            ].map((s) => (
              <div key={s.c} className="text-center group">
                <div
                  className="w-9 h-9 rounded-lg transition-transform duration-200 group-hover:scale-105"
                  style={{ background: s.c }}
                />
                <div className="text-[11px] text-[#a1a5ae] mt-1">{s.n}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
