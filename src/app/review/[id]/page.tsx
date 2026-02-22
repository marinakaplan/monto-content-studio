"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Cpu, ChevronRight } from "lucide-react";
import { Gallery } from "@/components/gallery";
import { GenerationLogModal } from "@/components/generation-log-modal";
import { Btn } from "@/components/ui/button";
import type { AssetData } from "@/components/asset-card";
import type { GenerationLog } from "@/lib/supabase";

export default function ReviewPage() {
  const { id } = useParams<{ id: string }>();
  const [campaignName, setCampaignName] = useState("");
  const [briefType, setBriefType] = useState<"ai" | "manual">("ai");
  const [deadline, setDeadline] = useState<string | null>(null);
  const [designerInstructions, setDesignerInstructions] = useState<string | null>(null);
  const [overlayTitle, setOverlayTitle] = useState<string | null>(null);
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [generationLogs, setGenerationLogs] = useState<GenerationLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [generatingMore, setGeneratingMore] = useState(false);
  const [pushingToFigma, setPushingToFigma] = useState(false);
  const [figmaPushResult, setFigmaPushResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/briefs/${id}`);
      const data = await res.json();
      setCampaignName(data.campaign_name);
      setBriefType(data.brief_type || "ai");
      setDeadline(data.event?.date || data.deadline || null);
      setDesignerInstructions(data.designer_instructions || null);
      setOverlayTitle(data.overlay_title || null);
      if (data.generation_logs) {
        setGenerationLogs(data.generation_logs);
      }
      setAssets(
        (data.assets || []).map((a: Record<string, unknown>) => ({
          id: a.id as string,
          template: a.template as string,
          pillar: a.pillar as string,
          platform: a.platform as string,
          icp: data.icp,
          seniority: data.seniority,
          status: a.status as "pending" | "approved" | "rejected",
          headline: a.headline as string,
          body: a.body as string,
          illustrationDesc: (a.illustration_desc as string) || "",
          illustrationUrl: (a.illustration_url as string) || null,
          hashtags: (a.hashtags as string[]) || [],
          notes: ((a.notes as Array<{ content: string }>) || []).map((n) => n.content),
        }))
      );
    } catch (err) {
      console.error("Failed to fetch brief:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleAction(assetId: string, action: string, data?: string) {
    if (action === "approve" || action === "reject") {
      setAssets((prev) =>
        prev.map((a) =>
          a.id === assetId ? { ...a, status: action === "approve" ? "approved" : "rejected" } : a
        )
      );
      await fetch(`/api/assets/${assetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action === "approve" ? "approved" : "rejected" }),
      });
    } else if (action === "note" && data) {
      setAssets((prev) =>
        prev.map((a) => (a.id === assetId ? { ...a, notes: [...a.notes, data] } : a))
      );
      await fetch(`/api/assets/${assetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: data }),
      });
    } else if (action === "regenerate") {
      setAssets((prev) =>
        prev.map((a) => (a.id === assetId ? { ...a, status: "pending" } : a))
      );
    }
  }

  async function handleGenerateMore() {
    setGeneratingMore(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief_id: id }),
      });
      if (res.ok) {
        // Refresh data to pick up new assets
        await fetchData();
      } else {
        const err = await res.json();
        console.error("Generation failed:", err.error);
      }
    } catch (err) {
      console.error("Generation failed:", err);
    } finally {
      setGeneratingMore(false);
    }
  }

  async function handleFigmaPush() {
    const approvedIds = assets.filter((a) => a.status === "approved").map((a) => a.id);
    if (approvedIds.length === 0) return;

    setPushingToFigma(true);
    setFigmaPushResult(null);
    try {
      const res = await fetch("/api/figma-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asset_ids: approvedIds }),
      });
      const data = await res.json();
      if (res.ok) {
        setFigmaPushResult({
          success: true,
          message: `Successfully pushed ${data.pushed} asset${data.pushed > 1 ? "s" : ""} to Figma.`,
        });
      } else {
        setFigmaPushResult({
          success: false,
          message: data.error || "Figma push failed. Check your credentials.",
        });
      }
    } catch (err) {
      setFigmaPushResult({
        success: false,
        message: err instanceof Error ? err.message : "Network error — could not reach Figma.",
      });
    } finally {
      setPushingToFigma(false);
    }
  }

  const breadcrumb = (
    <nav className="flex items-center gap-1.5 text-[13px] text-[#a1a5ae] pt-6 pb-5">
      <Link href="/" className="hover:text-[#545b6d] transition-colors">Dashboard</Link>
      <ChevronRight size={12} />
      <span className="text-[#1f2128] font-medium">{campaignName || "Review"}</span>
    </nav>
  );

  if (loading) {
    return (
      <div className="px-6 pb-12 max-w-[1200px]">
        {breadcrumb}
        <div className="text-center py-20 text-[#71757e]">Loading assets...</div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-12 max-w-[1200px]">
      {breadcrumb}

      {/* Generation log button */}
      {generationLogs.length > 0 && (
        <div className="flex justify-end mb-3">
          <Btn variant="tertiary" size="small" onClick={() => setShowLogs(true)}>
            <Cpu size={13} /> View Generation Log
          </Btn>
        </div>
      )}

      <Gallery
        assets={assets}
        onAction={handleAction}
        campaignName={campaignName}
        onFigmaPush={handleFigmaPush}
        onGenerateMore={briefType === "manual" ? undefined : handleGenerateMore}
        generating={generatingMore}
        pushingToFigma={pushingToFigma}
        figmaPushResult={figmaPushResult}
        briefType={briefType}
        deadline={deadline}
        designerInstructions={designerInstructions}
        overlayTitle={overlayTitle}
      />

      {/* Generation log modal */}
      {showLogs && (
        <GenerationLogModal
          logs={generationLogs}
          onClose={() => setShowLogs(false)}
        />
      )}
    </div>
  );
}
