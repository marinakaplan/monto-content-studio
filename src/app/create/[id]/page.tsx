"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ProgressView } from "@/components/progress-view";
import { AlertTriangle, RotateCcw, ChevronRight } from "lucide-react";

export default function CreateIdPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [brief, setBrief] = useState<{
    campaign: string;
    icp: string;
    seniority: string;
    pillar: string;
    platforms: string[];
  } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genDone, setGenDone] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [briefError, setBriefError] = useState(false);

  // Fetch brief data
  useEffect(() => {
    fetch(`/api/briefs/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Brief not found");
        return r.json();
      })
      .then((data) => {
        // If brief already has assets (status = review/complete), skip to review
        if (data.status === "review" || data.status === "complete") {
          router.push(`/review/${id}`);
          return;
        }
        setBrief({
          campaign: data.campaign_name,
          icp: data.icp,
          seniority: data.seniority,
          pillar: data.pillar || "",
          platforms: data.platforms,
        });
      })
      .catch(() => setBriefError(true));
  }, [id, router]);

  // Trigger generation
  useEffect(() => {
    if (!brief || generating) return;
    setGenerating(true);
    setGenError(null);

    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brief_id: id }),
    })
      .then((r) => {
        if (!r.ok) return r.json().then((d) => { throw new Error(d.error || "Generation failed"); });
        return r.json();
      })
      .then(() => setGenDone(true))
      .catch((err) => {
        console.error("Generation failed:", err);
        setGenError(err.message || "Generation failed");
        setGenerating(false);
      });
  }, [brief, id, generating]);

  function handleComplete() {
    if (genDone) {
      router.push(`/review/${id}`);
    }
    // If gen not done yet, the progress animation finished before the API —
    // we'll redirect once genDone flips to true
  }

  // Redirect when generation completes (in case animation finished first)
  useEffect(() => {
    if (genDone) {
      router.push(`/review/${id}`);
    }
  }, [genDone, id, router]);

  function handleRetry() {
    setGenError(null);
    setGenerating(false);
  }

  const breadcrumb = (
    <nav className="flex items-center gap-1.5 text-[13px] text-[#a1a5ae] pt-6 pb-5">
      <Link href="/" className="hover:text-[#545b6d] transition-colors">Dashboard</Link>
      <ChevronRight size={12} />
      {brief ? (
        <span className="text-[#1f2128] font-medium">{brief.campaign}</span>
      ) : (
        <span className="text-[#1f2128] font-medium">Creating...</span>
      )}
    </nav>
  );

  if (briefError) {
    return (
      <div className="px-6 pb-12 max-w-[1200px]">
        {breadcrumb}
        <div className="text-center py-20">
          <AlertTriangle size={32} className="mx-auto mb-3 text-red-400" />
          <h3 className="text-lg font-semibold text-[#1f2128] mb-2">Brief not found</h3>
          <p className="text-sm text-[#545b6d] mb-4">This campaign may have been deleted.</p>
          <button
            onClick={() => router.push("/")}
            className="text-sm font-medium text-[#7B59FF] hover:underline cursor-pointer"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (genError) {
    return (
      <div className="px-6 pb-12 max-w-[1200px]">
        {breadcrumb}
        <div className="text-center py-20">
          <AlertTriangle size={32} className="mx-auto mb-3 text-amber-400" />
          <h3 className="text-lg font-semibold text-[#1f2128] mb-2">Generation failed</h3>
          <p className="text-sm text-[#545b6d] mb-4 max-w-md mx-auto">{genError}</p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#7B59FF] text-white text-sm font-medium rounded-lg hover:bg-[#6a4be0] cursor-pointer transition-colors"
          >
            <RotateCcw size={14} /> Retry Generation
          </button>
        </div>
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="px-6 pb-12 max-w-[1200px]">
        {breadcrumb}
        <div className="text-center py-20 text-[#a1a5ae]">Loading brief...</div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-12 max-w-[1200px]">
      {breadcrumb}
      <ProgressView brief={brief} briefId={id} onComplete={handleComplete} />
    </div>
  );
}
