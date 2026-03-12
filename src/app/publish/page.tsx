"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, ArrowRight } from "lucide-react";
import { Btn } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DS, STATUS_CONFIG, PLATFORMS } from "@/lib/constants";
import type { Brief } from "@/lib/supabase";

type BriefWithCount = Brief & { asset_count: number };

export default function PublishingBriefSelector() {
  const router = useRouter();
  const [briefs, setBriefs] = useState<BriefWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/briefs")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBriefs(data.filter((b: BriefWithCount) => b.status === "review" || b.status === "complete"));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="px-8 pb-12 max-w-[1200px] mx-auto pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1f2128]">Publishing Hub</h1>
          <p className="text-sm text-[#545b6d] mt-1">
            Select a campaign to generate copy-ready content for each platform.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-[#545b6d]">
          <Loader2 size={18} className="animate-spin mr-2" />
          Loading campaigns...
        </div>
      ) : briefs.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-[#EFEBFF] flex items-center justify-center mx-auto mb-4">
            <Send size={24} color="#7B59FF" />
          </div>
          <h3 className="text-lg font-semibold text-[#1f2128] mb-2">No campaigns ready to publish</h3>
          <p className="text-sm text-[#545b6d] mb-6 max-w-sm mx-auto">
            Campaigns with &quot;In Review&quot; or &quot;Complete&quot; status will appear here.
          </p>
          <Btn variant="secondary" onClick={() => router.push("/")}>
            Back to Dashboard
          </Btn>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">
          {briefs.map((brief) => {
            const statusCfg = STATUS_CONFIG[brief.status];
            return (
              <div
                key={brief.id}
                className="bg-white border border-[#e6e7eb] rounded-lg p-5 hover:border-[#c4c9d4] hover:shadow-sm transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-[15px] font-semibold text-[#1f2128] truncate pr-2">
                    {brief.campaign_name}
                  </h3>
                  <Badge color={statusCfg.color} bg={statusCfg.bg}>
                    {statusCfg.label}
                  </Badge>
                </div>

                <p className="text-[12px] text-[#545b6d] mb-3 line-clamp-2">
                  {brief.key_message}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {brief.platforms.map((p) => {
                    const plat = PLATFORMS.find((pl) => pl.id === p);
                    return (
                      <span
                        key={p}
                        className="text-[11px] font-medium text-[#545b6d] bg-[#f3f4f6] rounded px-2 py-0.5"
                      >
                        {plat?.label || p}
                      </span>
                    );
                  })}
                  {brief.asset_count > 0 && (
                    <span className="text-[11px] font-medium text-[#7B59FF] bg-[#EFEBFF] rounded px-2 py-0.5">
                      {brief.asset_count} asset{brief.asset_count !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                <Btn
                  variant="primary"
                  size="small"
                  className="w-full"
                  onClick={() => router.push(`/publish/${brief.id}`)}
                >
                  Open Publishing Hub <ArrowRight size={13} />
                </Btn>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
