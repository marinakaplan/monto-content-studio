"use client";

import { FileText, ArrowRight } from "lucide-react";
import { Btn } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DS, PILLARS, PLATFORMS } from "@/lib/constants";
import type { CampaignTemplate } from "@/lib/supabase";

type TemplateCardProps = {
  template: CampaignTemplate;
  onUse?: () => void;
};

export function TemplateCard({ template, onUse }: TemplateCardProps) {
  const snapshot = template.brief_snapshot as Record<string, unknown>;
  const pillarId = snapshot?.pillar as string | undefined;
  const pillar = pillarId ? PILLARS.find((p) => p.id === pillarId) : null;
  const platformIds = (snapshot?.platforms as string[]) ?? [];
  const matchedPlatforms = platformIds
    .map((pid) => PLATFORMS.find((p) => p.id === pid))
    .filter(Boolean);
  const icp = (snapshot?.icp as string) ?? null;
  const PillarIcon = pillar?.icon;

  return (
    <div
      className="bg-white rounded-xl p-4 transition-all duration-200 ease-out hover:shadow-md group"
      style={{
        border: `1px solid ${DS.borderSubtle}`,
        boxShadow: DS.shadowSm,
      }}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
        style={{ background: DS.primaryLighter }}
      >
        <FileText size={18} color={DS.primary} />
      </div>

      {/* Name + Description */}
      <h4 className="text-[14px] font-bold mb-1" style={{ color: DS.fg }}>
        {template.name}
      </h4>
      {template.description && (
        <p className="text-[12px] leading-relaxed mb-3 line-clamp-2" style={{ color: DS.muted }}>
          {template.description}
        </p>
      )}

      {/* Snapshot summary: pillar, platforms, ICP */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        {pillar && PillarIcon && (
          <Badge color={pillar.color} bg={`${pillar.color}15`} icon={PillarIcon}>
            {pillar.label}
          </Badge>
        )}
        {matchedPlatforms.map((plat) => {
          if (!plat) return null;
          const PlatIcon = plat.icon;
          return (
            <Badge key={plat.id} icon={PlatIcon}>
              {plat.label}
            </Badge>
          );
        })}
        {icp && (
          <span
            className="text-[10px] font-medium rounded px-1.5 py-0.5"
            style={{ color: DS.mutedFg, background: DS.neutralBg }}
          >
            {icp}
          </span>
        )}
      </div>

      {/* Tags */}
      {template.tags.length > 0 && (
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          {template.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium rounded-full px-2 py-0.5"
              style={{ color: DS.primary, background: DS.primaryLighter }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Meta row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px]" style={{ color: DS.mutedFg }}>
          Used {template.usage_count} time{template.usage_count !== 1 ? "s" : ""}
        </span>
        <span className="text-[11px]" style={{ color: DS.mutedFg }}>
          {new Date(template.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>

      {/* Action */}
      <Btn variant="secondary" size="small" className="w-full" onClick={onUse}>
        Use Template <ArrowRight size={12} />
      </Btn>
    </div>
  );
}
