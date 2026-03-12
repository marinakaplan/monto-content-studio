"use client";

import { useState, useEffect } from "react";
import { Loader2, Sparkles, ToggleLeft, ToggleRight } from "lucide-react";
import { Btn } from "@/components/ui/button";
import type { ABVariant } from "@/lib/supabase";

type ABTrackerProps = {
  briefId: string;
};

export function ABTracker({ briefId }: ABTrackerProps) {
  const [variants, setVariants] = useState<ABVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [learningsLoading, setLearningsLoading] = useState(false);
  const [learnings, setLearnings] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/ab-variants?brief_id=${briefId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setVariants(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [briefId]);

  function updateVariant(id: string, field: string, value: number | boolean) {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  }

  async function saveVariant(variant: ABVariant) {
    await fetch(`/api/ab-variants/${variant.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        was_published: variant.was_published,
        impressions: variant.impressions,
        clicks: variant.clicks,
        engagement: variant.engagement,
        shares: variant.shares,
      }),
    });
  }

  async function generateLearnings() {
    setLearningsLoading(true);
    try {
      const res = await fetch("/api/ab-variants/learnings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief_id: briefId }),
      });
      const data = await res.json();
      if (data.learnings) setLearnings(data.learnings);
    } catch (err) {
      console.error("Failed to generate learnings:", err);
    }
    setLearningsLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-[#545b6d]">
        <Loader2 size={16} className="animate-spin mr-2" />
        Loading variants...
      </div>
    );
  }

  if (variants.length === 0) {
    return (
      <div className="bg-[#f8f9fb] border border-[#e6e7eb] rounded-lg p-6 text-center">
        <p className="text-[13px] text-[#545b6d]">No A/B variants found for this campaign.</p>
      </div>
    );
  }

  const variantColors: Record<string, string> = {
    A: "#7B59FF",
    B: "#1750FB",
    C: "#007737",
    D: "#D48806",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-[#1f2128]">A/B Variant Tracking</h3>
        <Btn
          variant="secondary"
          size="small"
          onClick={generateLearnings}
          disabled={learningsLoading}
        >
          {learningsLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
          Generate Learnings
        </Btn>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {variants.map((variant) => {
          const color = variantColors[variant.variant_label] || "#545b6d";
          return (
            <div
              key={variant.id}
              className="bg-white border border-[#e6e7eb] rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-7 h-7 rounded-md flex items-center justify-center text-[13px] font-bold text-white"
                    style={{ background: color }}
                  >
                    {variant.variant_label}
                  </span>
                  <span className="text-[13px] font-medium text-[#1f2128] truncate max-w-[160px]">
                    Variant {variant.variant_label}
                  </span>
                </div>
                <button
                  onClick={() => {
                    updateVariant(variant.id, "was_published", !variant.was_published);
                    saveVariant({ ...variant, was_published: !variant.was_published });
                  }}
                  className="flex items-center gap-1 text-[11px] font-medium cursor-pointer bg-transparent border-0 p-0"
                  style={{ color: variant.was_published ? "#007737" : "#a1a5ae" }}
                >
                  {variant.was_published ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  {variant.was_published ? "Published" : "Draft"}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(["impressions", "clicks", "engagement", "shares"] as const).map((field) => (
                  <div key={field}>
                    <label className="text-[10px] font-medium text-[#a1a5ae] uppercase block mb-0.5">
                      {field}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={variant[field]}
                      onChange={(e) => updateVariant(variant.id, field, Number(e.target.value) || 0)}
                      onBlur={() => saveVariant(variant)}
                      className="w-full px-2 py-1.5 text-[12px] border border-[#e6e7eb] rounded-md text-[#1f2128] focus:outline-none focus:border-[#7B59FF] transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {(learnings || variants.some((v) => v.ai_learnings)) && (
        <div className="mt-4 bg-[#EFEBFF] border border-[#7B59FF20] rounded-lg p-4 flex gap-3">
          <Sparkles size={16} className="text-[#7B59FF] shrink-0 mt-0.5" />
          <div>
            <span className="text-[12px] font-semibold text-[#7B59FF] block mb-1">AI Learnings</span>
            <p className="text-[13px] text-[#1f2128] leading-relaxed whitespace-pre-line">
              {learnings || variants.find((v) => v.ai_learnings)?.ai_learnings}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
