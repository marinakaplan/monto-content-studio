"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText } from "lucide-react";
import { TemplateCard } from "@/components/template-card";
import { DS } from "@/lib/constants";
import type { CampaignTemplate } from "@/lib/supabase";

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<CampaignTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/campaign-templates")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setTemplates(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Collect all tags from templates
  const allTags = Array.from(new Set(templates.flatMap((t) => t.tags)));

  const filtered = templates.filter((t) => {
    const matchesSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.description || "").toLowerCase().includes(search.toLowerCase());
    const matchesTag = !selectedTag || t.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  async function handleUseTemplate(templateId: string) {
    try {
      const res = await fetch(`/api/campaign-templates/${templateId}/use`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        if (data.brief_id) {
          router.push(`/create/${data.brief_id}`);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="px-8 pb-12 max-w-[1200px] mx-auto pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1f2128]">Templates</h1>
          <p className="text-sm text-[#545b6d] mt-1">
            Browse and use saved campaign templates to jumpstart your content.
          </p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a5ae]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="text-[13px] pl-9 pr-3 py-2 rounded-lg border border-[#e6e7eb] bg-white outline-none focus:border-[#7B59FF] w-64"
          />
        </div>
      </div>

      {/* Tag filter pills */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 mb-6 flex-wrap">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium border cursor-pointer transition-colors ${
              !selectedTag
                ? "bg-[#EFEBFF] text-[#7B59FF] border-[#7B59FF]"
                : "bg-white text-[#545b6d] border-[#e6e7eb] hover:border-[#c4c9d4]"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium border cursor-pointer transition-colors ${
                selectedTag === tag
                  ? "bg-[#EFEBFF] text-[#7B59FF] border-[#7B59FF]"
                  : "bg-white text-[#545b6d] border-[#e6e7eb] hover:border-[#c4c9d4]"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20 text-[#71757e]">Loading templates...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-[#EFEBFF] flex items-center justify-center mx-auto mb-4">
            <FileText size={24} color={DS.primary} />
          </div>
          <h3 className="text-lg font-semibold text-[#1f2128] mb-2">
            {templates.length === 0 ? "No templates yet" : "No matching templates"}
          </h3>
          <p className="text-sm text-[#545b6d] max-w-sm mx-auto">
            {templates.length === 0
              ? "Save your first campaign as a template from the review page."
              : "Try adjusting your search or filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3">
          {filtered.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onUse={() => handleUseTemplate(template.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
