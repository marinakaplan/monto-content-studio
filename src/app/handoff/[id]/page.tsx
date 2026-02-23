import { createServerClient } from "@/lib/supabase";
import { PILLARS, PLATFORMS, TEMPLATES, ICPS, SENIORITY } from "@/lib/constants";
import { notFound } from "next/navigation";

export default async function HandoffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: briefId } = await params;
  const supabase = createServerClient();

  const { data: brief } = await supabase.from("briefs").select("*").eq("id", briefId).single();
  if (!brief) notFound();

  const { data: assets } = await supabase
    .from("assets")
    .select("*")
    .eq("brief_id", briefId)
    .eq("status", "approved");

  let event = null;
  if (brief.event_id) {
    const { data: e } = await supabase.from("events").select("*").eq("id", brief.event_id).single();
    event = e;
  }

  const deadlineDate = event?.date || brief.deadline;
  let deadlineStr = "";
  if (deadlineDate) {
    const d = new Date(deadlineDate);
    deadlineStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div className="min-h-screen bg-[#f4f2ff]">
      {/* Header */}
      <div className="bg-[#1f2128] text-white py-6 px-8">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#beadff] text-xs font-medium tracking-wide uppercase mb-1">
              <span className="w-5 h-5 bg-[#7B59FF] rounded flex items-center justify-center text-white text-[10px] font-bold">M</span>
              Monto Studio — Design Handoff
            </div>
            <h1 className="text-2xl font-bold">{brief.campaign_name}</h1>
          </div>
          <div className="flex items-center gap-6 text-sm">
            {deadlineStr && (
              <div>
                <span className="text-[#71757e] text-xs uppercase tracking-wide block">Deadline</span>
                <span className="font-semibold text-[#FFD93D]">{deadlineStr}</span>
              </div>
            )}
            <div>
              <span className="text-[#71757e] text-xs uppercase tracking-wide block">Assets</span>
              <span className="font-semibold">{assets?.length || 0} approved</span>
            </div>
            <div>
              <span className="text-[#71757e] text-xs uppercase tracking-wide block">Type</span>
              <span className="font-semibold">{brief.brief_type === "manual" ? "Designer Brief" : "AI Generated"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Designer instructions */}
      {brief.designer_instructions && (
        <div className="max-w-[1400px] mx-auto px-8 mt-6">
          <div className="bg-[#EFEBFF] border border-[#7B59FF30] rounded-xl p-5">
            <div className="text-xs font-bold text-[#7B59FF] uppercase tracking-wide mb-2">Designer Instructions</div>
            <p className="text-[#1f2128] text-sm leading-relaxed whitespace-pre-line">{brief.designer_instructions}</p>
            {brief.overlay_title && (
              <div className="mt-3 pt-3 border-t border-[#7B59FF20]">
                <span className="text-xs text-[#545b6d]">Overlay Title: </span>
                <span className="text-sm font-semibold text-[#1f2128]">{brief.overlay_title}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Asset cards */}
      <div className="max-w-[1400px] mx-auto px-8 py-8 space-y-8">
        {(assets || []).map((asset, i) => {
          const pillar = PILLARS.find((p) => p.id === asset.pillar);
          const platform = PLATFORMS.find((p) => p.id === asset.platform);
          const tpl = TEMPLATES.find((t) => t.id === asset.template);
          const icp = ICPS.find((ic) => ic.id === brief.icp);
          const sen = SENIORITY.find((s) => s.id === brief.seniority);
          const [w, h] = (platform?.imageSize || "1200x675").split("x");

          return (
            <div key={asset.id} className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
              {/* Card header */}
              <div className="bg-[#7B59FF] px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-white font-bold text-sm">Asset {i + 1}</span>
                  <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                    {pillar?.label || asset.pillar}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-white/80 text-xs">
                  <span>{platform?.label} ({w}x{h})</span>
                  <span>{tpl?.label} template</span>
                </div>
              </div>

              {/* Card body — illustration + brief side by side */}
              <div className="flex flex-col lg:flex-row">
                {/* Left: Illustration */}
                <div className="lg:w-[55%] p-6 flex items-center justify-center bg-[#fafafa] border-b lg:border-b-0 lg:border-r border-[#e6e7eb] min-h-[300px]">
                  {asset.illustration_url ? (
                    <img
                      src={asset.illustration_url}
                      alt={asset.headline}
                      className="max-w-full max-h-[500px] rounded-lg object-contain"
                    />
                  ) : (
                    <div className="text-[#c4c9d4] text-sm">No illustration</div>
                  )}
                </div>

                {/* Right: Design Brief */}
                <div className="lg:w-[45%] p-6 space-y-5">
                  {/* Headline */}
                  <div>
                    <div className="text-[10px] font-bold text-[#7B59FF] uppercase tracking-wider mb-1">Headline</div>
                    <div className="text-lg font-bold text-[#1f2128] leading-snug">{asset.headline}</div>
                  </div>

                  {/* Body copy */}
                  {asset.body && (
                    <div>
                      <div className="text-[10px] font-bold text-[#7B59FF] uppercase tracking-wider mb-1">Body Copy</div>
                      <div className="text-sm text-[#545b6d] leading-relaxed whitespace-pre-line">{asset.body}</div>
                    </div>
                  )}

                  {/* Hashtags */}
                  {asset.hashtags?.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-[#7B59FF] uppercase tracking-wider mb-1">Hashtags</div>
                      <div className="flex flex-wrap gap-1.5">
                        {asset.hashtags.map((tag: string) => (
                          <span key={tag} className="bg-[#EFEBFF] text-[#7B59FF] text-xs px-2 py-0.5 rounded-full font-medium">{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Illustration brief */}
                  {asset.illustration_desc && (
                    <div>
                      <div className="text-[10px] font-bold text-[#7B59FF] uppercase tracking-wider mb-1">Illustration Brief</div>
                      <div className="text-xs text-[#71757e] leading-relaxed bg-[#f8f9fb] rounded-lg p-3">{asset.illustration_desc}</div>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-[#e6e7eb] pt-4">
                    <div className="text-[10px] font-bold text-[#7B59FF] uppercase tracking-wider mb-2">Design Direction</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[#71757e]">Platform: </span>
                        <span className="text-[#1f2128] font-medium">{platform?.label} ({w}x{h})</span>
                      </div>
                      <div>
                        <span className="text-[#71757e]">Template: </span>
                        <span className="text-[#1f2128] font-medium">{tpl?.label}</span>
                      </div>
                      <div>
                        <span className="text-[#71757e]">Audience: </span>
                        <span className="text-[#1f2128] font-medium">{icp?.label}</span>
                      </div>
                      <div>
                        <span className="text-[#71757e]">Seniority: </span>
                        <span className="text-[#1f2128] font-medium">{sen?.label}</span>
                      </div>
                      <div>
                        <span className="text-[#71757e]">Font: </span>
                        <span className="text-[#1f2128] font-medium">DM Sans</span>
                      </div>
                      <div>
                        <span className="text-[#71757e]">Export: </span>
                        <span className="text-[#1f2128] font-medium">{w}x{h}px</span>
                      </div>
                    </div>

                    {/* Brand colors */}
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-[#71757e]">Brand:</span>
                      <div className="flex gap-1.5">
                        <div className="w-5 h-5 rounded bg-[#7B59FF]" title="#7B59FF Primary" />
                        <div className="w-5 h-5 rounded bg-[#1f2128]" title="#1F2128 Dark" />
                        <div className="w-5 h-5 rounded bg-[#FFD93D]" title="#FFD93D Accent" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-xs text-[#71757e]">
        Generated by Monto Content Studio
      </div>
    </div>
  );
}
