"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Image, FolderSearch } from "lucide-react";
import { Btn } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DS, PILLARS, PLATFORMS } from "@/lib/constants";
import type { Asset } from "@/lib/supabase";

export default function AssetLibraryPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState("");
  const [pillarFilter, setPillarFilter] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchAssets = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (platformFilter) params.set("platform", platformFilter);
      if (pillarFilter) params.set("pillar", pillarFilter);
      params.set("page", String(pageNum));
      params.set("limit", "20");

      const res = await fetch(`/api/asset-library?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const newAssets = Array.isArray(data) ? data : data.assets || [];
        const more = Array.isArray(data) ? newAssets.length === 20 : !!data.has_more;
        if (append) {
          setAssets((prev) => [...prev, ...newAssets]);
        } else {
          setAssets(newAssets);
        }
        setHasMore(more);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
    setLoadingMore(false);
  }, [search, platformFilter, pillarFilter]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchAssets(1, false);
  }, [fetchAssets]);

  function handleLoadMore() {
    const next = page + 1;
    setPage(next);
    setLoadingMore(true);
    fetchAssets(next, true);
  }

  function getPillarColor(pillarId: string) {
    const p = PILLARS.find((pl) => pl.id === pillarId);
    return p ? { color: p.color, bg: `${p.color}15` } : { color: DS.muted, bg: DS.neutralBg };
  }

  return (
    <div className="px-8 pb-12 max-w-[1200px] mx-auto pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1f2128]">Asset Library</h1>
          <p className="text-sm text-[#545b6d] mt-1">
            Search and browse all approved marketing assets.
          </p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a5ae]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets..."
            className="text-[13px] pl-9 pr-3 py-2 rounded-lg border border-[#e6e7eb] bg-white outline-none focus:border-[#7B59FF] w-64"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="text-[13px] px-3 py-2 rounded-lg border border-[#e6e7eb] bg-white outline-none focus:border-[#7B59FF]"
        >
          <option value="">All Platforms</option>
          {PLATFORMS.map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>

        <select
          value={pillarFilter}
          onChange={(e) => setPillarFilter(e.target.value)}
          className="text-[13px] px-3 py-2 rounded-lg border border-[#e6e7eb] bg-white outline-none focus:border-[#7B59FF]"
        >
          <option value="">All Pillars</option>
          {PILLARS.map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20 text-[#71757e]">Loading assets...</div>
      ) : assets.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-[#EFEBFF] flex items-center justify-center mx-auto mb-4">
            <FolderSearch size={24} color={DS.primary} />
          </div>
          <h3 className="text-lg font-semibold text-[#1f2128] mb-2">No assets found</h3>
          <p className="text-sm text-[#545b6d] max-w-sm mx-auto">
            {search || platformFilter || pillarFilter
              ? "Try adjusting your search or filters."
              : "Approved campaign assets will appear here."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
            {assets.map((asset) => {
              const pc = getPillarColor(asset.pillar);
              const platform = PLATFORMS.find((p) => p.id === asset.platform);
              return (
                <div
                  key={asset.id}
                  onClick={() => router.push(`/library/${asset.id}`)}
                  className="bg-white border border-[#e6e7eb] rounded-lg overflow-hidden hover:border-[#c4c9d4] hover:shadow-sm transition-all cursor-pointer group"
                >
                  {/* Image placeholder */}
                  <div className="h-40 bg-[#f3f4f6] flex items-center justify-center relative">
                    {asset.illustration_url ? (
                      <img
                        src={asset.illustration_url}
                        alt={asset.headline}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image size={32} className="text-[#c4c9d4]" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h4 className="text-[13px] font-semibold text-[#1f2128] mb-1 line-clamp-2 group-hover:text-[#7B59FF] transition-colors">
                      {asset.headline}
                    </h4>

                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {platform && (
                        <Badge color={DS.info} bg={DS.infoBg}>
                          {platform.label}
                        </Badge>
                      )}
                      <Badge color={pc.color} bg={pc.bg}>
                        {PILLARS.find((p) => p.id === asset.pillar)?.label || asset.pillar}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="text-center mt-8">
              <Btn variant="tertiary" onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? "Loading..." : "Load More"}
              </Btn>
            </div>
          )}
        </>
      )}
    </div>
  );
}
