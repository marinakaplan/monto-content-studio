"use client";

import { useState } from "react";
import { DS } from "@/lib/constants";

type BrandScoreBadgeProps = {
  score: number;
  size?: "sm" | "md";
  toneScore?: number | null;
  clarityScore?: number | null;
  guidelinesScore?: number | null;
  feedback?: string | null;
};

function getScoreColor(score: number): { color: string; bg: string } {
  if (score >= 80) return { color: DS.success, bg: DS.successBg };
  if (score >= 60) return { color: DS.warning, bg: DS.warningBg };
  return { color: DS.error, bg: DS.errorBg };
}

export function BrandScoreBadge({
  score,
  size = "sm",
  toneScore,
  clarityScore,
  guidelinesScore,
  feedback,
}: BrandScoreBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { color, bg } = getScoreColor(score);
  const px = size === "sm" ? 24 : 32;
  const fontSize = size === "sm" ? 11 : 14;
  const hasDetails =
    toneScore != null || clarityScore != null || guidelinesScore != null || feedback;

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => hasDetails && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span
        className="inline-flex items-center justify-center rounded-full font-bold shrink-0"
        style={{
          width: px,
          height: px,
          fontSize,
          color,
          background: bg,
          border: `1.5px solid ${color}`,
          lineHeight: 1,
        }}
      >
        {score}
      </span>

      {showTooltip && hasDetails && (
        <div
          className="absolute z-50 left-1/2 bottom-full mb-2 -translate-x-1/2 rounded-lg p-3 text-left whitespace-nowrap"
          style={{
            background: DS.fg,
            color: DS.white,
            fontSize: 12,
            boxShadow: DS.shadowMd,
          }}
        >
          <div className="font-semibold mb-1.5" style={{ fontSize: 13 }}>
            Brand Voice Score: {score}
          </div>
          {toneScore != null && (
            <div className="flex items-center justify-between gap-4 mb-0.5">
              <span style={{ color: "#a0a5b0" }}>Tone</span>
              <span className="font-semibold">{toneScore}</span>
            </div>
          )}
          {clarityScore != null && (
            <div className="flex items-center justify-between gap-4 mb-0.5">
              <span style={{ color: "#a0a5b0" }}>Clarity</span>
              <span className="font-semibold">{clarityScore}</span>
            </div>
          )}
          {guidelinesScore != null && (
            <div className="flex items-center justify-between gap-4 mb-0.5">
              <span style={{ color: "#a0a5b0" }}>Guidelines</span>
              <span className="font-semibold">{guidelinesScore}</span>
            </div>
          )}
          {feedback && (
            <div
              className="mt-1.5 pt-1.5 whitespace-normal max-w-[220px]"
              style={{ borderTop: "1px solid #3a3d45", color: "#c0c4cc", fontSize: 11 }}
            >
              {feedback}
            </div>
          )}
          {/* Tooltip arrow */}
          <div
            className="absolute left-1/2 top-full -translate-x-1/2"
            style={{
              width: 0,
              height: 0,
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: `5px solid ${DS.fg}`,
            }}
          />
        </div>
      )}
    </span>
  );
}
