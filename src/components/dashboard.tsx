"use client";

import { useState, useEffect } from "react";
import { Plus, Layers, Clock, Loader2, CheckCircle, Sparkles, ArrowRight, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { Btn } from "./ui/button";
import { CampaignCard } from "./campaign-card";
import { DashboardEvents } from "./dashboard-events";
import { DS } from "@/lib/constants";
import type { Brief } from "@/lib/supabase";
import type { LucideIcon } from "lucide-react";

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

type BriefWithCount = Brief & { asset_count: number };

function StatsCard({ label, value, icon: Icon, color, bg }: {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bg: string;
}) {
  return (
    <div className="bg-white border border-[#e6e7eb] rounded-lg p-4 flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: bg }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <div className="text-2xl font-bold text-[#1f2128]">{value}</div>
        <div className="text-[13px] text-[#545b6d]">{label}</div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const router = useRouter();
  const [briefs, setBriefs] = useState<BriefWithCount[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    fetch("/api/briefs")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setBriefs(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? briefs : briefs.filter((b) => b.status === filter);
  const count = (s: string) =>
    s === "all" ? briefs.length : briefs.filter((b) => b.status === s).length;

  const filters = [
    { id: "all", label: "All" },
    { id: "draft", label: "Draft" },
    { id: "generating", label: "Generating" },
    { id: "review", label: "Review" },
    { id: "complete", label: "Complete" },
  ];

  function handleCardClick(brief: BriefWithCount) {
    if (brief.status === "review" || brief.status === "complete") {
      router.push(`/review/${brief.id}`);
    } else if (brief.status === "generating") {
      router.push(`/create/${brief.id}`);
    } else {
      router.push(`/create/${brief.id}`);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1f2128]">Campaigns</h1>
          <p className="text-sm text-[#545b6d] mt-1">
            Manage your marketing campaigns and review generated assets.
          </p>
        </div>
        <Btn variant="primary" onClick={() => router.push("/brief")}>
          <Plus size={15} /> New Campaign
        </Btn>
      </div>

      {/* Quick Stats */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatsCard
            label="Total Campaigns"
            value={briefs.length}
            icon={Layers}
            color={DS.fg}
            bg={DS.bg}
          />
          <StatsCard
            label="In Review"
            value={count("review")}
            icon={Clock}
            color={DS.warning}
            bg={DS.warningBg}
          />
          <StatsCard
            label="Generating"
            value={count("generating")}
            icon={Loader2}
            color={DS.processing}
            bg={DS.processingBg}
          />
          <StatsCard
            label="Completed"
            value={count("complete")}
            icon={CheckCircle}
            color={DS.success}
            bg={DS.successBg}
          />
        </div>
      )}

      {/* Tab bar */}
      <div className="border-b border-[#e6e7eb] mb-6">
        <div className="flex items-center">
          <nav className="flex items-center gap-1 -mb-px">
            {filters.map((fl) => {
              const c = count(fl.id);
              const sel = filter === fl.id;
              return (
                <button
                  key={fl.id}
                  onClick={() => setFilter(fl.id)}
                  className={`relative px-3 pb-3 pt-1 text-[13px] font-medium transition-colors cursor-pointer ${
                    sel
                      ? "text-[#7B59FF]"
                      : "text-[#545b6d] hover:text-[#1f2128]"
                  }`}
                >
                  {fl.label}
                  <span className={`ml-1 text-[12px] ${sel ? "text-[#7B59FF]" : "text-[#71757e]"}`}>
                    {c}
                  </span>
                  {sel && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#7B59FF] rounded-t-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Campaign grid */}
      {loading ? (
        <div className="text-center py-20 text-[#71757e]">Loading campaigns...</div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
          {filtered.map((b) => (
            <CampaignCard key={b.id} brief={b} onClick={() => handleCardClick(b)} />
          ))}
        </div>
      ) : briefs.length === 0 ? (
        /* Empty state */
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-[#EFEBFF] flex items-center justify-center mx-auto mb-4">
            <Sparkles size={24} color="#7B59FF" />
          </div>
          <h3 className="text-lg font-semibold text-[#1f2128] mb-2">Welcome to Content Studio</h3>
          <p className="text-sm text-[#545b6d] mb-6 max-w-sm mx-auto">
            Create your first campaign brief and let AI generate on-brand marketing content across all your channels.
          </p>
          <Btn variant="primary" onClick={() => router.push("/brief")}>
            <Plus size={15} /> Create First Campaign
          </Btn>
        </div>
      ) : (
        <div className="text-center py-16 text-[#71757e]">
          <Layers size={20} className="mx-auto mb-2 opacity-50" />
          No {filter} campaigns.
        </div>
      )}

      {/* AI Recommendations Section */}
      <div className="mt-10 pt-6 border-t border-[#e6e7eb]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap size={16} color={DS.primary} />
            <h2 className="text-[15px] font-semibold text-[#1f2128]">AI Campaign Ideas</h2>
          </div>
          <Btn
            variant="secondary"
            size="small"
            onClick={async () => {
              setLoadingRecs(true);
              try {
                const res = await fetch("/api/ai-recommendations", { method: "POST" });
                const data = await res.json();
                if (data.recommendations) setRecommendations(data.recommendations);
              } catch (err) {
                console.error(err);
              }
              setLoadingRecs(false);
            }}
            disabled={loadingRecs}
          >
            {loadingRecs ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
            {loadingRecs ? "Analyzing..." : "Get Suggestions"}
          </Btn>
        </div>

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommendations.map((rec, i) => {
              const urgencyColors: Record<string, { color: string; bg: string }> = {
                high: { color: DS.error, bg: DS.errorBg },
                medium: { color: DS.warning, bg: DS.warningBg },
                low: { color: DS.info, bg: DS.infoBg },
              };
              const uc = urgencyColors[rec.urgency] || urgencyColors.low;

              return (
                <div
                  key={i}
                  className="bg-white border border-[#e6e7eb] rounded-lg p-4 hover:border-[#c4c9d4] hover:shadow-sm transition-all cursor-pointer group"
                  onClick={() => {
                    const prefill = {
                      campaign: rec.campaign_name,
                      message: rec.key_message,
                      context: rec.rationale,
                      pillar: rec.pillar,
                      deadline: "",
                    };
                    sessionStorage.setItem("eventPrefill", JSON.stringify(prefill));
                    router.push("/brief");
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[14px] font-semibold text-[#1f2128]">{rec.campaign_name}</span>
                    <span
                      className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0"
                      style={{ color: uc.color, background: uc.bg }}
                    >
                      {rec.urgency}
                    </span>
                  </div>
                  {rec.event_name && rec.event_name !== "general" && (
                    <p className="text-[11px] text-[#7B59FF] font-medium mb-1">Tied to: {rec.event_name}</p>
                  )}
                  <p className="text-[12px] text-[#545b6d] leading-snug mb-2">{rec.key_message}</p>
                  <p className="text-[11px] text-[#a1a5ae] italic mb-3">{rec.rationale}</p>
                  <div className="flex items-center gap-1.5 flex-wrap mb-2">
                    <span className="text-[10px] font-medium text-[#7B59FF] bg-[#EFEBFF] rounded px-1.5 py-0.5">
                      {rec.pillar}
                    </span>
                    {rec.platforms?.slice(0, 2).map((p) => (
                      <span key={p} className="text-[10px] text-[#71757e] bg-[#f3f4f6] rounded px-1.5 py-0.5">
                        {p}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-[#7B59FF] opacity-0 group-hover:opacity-100 transition-opacity">
                    <Sparkles size={10} /> Create this campaign <ArrowRight size={10} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : !loadingRecs ? (
          <div className="bg-gradient-to-r from-[#EFEBFF] to-[#f8f9fb] rounded-lg p-5 text-center">
            <Sparkles size={20} color={DS.primary} className="mx-auto mb-2" />
            <p className="text-[13px] text-[#545b6d]">
              Click &quot;Get Suggestions&quot; to get AI-powered campaign ideas based on your upcoming events.
            </p>
          </div>
        ) : null}
      </div>

      {/* Events section — secondary, below campaigns */}
      <div className="mt-10 pt-6 border-t border-[#e6e7eb]">
        <DashboardEvents />
      </div>
    </div>
  );
}
