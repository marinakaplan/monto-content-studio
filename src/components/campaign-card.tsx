"use client";

import { Clock, FileText } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { ICPS, PILLARS, STATUS_CONFIG } from "@/lib/constants";
import type { Brief } from "@/lib/supabase";

type BriefWithCount = Brief & { asset_count: number };

type CampaignCardProps = {
  brief: BriefWithCount;
  onClick: () => void;
};

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function CampaignCard({ brief, onClick }: CampaignCardProps) {
  const icp = ICPS.find((i) => i.id === brief.icp);
  const pillar = brief.pillar ? PILLARS.find((p) => p.id === brief.pillar) : null;
  const status = STATUS_CONFIG[brief.status];
  const IcpIcon = icp?.icon;
  const PillarIcon = pillar?.icon;

  return (
    <Card hoverable onClick={onClick} className="p-4">
      {/* Top row: status + time */}
      <div className="flex items-center justify-between mb-3">
        <Badge color={status.color} bg={status.bg}>{status.label}</Badge>
        <span className="text-[13px] text-[#71757e] flex items-center gap-1">
          <Clock size={12} /> {formatTimeAgo(brief.created_at)}
        </span>
      </div>

      {/* Campaign name */}
      <h4 className="text-[15px] font-bold text-[#1f2128] mb-1.5 leading-snug">
        {brief.campaign_name}
      </h4>

      {/* Key message preview */}
      <p className="text-[13px] text-[#545b6d] mb-3 line-clamp-2">{brief.key_message}</p>

      {/* Bottom row: ICP + pillar + asset count */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {IcpIcon && (
          <Badge
            color={icp?.color}
            bg={`${icp?.color}15`}
            icon={IcpIcon}
            className="text-xs !py-0.5 !px-2"
          >
            {icp?.label?.split(" ")[0]}
          </Badge>
        )}
        {PillarIcon && pillar && (
          <Badge
            color={pillar.color}
            bg={`${pillar.color}15`}
            icon={PillarIcon}
            className="text-xs !py-0.5 !px-2"
          >
            {pillar.label}
          </Badge>
        )}
        <div className="flex-1" />
        <span className="text-[13px] text-[#71757e] flex items-center gap-1">
          <FileText size={12} /> {brief.asset_count} assets
        </span>
      </div>
    </Card>
  );
}
