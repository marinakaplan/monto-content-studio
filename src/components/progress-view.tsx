"use client";

import { useState, useEffect } from "react";
import {
  Search, Type, Layout, Layers, Image, FileText, Package, Star, Check,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { ICPS, SENIORITY, DS } from "@/lib/constants";

type ProgressProps = {
  brief: {
    campaign: string;
    icp: string;
    seniority: string;
    pillar: string;
    platforms: string[];
  };
  briefId: string;
  onComplete: () => void;
};

export function ProgressView({ brief, briefId, onComplete }: ProgressProps) {
  const [stage, setStage] = useState(0);
  const icp = ICPS.find((i) => i.id === brief.icp);
  const sen = SENIORITY.find((s) => s.id === brief.seniority);

  const stages = [
    { label: "Analyzing brief", sub: `${icp?.label} × ${sen?.label}`, icon: Search },
    { label: "Applying brand voice", sub: "Tone rules, writing guidelines, content pillars", icon: Type },
    { label: "Selecting visual direction", sub: "Template matching based on message type", icon: Layout },
    { label: "Loading brand assets", sub: "Illustration style, color palette, layout patterns", icon: Layers },
    { label: "Creating visuals", sub: "On-brand illustrations for each variant", icon: Image },
    {
      label: "Writing copy",
      sub: `${brief.pillar ? "1 pillar" : "5 pillars"} × ${brief.platforms.length} platform(s)`,
      icon: FileText,
    },
    { label: "Assembling assets", sub: "Final composition per platform", icon: Package },
  ];

  useEffect(() => {
    const t = setInterval(() => {
      setStage((p) => {
        if (p >= stages.length - 1) {
          clearInterval(t);
          setTimeout(onComplete, 600);
          return p;
        }
        return p + 1;
      });
    }, 950);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-[520px] mx-auto pt-4">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 relative">
          <div
            className="w-16 h-16 rounded-full border-[3px] border-[#e6e7eb]"
            style={{
              borderTopColor: DS.primary,
              animation: "monto-spin 0.9s linear infinite",
            }}
          />
          <Star
            size={20}
            color={DS.primary}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        </div>
        <h3 className="text-lg font-bold text-[#1f2128]">Creating Campaign Assets</h3>
        <p className="text-sm text-[#a1a5ae] mt-1">{brief.campaign}</p>
      </div>

      <div className="bg-white rounded-lg border border-[#e6e7eb] p-4">
        {stages.map((s, i) => {
          const Icon = s.icon;
          const done = i < stage;
          const active = i === stage;
          const future = i > stage;
          return (
            <div
              key={i}
              className={`flex items-start gap-3 py-2.5 transition-all duration-400 ${
                i < stages.length - 1 ? "border-b border-[#e6e7eb]" : ""
              }`}
              style={{ opacity: future ? 0.25 : 1 }}
            >
              <div
                className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center transition-all duration-300"
                style={{
                  background: done ? DS.successBg : active ? DS.primaryLighter : DS.bg,
                }}
              >
                {done ? (
                  <Check size={13} color={DS.success} />
                ) : (
                  <Icon
                    size={13}
                    color={active ? DS.primary : DS.mutedFg}
                    style={active ? { animation: "monto-pulse 1.5s ease infinite" } : {}}
                  />
                )}
              </div>
              <div className="flex-1">
                <div className={`text-sm ${active ? "font-semibold" : "font-normal"} text-[#1f2128]`}>
                  {s.label}
                </div>
                <div className="text-[13px] text-[#a1a5ae]">{s.sub}</div>
              </div>
              {done && (
                <Badge color={DS.success} bg={DS.successBg} className="text-xs !py-0.5 !px-2">
                  Done
                </Badge>
              )}
              {active && (
                <Badge color={DS.primary} bg={DS.primaryLighter} className="text-xs !py-0.5 !px-2">
                  Running
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
