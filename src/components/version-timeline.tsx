"use client";

import { useState, useEffect, useCallback } from "react";
import { History, RotateCcw } from "lucide-react";
import { DS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Btn } from "@/components/ui/button";
import type { AssetVersion } from "@/lib/supabase";

type VersionTimelineProps = {
  assetId: string;
  onRollback?: (versionId: string) => void;
};

const CHANGE_TYPE_CONFIG: Record<
  AssetVersion["change_type"],
  { label: string; color: string; bg: string }
> = {
  created: { label: "Created", color: DS.info, bg: DS.infoBg },
  edited: { label: "Edited", color: DS.warning, bg: DS.warningBg },
  regenerated: { label: "Regenerated", color: DS.primary, bg: DS.primaryLighter },
  rewritten: { label: "Rewritten", color: DS.processing, bg: DS.processingBg },
  rolled_back: { label: "Rolled Back", color: DS.error, bg: DS.errorBg },
};

function formatTimestamp(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function VersionTimeline({ assetId, onRollback }: VersionTimelineProps) {
  const [versions, setVersions] = useState<AssetVersion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVersions = useCallback(async () => {
    try {
      const res = await fetch(`/api/asset-versions?asset_id=${assetId}`);
      if (res.ok) {
        const data: AssetVersion[] = await res.json();
        data.sort((a, b) => b.version_number - a.version_number);
        setVersions(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const maxVersion =
    versions.length > 0 ? Math.max(...versions.map((v) => v.version_number)) : 0;

  if (loading) {
    return (
      <p className="text-[13px] py-4" style={{ color: DS.mutedFg }}>
        Loading version history...
      </p>
    );
  }

  if (versions.length === 0) {
    return (
      <p className="text-[13px] text-center py-6" style={{ color: DS.mutedFg }}>
        No version history available.
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <History size={16} style={{ color: DS.muted }} />
        <h3 className="text-[14px] font-semibold" style={{ color: DS.fg }}>
          Version History
        </h3>
        <span
          className="text-[12px] font-medium px-1.5 py-0.5 rounded"
          style={{ color: DS.mutedFg, background: DS.bg }}
        >
          {versions.length}
        </span>
      </div>

      <div className="relative">
        {versions.map((version, idx) => {
          const isCurrent = version.version_number === maxVersion;
          const isLast = idx === versions.length - 1;
          const config = CHANGE_TYPE_CONFIG[version.change_type];

          return (
            <div key={version.id} className="flex gap-3 relative group">
              {/* Timeline dot and line */}
              <div className="flex flex-col items-center">
                <div
                  className="w-3 h-3 rounded-full shrink-0 mt-1 z-10"
                  style={{
                    background: isCurrent ? DS.success : DS.border,
                    border: isCurrent ? `2px solid ${DS.successBg}` : "none",
                    boxShadow: isCurrent ? `0 0 0 3px ${DS.success}30` : "none",
                  }}
                />
                {!isLast && (
                  <div
                    className="w-px flex-1 min-h-[24px]"
                    style={{ background: DS.borderLight }}
                  />
                )}
              </div>

              {/* Content */}
              <div className="pb-5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[13px] font-semibold" style={{ color: DS.fg }}>
                    v{version.version_number}
                  </span>
                  <Badge color={config.color} bg={config.bg}>
                    {config.label}
                  </Badge>
                  {isCurrent && (
                    <Badge color={DS.success} bg={DS.successBg}>
                      Current
                    </Badge>
                  )}
                </div>

                <p className="text-[12px] mb-1" style={{ color: DS.mutedFg }}>
                  {formatTimestamp(version.created_at)}
                </p>

                {version.change_summary && (
                  <p className="text-[13px] mb-2" style={{ color: DS.muted }}>
                    {version.change_summary}
                  </p>
                )}

                {!isCurrent && onRollback && (
                  <Btn
                    variant="tertiary"
                    size="small"
                    onClick={() => onRollback(version.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <RotateCcw size={13} /> Roll back to this version
                  </Btn>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
