"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Image, Hash, Loader2, Sparkles,
} from "lucide-react";
import { Btn } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrandScoreBadge } from "@/components/brand-score-badge";
import { CommentsThread } from "@/components/comments-thread";
import { VersionTimeline } from "@/components/version-timeline";
import { DS, PILLARS, PLATFORMS, APPROVAL_STATUS_CONFIG } from "@/lib/constants";
import type { Asset, BrandVoiceScore } from "@/lib/supabase";

export default function AssetDetailPage() {
  const params = useParams();
  const assetId = params.assetId as string;

  const [asset, setAsset] = useState<Asset | null>(null);
  const [score, setScore] = useState<BrandVoiceScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);

  const fetchAsset = useCallback(async () => {
    try {
      const res = await fetch(`/api/asset-library/${assetId}`);
      if (res.ok) {
        const data = await res.json();
        setAsset(data.asset || data);
        if (data.brand_voice_score) setScore(data.brand_voice_score);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [assetId]);

  useEffect(() => {
    fetchAsset();
  }, [fetchAsset]);

  async function handleScoreBrandVoice() {
    if (!asset) return;
    setScoring(true);
    try {
      const res = await fetch("/api/brand-voice-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset_id: asset.id,
          text: `${asset.headline}\n\n${asset.body}`,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setScore(data);
      }
    } catch (err) {
      console.error(err);
    }
    setScoring(false);
  }

  async function handleRollback(versionId: string) {
    try {
      const res = await fetch(`/api/asset-versions/${versionId}/rollback`, {
        method: "POST",
      });
      if (res.ok) {
        await fetchAsset();
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="px-8 pb-12 max-w-[1200px] mx-auto pt-6">
        <div className="text-center py-20 text-[#71757e]">Loading asset...</div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="px-8 pb-12 max-w-[1200px] mx-auto pt-6">
        <div className="text-center py-20 text-[#71757e]">Asset not found.</div>
      </div>
    );
  }

  const pillar = PILLARS.find((p) => p.id === asset.pillar);
  const platform = PLATFORMS.find((p) => p.id === asset.platform);
  const statusCfg = APPROVAL_STATUS_CONFIG[asset.status];

  return (
    <div className="px-8 pb-12 max-w-[1200px] mx-auto pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/library"
            className="text-[#a1a5ae] hover:text-[#545b6d] transition-colors no-underline"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-[#1f2128]">{asset.headline}</h1>
              <Badge color={statusCfg.color} bg={statusCfg.bg}>
                {statusCfg.label}
              </Badge>
              {score && (
                <BrandScoreBadge
                  score={score.overall_score}
                  toneScore={score.tone_score}
                  clarityScore={score.clarity_score}
                  guidelinesScore={score.guidelines_score}
                  feedback={score.feedback}
                />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {platform && (
                <Badge color={DS.info} bg={DS.infoBg}>
                  {platform.label}
                </Badge>
              )}
              {pillar && (
                <Badge color={pillar.color} bg={`${pillar.color}15`}>
                  {pillar.label}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Btn variant="secondary" onClick={handleScoreBrandVoice} disabled={scoring}>
          {scoring ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {scoring ? "Scoring..." : "Score Brand Voice"}
        </Btn>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Left column — Full asset content */}
        <div className="space-y-6">
          {/* Image */}
          <div className="bg-white border border-[#e6e7eb] rounded-lg overflow-hidden">
            <div className="h-64 bg-[#f3f4f6] flex items-center justify-center">
              {asset.illustration_url ? (
                <img
                  src={asset.illustration_url}
                  alt={asset.headline}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <Image size={48} className="text-[#c4c9d4] mx-auto mb-2" />
                  <p className="text-[12px] text-[#a1a5ae]">No image available</p>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="bg-white border border-[#e6e7eb] rounded-lg p-5">
            <h3 className="text-[14px] font-semibold text-[#1f2128] mb-1">Headline</h3>
            <p className="text-[15px] text-[#1f2128] font-medium mb-4">{asset.headline}</p>

            <h3 className="text-[14px] font-semibold text-[#1f2128] mb-1">Body</h3>
            <p className="text-[13px] text-[#545b6d] leading-relaxed whitespace-pre-wrap mb-4">
              {asset.body}
            </p>

            {/* Hashtags */}
            {asset.hashtags && asset.hashtags.length > 0 && (
              <div>
                <h3 className="text-[14px] font-semibold text-[#1f2128] mb-2">Hashtags</h3>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {asset.hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-[12px] font-medium text-[#7B59FF] bg-[#EFEBFF] rounded-md px-2 py-0.5"
                    >
                      <Hash size={10} /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Illustration description */}
            {asset.illustration_desc && (
              <div className="mt-4">
                <h3 className="text-[14px] font-semibold text-[#1f2128] mb-1">Illustration Description</h3>
                <p className="text-[13px] text-[#545b6d] leading-relaxed italic">
                  {asset.illustration_desc}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Brand Voice Score Card */}
          <div className="bg-white border border-[#e6e7eb] rounded-lg p-5">
            <h3 className="text-[14px] font-semibold text-[#1f2128] mb-3">Brand Voice Score</h3>
            {score ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center mb-4">
                  <BrandScoreBadge
                    score={score.overall_score}
                    size="md"
                    toneScore={score.tone_score}
                    clarityScore={score.clarity_score}
                    guidelinesScore={score.guidelines_score}
                    feedback={score.feedback}
                  />
                </div>
                <div className="space-y-2">
                  {score.tone_score != null && (
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#545b6d]">Tone</span>
                      <span className="text-[13px] font-semibold text-[#1f2128]">{score.tone_score}</span>
                    </div>
                  )}
                  {score.clarity_score != null && (
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#545b6d]">Clarity</span>
                      <span className="text-[13px] font-semibold text-[#1f2128]">{score.clarity_score}</span>
                    </div>
                  )}
                  {score.guidelines_score != null && (
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] text-[#545b6d]">Guidelines</span>
                      <span className="text-[13px] font-semibold text-[#1f2128]">{score.guidelines_score}</span>
                    </div>
                  )}
                </div>
                {score.feedback && (
                  <div className="mt-3 pt-3 border-t border-[#e6e7eb]">
                    <p className="text-[12px] text-[#545b6d] leading-relaxed">{score.feedback}</p>
                  </div>
                )}
                {score.violations && score.violations.length > 0 && (
                  <div className="mt-2">
                    <p className="text-[11px] font-semibold text-[#DF1C41] mb-1">Violations:</p>
                    <ul className="space-y-0.5">
                      {score.violations.map((v, i) => (
                        <li key={i} className="text-[11px] text-[#545b6d]">- {v}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-[12px] text-[#71757e] mb-3">
                  No score yet. Run brand voice analysis to get a score.
                </p>
                <Btn variant="secondary" size="small" onClick={handleScoreBrandVoice} disabled={scoring}>
                  {scoring ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  Score Now
                </Btn>
              </div>
            )}
          </div>

          {/* Comments Thread */}
          <div className="bg-white border border-[#e6e7eb] rounded-lg p-5">
            <CommentsThread assetId={assetId} />
          </div>

          {/* Version Timeline */}
          <div className="bg-white border border-[#e6e7eb] rounded-lg p-5">
            <VersionTimeline assetId={assetId} onRollback={handleRollback} />
          </div>
        </div>
      </div>
    </div>
  );
}
