"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, X, Loader2, Search } from "lucide-react";
import { Btn } from "@/components/ui/button";
import { AdvocacyCard } from "@/components/advocacy-card";
import { DS, ADVOCACY_STATUS_CONFIG } from "@/lib/constants";
import type { AdvocacyQueueItem, Asset } from "@/lib/supabase";

type FilterTab = "all" | "available" | "claimed" | "rewritten" | "published";

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "available", label: "Available" },
  { id: "claimed", label: "Claimed by Me" },
  { id: "rewritten", label: "Pending Approval" },
  { id: "published", label: "Published" },
];

export default function AdvocacyQueuePage() {
  const [items, setItems] = useState<AdvocacyQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [assetSearch, setAssetSearch] = useState("");

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/advocacy-queue");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setItems(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filtered =
    filter === "all"
      ? items
      : filter === "rewritten"
        ? items.filter((i) => i.status === "rewritten" && i.approval_status === "pending")
        : filter === "claimed"
          ? items.filter((i) => i.status === "claimed")
          : items.filter((i) => i.status === filter);

  const count = (tab: FilterTab) => {
    if (tab === "all") return items.length;
    if (tab === "rewritten") return items.filter((i) => i.status === "rewritten" && i.approval_status === "pending").length;
    if (tab === "claimed") return items.filter((i) => i.status === "claimed").length;
    return items.filter((i) => i.status === tab).length;
  };

  async function handleClaim(id: string) {
    try {
      const res = await fetch(`/api/advocacy-queue/${id}/claim`, { method: "POST" });
      if (res.ok) await fetchItems();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleRewrite(id: string) {
    try {
      const res = await fetch(`/api/advocacy-queue/${id}/rewrite`, { method: "POST" });
      if (res.ok) await fetchItems();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleApprove(id: string) {
    try {
      const res = await fetch(`/api/advocacy-queue/${id}/approve`, { method: "POST" });
      if (res.ok) await fetchItems();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleReject(id: string) {
    try {
      const res = await fetch(`/api/advocacy-queue/${id}/reject`, { method: "POST" });
      if (res.ok) await fetchItems();
    } catch (err) {
      console.error(err);
    }
  }

  async function openAddModal() {
    setShowAddModal(true);
    setLoadingAssets(true);
    try {
      const res = await fetch("/api/asset-library?status=approved");
      if (res.ok) {
        const data = await res.json();
        setAssets(Array.isArray(data) ? data : data.assets || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoadingAssets(false);
  }

  async function handleAddToQueue(asset: Asset) {
    try {
      const res = await fetch("/api/advocacy-queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asset_id: asset.id,
          source_brief_id: asset.brief_id,
          original_headline: asset.headline,
          original_body: asset.body,
          suggested_platforms: [asset.platform],
        }),
      });
      if (res.ok) {
        await fetchItems();
        setShowAddModal(false);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const filteredAssets = assetSearch
    ? assets.filter(
        (a) =>
          a.headline.toLowerCase().includes(assetSearch.toLowerCase()) ||
          a.body.toLowerCase().includes(assetSearch.toLowerCase())
      )
    : assets;

  return (
    <div className="px-8 pb-12 max-w-[1200px] mx-auto pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1f2128]">Advocacy Queue</h1>
          <p className="text-sm text-[#545b6d] mt-1">
            Browse, claim, and rewrite company content for personal sharing.
          </p>
        </div>
        <Btn variant="primary" onClick={openAddModal}>
          <Plus size={15} /> Add to Queue
        </Btn>
      </div>

      {/* Filter tabs */}
      <div className="border-b border-[#e6e7eb] mb-6">
        <nav className="flex items-center gap-1 -mb-px">
          {FILTER_TABS.map((tab) => {
            const c = count(tab.id);
            const sel = filter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`relative px-3 pb-3 pt-1 text-[13px] font-medium transition-colors cursor-pointer ${
                  sel ? "text-[#7B59FF]" : "text-[#545b6d] hover:text-[#1f2128]"
                }`}
              >
                {tab.label}
                <span className={`ml-1 text-[12px] ${sel ? "text-[#7B59FF]" : "text-[#71757e]"}`}>
                  {c}
                </span>
                {sel && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#7B59FF] rounded-t-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20 text-[#71757e]">Loading advocacy queue...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-[#EFEBFF] flex items-center justify-center mx-auto mb-4">
            <Search size={24} color={DS.primary} />
          </div>
          <h3 className="text-lg font-semibold text-[#1f2128] mb-2">
            {filter === "all" ? "No advocacy content yet" : `No ${filter} items`}
          </h3>
          <p className="text-sm text-[#545b6d] mb-6 max-w-sm mx-auto">
            {filter === "all"
              ? "Add approved assets to the advocacy queue for team members to claim and personalize."
              : "Try a different filter to find content."}
          </p>
          {filter === "all" && (
            <Btn variant="primary" onClick={openAddModal}>
              <Plus size={15} /> Add to Queue
            </Btn>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3">
          {filtered.map((item) => (
            <AdvocacyCard
              key={item.id}
              item={item}
              onClaim={() => handleClaim(item.id)}
              onRewrite={() => handleRewrite(item.id)}
              onApprove={() => handleApprove(item.id)}
              onReject={() => handleReject(item.id)}
            />
          ))}
        </div>
      )}

      {/* Add to Queue Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] font-bold text-[#1f2128]">Add to Advocacy Queue</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#a1a5ae] hover:text-[#545b6d] bg-transparent border-0 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-4">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a5ae]" />
                <input
                  value={assetSearch}
                  onChange={(e) => setAssetSearch(e.target.value)}
                  placeholder="Search approved assets..."
                  className="w-full text-[13px] pl-9 pr-3 py-2 rounded-lg border border-[#e6e7eb] bg-white outline-none focus:border-[#7B59FF]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {loadingAssets ? (
                <div className="text-center py-10 text-[#71757e]">
                  <Loader2 size={18} className="animate-spin mx-auto mb-2" />
                  Loading assets...
                </div>
              ) : filteredAssets.length === 0 ? (
                <p className="text-[13px] text-[#71757e] text-center py-6">
                  No approved assets found.
                </p>
              ) : (
                filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border border-[#e6e7eb] hover:border-[#c4c9d4] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[13px] font-semibold text-[#1f2128] truncate">{asset.headline}</h4>
                      <p className="text-[11px] text-[#71757e] truncate">{asset.body}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-medium text-[#7B59FF] bg-[#EFEBFF] rounded px-1.5 py-0.5">
                          {asset.platform}
                        </span>
                        <span className="text-[10px] text-[#71757e] bg-[#f3f4f6] rounded px-1.5 py-0.5">
                          {asset.pillar}
                        </span>
                      </div>
                    </div>
                    <Btn variant="secondary" size="small" onClick={() => handleAddToQueue(asset)}>
                      Add
                    </Btn>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
