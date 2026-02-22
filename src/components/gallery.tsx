"use client";

import { useState } from "react";
import { Sparkles, Loader2, CheckCircle, AlertCircle, Calendar, PenTool } from "lucide-react";
import { Btn } from "./ui/button";
import { AssetCard, type AssetData } from "./asset-card";

type GalleryProps = {
  assets: AssetData[];
  onAction: (id: string, action: string, data?: string) => void;
  campaignName: string;
  onFigmaPush: () => Promise<void>;
  onGenerateMore?: () => void;
  generating?: boolean;
  pushingToFigma?: boolean;
  figmaPushResult?: { success: boolean; message: string } | null;
  briefType?: "ai" | "manual";
  deadline?: string | null;
  designerInstructions?: string | null;
  overlayTitle?: string | null;
};

export function Gallery({ assets, onAction, campaignName, onFigmaPush, onGenerateMore, generating, pushingToFigma, figmaPushResult, briefType, deadline, designerInstructions, overlayTitle }: GalleryProps) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? assets : assets.filter((a) => a.status === filter);
  const count = (s: string) => (s === "all" ? assets.length : assets.filter((a) => a.status === s).length);
  const approvedCount = count("approved");
  const isManual = briefType === "manual";

  const filters = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "approved", label: "Approved" },
    { id: "rejected", label: "Rejected" },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-[#1f2128]">{campaignName || "Generated Assets"}</h2>
            {isManual && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#EFEBFF] text-[#7B59FF]">
                <PenTool size={11} /> Designer Brief
              </span>
            )}
          </div>
          <p className="text-sm text-[#545b6d] mt-1">
            {isManual ? "Designer brief — review instructions and push to Figma." : "Review, approve, and push to Figma."}
          </p>
          {/* Deadline badge */}
          {deadline && (
            <div className="flex items-center gap-1.5 mt-2">
              <Calendar size={13} className="text-[#D48806]" />
              <span className="text-sm font-medium text-[#D48806]">
                Due: {new Date(deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
              {(() => {
                const now = new Date(); now.setHours(0,0,0,0);
                const d = new Date(deadline); d.setHours(0,0,0,0);
                const days = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                if (days < 0) return <span className="text-xs font-bold text-[#DF1C41] bg-[#FFEBEE] px-1.5 py-0.5 rounded">OVERDUE</span>;
                if (days === 0) return <span className="text-xs font-bold text-[#DF1C41] bg-[#FFEBEE] px-1.5 py-0.5 rounded">TODAY</span>;
                if (days <= 3) return <span className="text-xs font-bold text-[#D48806] bg-[#FFF8E1] px-1.5 py-0.5 rounded">{days}d left</span>;
                return <span className="text-xs text-[#71757e]">({days} days)</span>;
              })()}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Generate More button — hidden for manual briefs */}
          {onGenerateMore && (
            <button
              onClick={onGenerateMore}
              disabled={generating}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#7B59FF] bg-[#EFEBFF] hover:bg-[#e2daff] rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {generating ? (
                <><Loader2 size={14} className="animate-spin" /> Generating...</>
              ) : (
                <><Sparkles size={14} /> Generate More</>
              )}
            </button>
          )}
          <div className="flex bg-[#f8f9fb] rounded-md border border-[#e6e7eb] overflow-hidden">
            {filters.map((fl) => {
              const c = count(fl.id);
              const sel = filter === fl.id;
              return (
                <button
                  key={fl.id}
                  onClick={() => setFilter(fl.id)}
                  className={`px-3.5 py-2 text-[13px] font-medium border-r border-[#e6e7eb] last:border-r-0 transition-all cursor-pointer ${
                    sel ? "bg-white text-[#1f2128] shadow-sm" : "bg-transparent text-[#545b6d]"
                  }`}
                >
                  {fl.label} <span className="text-[#71757e]">({c})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Designer instructions card — shown for manual briefs */}
      {isManual && designerInstructions && (
        <div className="mb-6 p-4 bg-[#f8f9fb] rounded-lg border border-[#e6e7eb]">
          <div className="flex items-center gap-2 mb-2">
            <PenTool size={14} className="text-[#7B59FF]" />
            <span className="text-sm font-semibold text-[#1f2128]">Designer Instructions</span>
          </div>
          <p className="text-[13px] text-[#545b6d] leading-relaxed whitespace-pre-line">{designerInstructions}</p>
          {overlayTitle && (
            <div className="mt-3 pt-3 border-t border-[#e6e7eb]">
              <span className="text-[12px] font-medium text-[#71757e] uppercase tracking-wide">Overlay Title</span>
              <p className="text-sm font-semibold text-[#1f2128] mt-0.5">{overlayTitle}</p>
            </div>
          )}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-5">
        {filtered.map((a) => (
          <AssetCard key={a.id} asset={a} onAction={onAction} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="py-16 text-center">
          {isManual && assets.length === 0 ? (
            <div>
              <PenTool size={28} className="mx-auto mb-3 text-[#c4c9d4]" />
              <div className="text-[#71757e] mb-1">This is a designer brief</div>
              <div className="text-[13px] text-[#a1a5ae]">Assets will be created by your design team. Push instructions to Figma to get started.</div>
            </div>
          ) : (
            <div className="text-[#71757e]">No {filter} assets.</div>
          )}
        </div>
      )}

      {/* Figma push result toast */}
      {figmaPushResult && (
        <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm font-medium ${
          figmaPushResult.success
            ? "bg-[#E6F4EA] text-[#007737] border border-[#00773720]"
            : "bg-[#FFEBEE] text-[#DF1C41] border border-[#DF1C4120]"
        }`}>
          {figmaPushResult.success ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {figmaPushResult.message}
        </div>
      )}

      {/* Push to Figma banner */}
      {approvedCount > 0 && (
        <div className="mt-6 p-4 bg-[#EFEBFF] rounded-lg border border-[#7B59FF20] flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
              <img src="/figma.svg" alt="Figma" width={20} height={20} />
            </div>
            <div>
              <div className="text-[15px] font-semibold text-[#7B59FF]">
                {approvedCount} asset{approvedCount > 1 ? "s" : ""} ready for Figma
              </div>
              <div className="text-[13px] text-[#545b6d]">Push as editable frames via Figma MCP server</div>
            </div>
          </div>
          <Btn variant="primary" onClick={onFigmaPush} disabled={pushingToFigma}>
            {pushingToFigma ? (
              <><Loader2 size={14} className="animate-spin" /> Pushing...</>
            ) : (
              <><img src="/figma.svg" alt="" width={14} height={14} className="brightness-0 invert" /> Push to Figma</>
            )}
          </Btn>
        </div>
      )}
    </div>
  );
}
