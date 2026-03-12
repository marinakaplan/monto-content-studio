"use client";

import { Loader2, Info } from "lucide-react";

type CompetitorComparisonProps = {
  competitorPost: string;
  montoResponse: string | null;
  analysisNotes: string | null;
  loading?: boolean;
};

export function CompetitorComparison({
  competitorPost,
  montoResponse,
  analysisNotes,
  loading = false,
}: CompetitorComparisonProps) {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left — Competitor */}
        <div className="bg-white border border-[#e6e7eb] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e6e7eb] flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#DF1C41]" />
            <span className="text-[13px] font-semibold text-[#1f2128]">Competitor</span>
          </div>
          <div className="p-4 max-h-[400px] overflow-y-auto">
            <p className="text-[13px] text-[#545b6d] leading-relaxed whitespace-pre-line">
              {competitorPost}
            </p>
          </div>
        </div>

        {/* Right — Monto Response */}
        <div className="bg-white border border-[#e6e7eb] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[#e6e7eb] flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#7B59FF]" />
            <span className="text-[13px] font-semibold text-[#1f2128]">Monto Response</span>
          </div>
          <div className="p-4 max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={20} className="animate-spin text-[#7B59FF]" />
                <span className="ml-2 text-[13px] text-[#545b6d]">Generating response...</span>
              </div>
            ) : montoResponse ? (
              <p className="text-[13px] text-[#1f2128] leading-relaxed whitespace-pre-line">
                {montoResponse}
              </p>
            ) : (
              <p className="text-[13px] text-[#a1a5ae] italic text-center py-12">
                Response will appear here after analysis.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Notes */}
      {analysisNotes && (
        <div className="mt-4 bg-[#E3F2FD] border border-[#1750FB20] rounded-lg p-4 flex gap-3">
          <Info size={16} className="text-[#1750FB] shrink-0 mt-0.5" />
          <div>
            <span className="text-[12px] font-semibold text-[#1750FB] block mb-1">Analysis Notes</span>
            <p className="text-[13px] text-[#1f2128] leading-relaxed whitespace-pre-line">
              {analysisNotes}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
