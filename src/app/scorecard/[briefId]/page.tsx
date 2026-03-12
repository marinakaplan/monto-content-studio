"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Loader2,
  BarChart3,
  MousePointerClick,
  Eye,
  Share2,
  TrendingUp,
  Plus,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Btn } from "@/components/ui/button";
import { ScorecardForm } from "@/components/scorecard-form";
import { ABTracker } from "@/components/ab-tracker";
import { DS } from "@/lib/constants";
import type { Brief, CampaignScorecard } from "@/lib/supabase";
import type { LucideIcon } from "lucide-react";

function StatBox({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: string | number;
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
        <div className="text-xl font-bold text-[#1f2128]">{value}</div>
        <div className="text-[12px] text-[#545b6d]">{label}</div>
      </div>
    </div>
  );
}

export default function CampaignScorecardPage() {
  const params = useParams();
  const briefId = params.briefId as string;

  const [brief, setBrief] = useState<Brief | null>(null);
  const [scorecard, setScorecard] = useState<CampaignScorecard | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [briefRes, scorecardRes] = await Promise.all([
        fetch(`/api/briefs/${briefId}`),
        fetch(`/api/campaign-scorecards?brief_id=${briefId}`),
      ]);
      const briefData = await briefRes.json();
      const scorecardData = await scorecardRes.json();

      if (briefData && !briefData.error) {
        setBrief(briefData.brief || briefData);
      }
      if (Array.isArray(scorecardData) && scorecardData.length > 0) {
        setScorecard(scorecardData[0]);
      }
    } catch (err) {
      console.error("Failed to fetch:", err);
    }
    setLoading(false);
  }, [briefId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleCreateScorecard() {
    setSaving(true);
    try {
      const res = await fetch("/api/campaign-scorecards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief_id: briefId }),
      });
      const data = await res.json();
      if (data && !data.error) {
        setScorecard(data);
      }
    } catch (err) {
      console.error("Failed to create scorecard:", err);
    }
    setSaving(false);
  }

  async function handleSave(data: Partial<CampaignScorecard>) {
    if (!scorecard) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/campaign-scorecards/${scorecard.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const updated = await res.json();
      if (updated && !updated.error) {
        setScorecard(updated);
      }
    } catch (err) {
      console.error("Failed to save:", err);
    }
    setSaving(false);
  }

  async function handleGenerateInsights() {
    if (!scorecard) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/campaign-scorecards/${scorecard.id}/insights`, {
        method: "POST",
      });
      const data = await res.json();
      if (data && !data.error) {
        setScorecard((prev) => (prev ? { ...prev, ai_insights: data.ai_insights } : prev));
      }
    } catch (err) {
      console.error("Failed to generate insights:", err);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="px-8 pb-12 max-w-[1200px] mx-auto pt-6">
        <div className="flex items-center justify-center py-20 text-[#545b6d]">
          <Loader2 size={18} className="animate-spin mr-2" />
          Loading scorecard...
        </div>
      </div>
    );
  }

  const engagementRate =
    scorecard && scorecard.impressions > 0
      ? ((scorecard.engagement / scorecard.impressions) * 100).toFixed(1) + "%"
      : "0%";

  return (
    <div className="px-8 pb-12 max-w-[1200px] mx-auto pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[12px] text-[#7B59FF] font-medium mb-2 no-underline hover:underline"
          >
            <ArrowLeft size={12} /> Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-[#1f2128]">
            {brief?.campaign_name || "Campaign"} — Performance Scorecard
          </h1>
          <p className="text-sm text-[#545b6d] mt-1">
            Track performance metrics and get AI-powered insights.
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      {scorecard && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatBox
            label="Impressions"
            value={scorecard.impressions.toLocaleString()}
            icon={Eye}
            color={DS.info}
            bg={DS.infoBg}
          />
          <StatBox
            label="Clicks"
            value={scorecard.clicks.toLocaleString()}
            icon={MousePointerClick}
            color={DS.primary}
            bg={DS.primaryLighter}
          />
          <StatBox
            label="Engagement Rate"
            value={engagementRate}
            icon={TrendingUp}
            color={DS.success}
            bg={DS.successBg}
          />
          <StatBox
            label="Shares"
            value={scorecard.shares.toLocaleString()}
            icon={Share2}
            color={DS.warning}
            bg={DS.warningBg}
          />
        </div>
      )}

      {/* Scorecard Form or Create Button */}
      {scorecard ? (
        <div className="mb-8">
          <ScorecardForm
            scorecard={scorecard}
            onSave={handleSave}
            onGenerateInsights={handleGenerateInsights}
            loading={saving}
          />
        </div>
      ) : (
        <div className="text-center py-12 bg-[#f8f9fb] border border-[#e6e7eb] rounded-lg mb-8">
          <BarChart3 size={24} className="mx-auto mb-3 text-[#a1a5ae]" />
          <h3 className="text-[15px] font-semibold text-[#1f2128] mb-1">No scorecard yet</h3>
          <p className="text-[13px] text-[#545b6d] mb-4">
            Create a scorecard to start tracking campaign performance.
          </p>
          <Btn variant="primary" onClick={handleCreateScorecard} disabled={saving}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add Scorecard
          </Btn>
        </div>
      )}

      {/* A/B Tracker */}
      <div className="border-t border-[#e6e7eb] pt-6">
        <ABTracker briefId={briefId} />
      </div>
    </div>
  );
}
