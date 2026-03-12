"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, Save } from "lucide-react";
import { Btn } from "@/components/ui/button";
import type { CampaignScorecard } from "@/lib/supabase";

type ScorecardFormProps = {
  scorecard: CampaignScorecard | null;
  onSave: (data: Partial<CampaignScorecard>) => void;
  onGenerateInsights?: () => void;
  loading?: boolean;
};

export function ScorecardForm({ scorecard, onSave, onGenerateInsights, loading = false }: ScorecardFormProps) {
  const [impressions, setImpressions] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [engagement, setEngagement] = useState(0);
  const [shares, setShares] = useState(0);
  const [conversions, setConversions] = useState(0);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (scorecard) {
      setImpressions(scorecard.impressions);
      setClicks(scorecard.clicks);
      setEngagement(scorecard.engagement);
      setShares(scorecard.shares);
      setConversions(scorecard.conversions);
      setNotes(scorecard.notes || "");
    }
  }, [scorecard]);

  function handleSave() {
    onSave({ impressions, clicks, engagement, shares, conversions, notes: notes || null });
  }

  const fields = [
    { label: "Impressions", value: impressions, setter: setImpressions },
    { label: "Clicks", value: clicks, setter: setClicks },
    { label: "Engagement", value: engagement, setter: setEngagement },
    { label: "Shares", value: shares, setter: setShares },
    { label: "Conversions", value: conversions, setter: setConversions },
  ];

  return (
    <div className="bg-white border border-[#e6e7eb] rounded-lg p-5">
      <h3 className="text-[15px] font-semibold text-[#1f2128] mb-4">Performance Metrics</h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        {fields.map((f) => (
          <div key={f.label}>
            <label className="text-[12px] font-medium text-[#545b6d] block mb-1">{f.label}</label>
            <input
              type="number"
              min={0}
              value={f.value}
              onChange={(e) => f.setter(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 text-[13px] border border-[#c4c9d4] rounded-lg text-[#1f2128] focus:outline-none focus:border-[#7B59FF] focus:ring-2 focus:ring-[rgba(123,89,255,0.12)] transition-colors"
            />
          </div>
        ))}
      </div>

      <div className="mb-4">
        <label className="text-[12px] font-medium text-[#545b6d] block mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Campaign performance notes..."
          className="w-full px-3 py-2 text-[13px] border border-[#c4c9d4] rounded-lg text-[#1f2128] resize-none focus:outline-none focus:border-[#7B59FF] focus:ring-2 focus:ring-[rgba(123,89,255,0.12)] transition-colors"
        />
      </div>

      <div className="flex items-center gap-3">
        <Btn variant="primary" size="small" onClick={handleSave} disabled={loading}>
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
          Save Metrics
        </Btn>
        {scorecard && onGenerateInsights && (
          <Btn variant="secondary" size="small" onClick={onGenerateInsights} disabled={loading}>
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
            Generate AI Insights
          </Btn>
        )}
      </div>

      {scorecard?.ai_insights && (
        <div className="mt-4 bg-[#EFEBFF] border border-[#7B59FF20] rounded-lg p-4 flex gap-3">
          <Sparkles size={16} className="text-[#7B59FF] shrink-0 mt-0.5" />
          <div>
            <span className="text-[12px] font-semibold text-[#7B59FF] block mb-1">AI Insights</span>
            <p className="text-[13px] text-[#1f2128] leading-relaxed whitespace-pre-line">
              {scorecard.ai_insights}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
