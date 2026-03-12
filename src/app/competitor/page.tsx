"use client";

import { useState, useEffect } from "react";
import { Swords, Loader2, Clock, ChevronRight } from "lucide-react";
import { Btn } from "@/components/ui/button";
import { CompetitorComparison } from "@/components/competitor-comparison";
import { PLATFORMS } from "@/lib/constants";
import type { CompetitorAnalysis } from "@/lib/supabase";

export default function CompetitorIntelPage() {
  const [competitorPost, setCompetitorPost] = useState("");
  const [platform, setPlatform] = useState("linkedin");
  const [analyzing, setAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<CompetitorAnalysis | null>(null);
  const [history, setHistory] = useState<CompetitorAnalysis[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    fetch("/api/competitor-analysis?limit=10")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setHistory(data);
        setLoadingHistory(false);
      })
      .catch(() => setLoadingHistory(false));
  }, []);

  async function handleAnalyze() {
    if (!competitorPost.trim()) return;
    setAnalyzing(true);
    setCurrentAnalysis(null);

    try {
      const res = await fetch("/api/competitor-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitor_post: competitorPost,
          platform,
        }),
      });
      const data = await res.json();
      if (data && !data.error) {
        setCurrentAnalysis(data);
        setHistory((prev) => [data, ...prev].slice(0, 10));
      }
    } catch (err) {
      console.error("Failed to analyze:", err);
    }
    setAnalyzing(false);
  }

  function viewHistoryItem(item: CompetitorAnalysis) {
    setCurrentAnalysis(item);
    setCompetitorPost(item.competitor_post);
    if (item.platform) setPlatform(item.platform);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="px-8 pb-12 max-w-[1200px] mx-auto pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1f2128]">Competitor Intel</h1>
          <p className="text-sm text-[#545b6d] mt-1">
            Paste a competitor&apos;s post and get an AI-generated Monto response with analysis.
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white border border-[#e6e7eb] rounded-lg p-5 mb-6">
        <div className="mb-4">
          <label className="text-[13px] font-medium text-[#1f2128] block mb-2">
            Competitor&apos;s Post
          </label>
          <textarea
            value={competitorPost}
            onChange={(e) => setCompetitorPost(e.target.value)}
            rows={6}
            placeholder="Paste the competitor's social media post or content here..."
            className="w-full px-4 py-3 text-[13px] border border-[#c4c9d4] rounded-lg text-[#1f2128] resize-none focus:outline-none focus:border-[#7B59FF] focus:ring-2 focus:ring-[rgba(123,89,255,0.12)] transition-colors"
          />
        </div>

        <div className="flex items-end gap-4">
          <div>
            <label className="text-[12px] font-medium text-[#545b6d] block mb-1">Platform</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="appearance-none bg-white border border-[#c4c9d4] rounded-lg px-3 py-2 text-[13px] text-[#1f2128] font-medium cursor-pointer hover:border-[#7B59FF] focus:outline-none focus:border-[#7B59FF] focus:ring-2 focus:ring-[rgba(123,89,255,0.12)] transition-colors pr-8"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: "right 8px center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "16px",
              }}
            >
              {PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <Btn
            variant="primary"
            onClick={handleAnalyze}
            disabled={analyzing || !competitorPost.trim()}
          >
            {analyzing ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Swords size={14} />
            )}
            {analyzing ? "Analyzing..." : "Analyze & Respond"}
          </Btn>
        </div>
      </div>

      {/* Results */}
      {(currentAnalysis || analyzing) && (
        <div className="mb-8">
          <CompetitorComparison
            competitorPost={currentAnalysis?.competitor_post || competitorPost}
            montoResponse={currentAnalysis?.monto_response || null}
            analysisNotes={currentAnalysis?.analysis_notes || null}
            loading={analyzing}
          />
        </div>
      )}

      {/* History */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-[#545b6d]" />
          <h2 className="text-[15px] font-semibold text-[#1f2128]">Past Analyses</h2>
        </div>

        {loadingHistory ? (
          <div className="text-center py-8 text-[#545b6d]">
            <Loader2 size={16} className="animate-spin mx-auto mb-2" />
            Loading history...
          </div>
        ) : history.length === 0 ? (
          <div className="bg-[#f8f9fb] border border-[#e6e7eb] rounded-lg p-6 text-center">
            <p className="text-[13px] text-[#545b6d]">
              No past analyses yet. Paste a competitor&apos;s post above to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => viewHistoryItem(item)}
                className={`w-full text-left bg-white border rounded-lg px-4 py-3 flex items-center gap-3 transition-all cursor-pointer hover:border-[#c4c9d4] hover:shadow-sm ${
                  currentAnalysis?.id === item.id
                    ? "border-[#7B59FF] bg-[#EFEBFF08]"
                    : "border-[#e6e7eb]"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[#1f2128] truncate font-medium">
                    {item.competitor_post.slice(0, 100)}
                    {item.competitor_post.length > 100 ? "..." : ""}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {item.platform && (
                      <span className="text-[11px] font-medium text-[#545b6d] bg-[#f3f4f6] rounded px-1.5 py-0.5">
                        {PLATFORMS.find((p) => p.id === item.platform)?.label || item.platform}
                      </span>
                    )}
                    <span className="text-[11px] text-[#a1a5ae]">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[#a1a5ae] shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
