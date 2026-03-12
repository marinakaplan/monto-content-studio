"use client";

import { User, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { Btn } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DS, ADVOCACY_STATUS_CONFIG, APPROVAL_STATUS_CONFIG } from "@/lib/constants";
import type { AdvocacyQueueItem } from "@/lib/supabase";

type AdvocacyCardProps = {
  item: AdvocacyQueueItem & { team_member_name?: string };
  onClaim?: () => void;
  onRewrite?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
};

export function AdvocacyCard({ item, onClaim, onRewrite, onApprove, onReject }: AdvocacyCardProps) {
  const statusCfg = ADVOCACY_STATUS_CONFIG[item.status];
  const approvalCfg = APPROVAL_STATUS_CONFIG[item.approval_status];
  const hasRewrite = item.rewritten_headline || item.rewritten_body;
  const showSideBySide = (item.status === "claimed" || item.status === "rewritten") && hasRewrite;

  return (
    <div
      className="bg-white rounded-xl p-4 transition-all duration-200 ease-out hover:shadow-md"
      style={{
        border: `1px solid ${DS.borderSubtle}`,
        boxShadow: DS.shadowSm,
      }}
    >
      {/* Status row */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <Badge color={statusCfg.color} bg={statusCfg.bg}>
          {statusCfg.label}
        </Badge>
        {item.approval_status !== "pending" && (
          <Badge color={approvalCfg.color} bg={approvalCfg.bg}>
            {approvalCfg.label}
          </Badge>
        )}
        {item.team_member_name && (
          <span className="text-[11px] ml-auto" style={{ color: DS.mutedFg }}>
            {item.team_member_name}
          </span>
        )}
      </div>

      {/* Content: original or side-by-side */}
      {showSideBySide ? (
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div
            className="rounded-lg p-3"
            style={{ background: DS.bg, border: `1px solid ${DS.borderLight}` }}
          >
            <label
              className="block text-[10px] font-semibold uppercase tracking-wide mb-1"
              style={{ color: DS.mutedFg }}
            >
              Original
            </label>
            <h5 className="text-[12px] font-semibold mb-1" style={{ color: DS.fg }}>
              {item.original_headline}
            </h5>
            <p className="text-[11px] line-clamp-3" style={{ color: DS.muted }}>
              {item.original_body}
            </p>
          </div>
          <div
            className="rounded-lg p-3"
            style={{ background: DS.primaryLighter, border: `1px solid ${DS.primary}20` }}
          >
            <label
              className="block text-[10px] font-semibold uppercase tracking-wide mb-1"
              style={{ color: DS.primary }}
            >
              Rewritten
            </label>
            <h5 className="text-[12px] font-semibold mb-1" style={{ color: DS.fg }}>
              {item.rewritten_headline}
            </h5>
            <p className="text-[11px] line-clamp-3" style={{ color: DS.muted }}>
              {item.rewritten_body}
            </p>
          </div>
        </div>
      ) : (
        <div className="mb-3">
          <h4 className="text-[14px] font-semibold mb-1 line-clamp-2" style={{ color: DS.fg }}>
            {item.original_headline}
          </h4>
          <p className="text-[12px] leading-relaxed line-clamp-3" style={{ color: DS.muted }}>
            {item.original_body}
          </p>
        </div>
      )}

      {/* Platform badges */}
      {item.suggested_platforms.length > 0 && (
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          {item.suggested_platforms.map((p) => (
            <span
              key={p}
              className="text-[10px] font-medium rounded px-1.5 py-0.5"
              style={{ color: DS.mutedFg, background: DS.neutralBg }}
            >
              {p}
            </span>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {item.status === "available" && onClaim && (
          <Btn variant="primary" size="small" onClick={onClaim}>
            <User size={12} /> Claim
          </Btn>
        )}
        {item.status === "claimed" && onRewrite && (
          <Btn variant="secondary" size="small" onClick={onRewrite}>
            <RefreshCw size={12} /> Rewrite in my voice
          </Btn>
        )}
        {item.status === "rewritten" && item.approval_status === "pending" && (
          <>
            {onApprove && (
              <Btn variant="successOutline" size="small" onClick={onApprove}>
                <CheckCircle size={12} /> Approve
              </Btn>
            )}
            {onReject && (
              <Btn variant="errorOutline" size="small" onClick={onReject}>
                <XCircle size={12} /> Reject
              </Btn>
            )}
          </>
        )}
      </div>
    </div>
  );
}
