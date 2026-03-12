"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Eye } from "lucide-react";
import { PlatformPreview } from "@/components/platform-preview";
import { CopyButton } from "@/components/ui/copy-button";
import { Badge } from "@/components/ui/badge";
import type { Asset } from "@/lib/supabase";

const PREVIEW_PLATFORMS = ["linkedin", "instagram", "email", "blog"] as const;

const PLATFORM_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  email: "Email Newsletter",
  blog: "Blog Post",
};

export default function AssetPreviewPage() {
  const params = useParams();
  const assetId = params.assetId as string;

  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAsset() {
      try {
        const res = await fetch(`/api/assets/${assetId}`);
        if (!res.ok) {
          setError("Asset not found");
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (data.error) {
          setError(data.error);
        } else {
          setAsset(data);
        }
      } catch (err) {
        setError("Failed to load asset");
      }
      setLoading(false);
    }
    fetchAsset();
  }, [assetId]);

  if (loading) {
    return (
      <div className="px-8 pb-12 max-w-[1200px] mx-auto pt-6">
        <div className="flex items-center justify-center py-20 text-[#545b6d]">
          <Loader2 size={18} className="animate-spin mr-2" />
          Loading preview...
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="px-8 pb-12 max-w-[1200px] mx-auto pt-6">
        <div className="text-center py-20">
          <h2 className="text-[16px] font-semibold text-[#1f2128] mb-2">Asset not found</h2>
          <p className="text-[13px] text-[#545b6d] mb-4">{error || "The requested asset could not be loaded."}</p>
          <Link href="/" className="text-[13px] text-[#7B59FF] font-medium hover:underline">
            Go home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 pb-12 max-w-[1200px] mx-auto pt-6">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/publish`}
          className="inline-flex items-center gap-1 text-[12px] text-[#7B59FF] font-medium mb-3 no-underline hover:underline"
        >
          <ArrowLeft size={12} /> Back
        </Link>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-[#1f2128]">{asset.headline}</h1>
          <Badge color="#7B59FF" bg="#EDE9FF" icon={Eye}>
            Preview
          </Badge>
        </div>
        <p className="text-sm text-[#545b6d]">
          Platform mockups showing how this content will look when published.
        </p>
      </div>

      {/* 2x2 grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PREVIEW_PLATFORMS.map((platform) => (
          <div key={platform}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[13px] font-semibold text-[#1f2128]">{PLATFORM_LABELS[platform]}</h3>
              <CopyButton text={asset.body} label="Copy text" />
            </div>
            <PlatformPreview
              platform={platform}
              headline={asset.headline}
              body={asset.body}
              hashtags={asset.hashtags}
              illustrationUrl={asset.illustration_url}
              illustrationDesc={asset.illustration_desc}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
