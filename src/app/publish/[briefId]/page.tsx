"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  Loader2,
  Download,
  Copy,
  CheckCircle,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Btn } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlatformPreview } from "@/components/platform-preview";
import { CopyButton } from "@/components/ui/copy-button";
import { DS, PLATFORMS, PUBLISH_STATUS_CONFIG } from "@/lib/constants";
import type { Brief, Asset, PublishingFormat } from "@/lib/supabase";

export default function PublishingHub() {
  const params = useParams();
  const briefId = params.briefId as string;

  const [brief, setBrief] = useState<Brief | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [formats, setFormats] = useState<PublishingFormat[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const fetchData = useCallback(async () => {
    try {
      const [briefRes, formatsRes] = await Promise.all([
        fetch(`/api/briefs/${briefId}`),
        fetch(`/api/publishing-formats?brief_id=${briefId}`),
      ]);
      const briefData = await briefRes.json();
      const formatsData = await formatsRes.json();

      if (briefData && !briefData.error) {
        setBrief(briefData.brief || briefData);
        setAssets(briefData.assets || []);
      }
      if (Array.isArray(formatsData)) setFormats(formatsData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
    setLoading(false);
  }, [briefId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function generateFormats() {
    setGenerating(true);
    try {
      const approvedAssets = assets.filter((a) => a.status === "approved");
      const toGenerate = approvedAssets.length > 0 ? approvedAssets : assets;

      for (const asset of toGenerate) {
        await fetch("/api/publishing-formats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ asset_id: asset.id }),
        });
      }
      await fetchData();
    } catch (err) {
      console.error("Failed to generate formats:", err);
    }
    setGenerating(false);
  }

  async function markCopied(formatId: string) {
    await fetch(`/api/publishing-formats/${formatId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publish_status: "copied" }),
    });
    setFormats((prev) =>
      prev.map((f) => (f.id === formatId ? { ...f, publish_status: "copied" as const } : f))
    );
  }

  async function togglePublished(format: PublishingFormat) {
    const newStatus = format.publish_status === "published" ? "draft" : "published";
    await fetch(`/api/publishing-formats/${format.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publish_status: newStatus }),
    });
    setFormats((prev) =>
      prev.map((f) =>
        f.id === format.id
          ? { ...f, publish_status: newStatus as "draft" | "copied" | "published" }
          : f
      )
    );
  }

  function exportAll() {
    const allContent = formats
      .map((f) => {
        const asset = assets.find((a) => a.id === f.asset_id);
        return `--- ${f.platform.toUpperCase()} ${asset ? `(${asset.headline})` : ""} ---\n\n${f.formatted_content}`;
      })
      .join("\n\n\n");

    const blob = new Blob([allContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${brief?.campaign_name || "campaign"}-publishing-content.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyAll() {
    const allContent = formats.map((f) => f.formatted_content).join("\n\n---\n\n");
    navigator.clipboard.writeText(allContent);
  }

  const platformTabs = ["all", ...new Set(formats.map((f) => f.platform))];
  const filteredFormats = activeTab === "all" ? formats : formats.filter((f) => f.platform === activeTab);

  // Group formats by asset
  const formatsByAsset: Record<string, PublishingFormat[]> = {};
  filteredFormats.forEach((f) => {
    const key = f.asset_id || "unknown";
    if (!formatsByAsset[key]) formatsByAsset[key] = [];
    formatsByAsset[key].push(f);
  });

  if (loading) {
    return (
      <div className="px-8 pb-12 max-w-[1200px] mx-auto pt-6">
        <div className="flex items-center justify-center py-20 text-[#545b6d]">
          <Loader2 size={18} className="animate-spin mr-2" />
          Loading publishing hub...
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 pb-12 max-w-[1200px] mx-auto pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href="/publish"
            className="inline-flex items-center gap-1 text-[12px] text-[#7B59FF] font-medium mb-2 no-underline hover:underline"
          >
            <ArrowLeft size={12} /> Back to campaigns
          </Link>
          <h1 className="text-2xl font-bold text-[#1f2128]">
            {brief?.campaign_name || "Campaign"} — Publishing Hub
          </h1>
          <p className="text-sm text-[#545b6d] mt-1">
            {assets.length} asset{assets.length !== 1 ? "s" : ""} &middot;{" "}
            {formats.length} format{formats.length !== 1 ? "s" : ""} generated
          </p>
        </div>
        <div className="flex items-center gap-2">
          {formats.length > 0 && (
            <>
              <Btn variant="tertiary" size="small" onClick={copyAll}>
                <Copy size={13} /> Copy All
              </Btn>
              <Btn variant="tertiary" size="small" onClick={exportAll}>
                <Download size={13} /> Export .txt
              </Btn>
            </>
          )}
          <Btn
            variant="primary"
            size="small"
            onClick={generateFormats}
            disabled={generating || assets.length === 0}
          >
            {generating ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            {generating ? "Generating..." : "Generate Formats"}
          </Btn>
        </div>
      </div>

      {/* Platform tabs */}
      {formats.length > 0 && (
        <div className="border-b border-[#e6e7eb] mb-6">
          <nav className="flex items-center gap-1 -mb-px">
            {platformTabs.map((tab) => {
              const sel = activeTab === tab;
              const platCfg = PLATFORMS.find((p) => p.id === tab);
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-3 pb-3 pt-1 text-[13px] font-medium transition-colors cursor-pointer bg-transparent border-0 ${
                    sel ? "text-[#7B59FF]" : "text-[#545b6d] hover:text-[#1f2128]"
                  }`}
                >
                  {tab === "all" ? "All Platforms" : platCfg?.label || tab}
                  {sel && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#7B59FF] rounded-t-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* Content */}
      {formats.length === 0 ? (
        <div className="text-center py-16 bg-[#f8f9fb] rounded-lg border border-[#e6e7eb]">
          <RefreshCw size={24} className="mx-auto mb-3 text-[#a1a5ae]" />
          <h3 className="text-[15px] font-semibold text-[#1f2128] mb-1">No formats generated yet</h3>
          <p className="text-[13px] text-[#545b6d] mb-4">
            Click &quot;Generate Formats&quot; to create copy-ready content for each platform.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(formatsByAsset).map(([assetId, assetFormats]) => {
            const asset = assets.find((a) => a.id === assetId);
            return (
              <div key={assetId}>
                {assets.length > 1 && asset && (
                  <h2 className="text-[15px] font-semibold text-[#1f2128] mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7B59FF]" />
                    {asset.headline}
                  </h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assetFormats.map((format) => {
                    const statusCfg = PUBLISH_STATUS_CONFIG[format.publish_status];
                    return (
                      <div key={format.id} className="relative">
                        <div className="flex items-center justify-between mb-2">
                          <Badge color={statusCfg.color} bg={statusCfg.bg}>
                            {statusCfg.label}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <CopyButton
                              text={format.formatted_content}
                              label="Copy"
                              className=""
                            />
                            <button
                              onClick={() => togglePublished(format)}
                              className="flex items-center gap-1 text-[11px] font-medium cursor-pointer bg-transparent border-0 p-0"
                              style={{
                                color: format.publish_status === "published" ? "#007737" : "#a1a5ae",
                              }}
                            >
                              {format.publish_status === "published" ? (
                                <ToggleRight size={18} />
                              ) : (
                                <ToggleLeft size={18} />
                              )}
                              {format.publish_status === "published" ? "Published" : "Mark Published"}
                            </button>
                          </div>
                        </div>
                        <PlatformPreview
                          platform={format.platform}
                          headline={asset?.headline || ""}
                          body={format.formatted_content}
                          content={format.formatted_content}
                          formatType={format.format_type}
                          hashtags={asset?.hashtags}
                          illustrationUrl={asset?.illustration_url}
                          illustrationDesc={asset?.illustration_desc}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
