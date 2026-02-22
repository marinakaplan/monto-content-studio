"use client";

import { useState } from "react";
import { X, Cpu, Clock, MessageSquare, FileText } from "lucide-react";
import { Btn } from "./ui/button";
import { Badge } from "./ui/badge";
import { DS } from "@/lib/constants";
import type { GenerationLog } from "@/lib/supabase";

type GenerationLogModalProps = {
  logs: GenerationLog[];
  onClose: () => void;
};

export function GenerationLogModal({ logs, onClose }: GenerationLogModalProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [tab, setTab] = useState<"response" | "prompt">("response");

  const log = logs[selectedIndex];
  if (!log) return null;

  const tokens = log.tokens_used || {};
  const totalTokens = (tokens.input_tokens || 0) + (tokens.output_tokens || 0);
  const durationSec = log.duration_ms ? (log.duration_ms / 1000).toFixed(1) : "—";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Side panel */}
      <div className="fixed top-0 right-0 h-full w-[560px] max-w-[90vw] bg-white border-l border-[#e6e7eb] z-50 flex flex-col shadow-xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#e6e7eb] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EFEBFF] flex items-center justify-center">
              <Cpu size={15} color={DS.primary} />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-[#1f2128]">Generation Log</h3>
              <p className="text-[13px] text-[#a1a5ae]">
                {new Date(log.created_at).toLocaleString()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md hover:bg-[#f8f9fb] flex items-center justify-center cursor-pointer transition-colors"
          >
            <X size={16} color={DS.muted} />
          </button>
        </div>

        {/* Log selector (if multiple) */}
        {logs.length > 1 && (
          <div className="px-5 py-2 border-b border-[#e6e7eb] flex gap-1.5 shrink-0">
            {logs.map((l, i) => (
              <Btn
                key={l.id}
                variant={i === selectedIndex ? "secondary" : "neutral"}
                size="small"
                onClick={() => setSelectedIndex(i)}
                className="text-[13px]"
              >
                Run {logs.length - i}
              </Btn>
            ))}
          </div>
        )}

        {/* Meta stats */}
        <div className="px-5 py-3 border-b border-[#e6e7eb] flex gap-4 shrink-0">
          <div className="flex items-center gap-1.5">
            <Cpu size={12} color={DS.mutedFg} />
            <span className="text-[13px] text-[#545b6d] font-medium">{log.model}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageSquare size={12} color={DS.mutedFg} />
            <span className="text-[13px] text-[#545b6d]">
              {tokens.input_tokens?.toLocaleString() || "—"} in / {tokens.output_tokens?.toLocaleString() || "—"} out
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={12} color={DS.mutedFg} />
            <span className="text-[13px] text-[#545b6d]">{durationSec}s</span>
          </div>
          {totalTokens > 0 && (
            <Badge color={DS.primary} bg={DS.primaryLighter} className="text-xs !py-0.5 !px-2">
              {totalTokens.toLocaleString()} tokens
            </Badge>
          )}
        </div>

        {/* Tab toggle */}
        <div className="px-5 py-2 border-b border-[#e6e7eb] flex gap-0 shrink-0">
          <button
            onClick={() => setTab("response")}
            className={`px-3 py-1.5 text-[13px] font-medium rounded-l-md border transition-all cursor-pointer ${
              tab === "response"
                ? "bg-white text-[#1f2128] border-[#c4c9d4] shadow-sm"
                : "bg-[#f8f9fb] text-[#545b6d] border-[#e6e7eb]"
            }`}
          >
            <FileText size={11} className="inline mr-1" />
            Response
          </button>
          <button
            onClick={() => setTab("prompt")}
            className={`px-3 py-1.5 text-[13px] font-medium rounded-r-md border-t border-r border-b transition-all cursor-pointer ${
              tab === "prompt"
                ? "bg-white text-[#1f2128] border-[#c4c9d4] shadow-sm"
                : "bg-[#f8f9fb] text-[#545b6d] border-[#e6e7eb]"
            }`}
          >
            <MessageSquare size={11} className="inline mr-1" />
            Prompt
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-5">
          <pre className="text-[13px] text-[#1f2128] font-mono leading-relaxed whitespace-pre-wrap break-words">
            {tab === "response" ? log.response_received : log.prompt_sent}
          </pre>
        </div>
      </div>
    </>
  );
}
