"use client";

import { useState } from "react";
import { Mic, Plus, X, Sparkles, RefreshCw, BookOpen, CheckCircle2 } from "lucide-react";
import { DS, VOICE_TONE_OPTIONS } from "@/lib/constants";
import { Btn } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { VoiceProfile } from "@/lib/supabase";

type VoiceCalibrationProps = {
  teamMemberId: string;
  voiceProfile?: VoiceProfile | null;
  onCalibrated?: () => void;
};

export function VoiceCalibration({
  teamMemberId,
  voiceProfile,
  onCalibrated,
}: VoiceCalibrationProps) {
  const [samples, setSamples] = useState<string[]>(voiceProfile?.voice_samples ?? []);
  const [sampleInput, setSampleInput] = useState("");
  const [selectedTones, setSelectedTones] = useState<string[]>(
    voiceProfile?.tone_keywords ?? []
  );
  const [calibrating, setCalibrating] = useState(false);
  const [calibrationResult, setCalibrationResult] = useState<{
    writing_rules: string | null;
    calibration_prompt: string | null;
  } | null>(
    voiceProfile?.writing_rules || voiceProfile?.calibration_prompt
      ? {
          writing_rules: voiceProfile?.writing_rules ?? null,
          calibration_prompt: voiceProfile?.calibration_prompt ?? null,
        }
      : null
  );
  const [error, setError] = useState<string | null>(null);

  // Test section state
  const [testInput, setTestInput] = useState("");
  const [rewrittenOutput, setRewrittenOutput] = useState<string | null>(null);
  const [rewriting, setRewriting] = useState(false);

  const profileId = voiceProfile?.id ?? teamMemberId;

  const handleAddSample = () => {
    const trimmed = sampleInput.trim();
    if (!trimmed) return;
    setSamples((prev) => [...prev, trimmed]);
    setSampleInput("");
  };

  const handleRemoveSample = (idx: number) => {
    setSamples((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleTone = (tone: string) => {
    setSelectedTones((prev) =>
      prev.includes(tone) ? prev.filter((t) => t !== tone) : [...prev, tone]
    );
  };

  const handleCalibrate = async () => {
    setError(null);
    setCalibrating(true);
    try {
      // Step 1: Save samples + keywords
      const saveRes = await fetch(`/api/voice-profiles/${profileId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voice_samples: samples,
          tone_keywords: selectedTones,
        }),
      });
      if (!saveRes.ok) throw new Error("Failed to save voice profile");

      // Step 2: Calibrate
      const calRes = await fetch(`/api/voice-profiles/${profileId}/calibrate`, {
        method: "POST",
      });
      if (!calRes.ok) throw new Error("Calibration failed");

      const result = await calRes.json();
      setCalibrationResult({
        writing_rules: result.writing_rules ?? null,
        calibration_prompt: result.calibration_prompt ?? null,
      });
      onCalibrated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setCalibrating(false);
    }
  };

  const handleRewrite = async () => {
    if (!testInput.trim()) return;
    setRewriting(true);
    setRewrittenOutput(null);
    try {
      const res = await fetch(`/api/voice-profiles/${profileId}/rewrite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: testInput.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setRewrittenOutput(data.rewritten ?? data.text ?? "");
      }
    } catch {
      // silently fail
    } finally {
      setRewriting(false);
    }
  };

  return (
    <div className="bg-white border rounded-lg p-5 space-y-6" style={{ borderColor: DS.borderLight }}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Mic size={18} style={{ color: DS.primary }} />
        <h3 className="text-[15px] font-bold" style={{ color: DS.fg }}>
          Voice Calibration
        </h3>
        {calibrationResult && (
          <Badge color={DS.success} bg={DS.successBg} icon={CheckCircle2}>
            Calibrated
          </Badge>
        )}
      </div>

      {/* Writing Samples */}
      <div>
        <label className="block text-[12px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: DS.muted }}>
          Writing Samples
        </label>
        <p className="text-[12px] mb-2" style={{ color: DS.mutedFg }}>
          Paste at least 3 samples of your writing for best results.
        </p>
        <div className="flex items-start gap-2 mb-2">
          <textarea
            value={sampleInput}
            onChange={(e) => setSampleInput(e.target.value)}
            placeholder="Paste a writing sample here..."
            rows={3}
            className="flex-1 text-[13px] px-3 py-2 rounded-lg outline-none resize-y"
            style={{
              border: `1px solid ${DS.borderLight}`,
              color: DS.fg,
            }}
          />
        </div>
        <Btn variant="tertiary" size="small" onClick={handleAddSample} disabled={!sampleInput.trim()}>
          <Plus size={13} /> Add Sample
        </Btn>

        {/* Sample chips */}
        {samples.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {samples.map((sample, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] max-w-[300px]"
                style={{
                  background: DS.bg,
                  border: `1px solid ${DS.borderLight}`,
                  color: DS.muted,
                }}
              >
                <BookOpen size={11} style={{ color: DS.mutedFg, flexShrink: 0 }} />
                <span className="truncate">{sample}</span>
                <button
                  onClick={() => handleRemoveSample(idx)}
                  className="ml-1 cursor-pointer hover:opacity-70 shrink-0 bg-transparent border-0"
                  style={{ color: DS.mutedFg }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-[11px] mt-1.5" style={{ color: DS.mutedFg }}>
          {samples.length} sample{samples.length !== 1 ? "s" : ""} added
          {samples.length < 3 ? ` (${3 - samples.length} more recommended)` : ""}
        </p>
      </div>

      {/* Tone Keywords */}
      <div>
        <label className="block text-[12px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: DS.muted }}>
          Tone Keywords
        </label>
        <p className="text-[12px] mb-2" style={{ color: DS.mutedFg }}>
          Select keywords that describe your writing voice.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {VOICE_TONE_OPTIONS.map((tone) => {
            const isSelected = selectedTones.includes(tone);
            return (
              <button
                key={tone}
                onClick={() => toggleTone(tone)}
                className="px-3 py-1.5 rounded-full text-[12px] font-medium cursor-pointer transition-all duration-150"
                style={{
                  background: isSelected ? DS.primaryLighter : DS.bg,
                  color: isSelected ? DS.primary : DS.muted,
                  border: `1px solid ${isSelected ? DS.primary : DS.borderLight}`,
                }}
              >
                {tone}
              </button>
            );
          })}
        </div>
      </div>

      {/* Calibrate Button */}
      <div>
        <Btn
          onClick={handleCalibrate}
          disabled={calibrating || samples.length === 0}
        >
          {calibrating ? (
            <>
              <RefreshCw size={14} className="animate-spin" /> Analyzing your writing style...
            </>
          ) : (
            <>
              <Sparkles size={14} /> Calibrate Voice
            </>
          )}
        </Btn>
        {error && (
          <p className="text-[12px] mt-2" style={{ color: DS.error }}>
            {error}
          </p>
        )}
      </div>

      {/* Calibration Results */}
      {calibrationResult && (
        <div
          className="rounded-lg p-4 space-y-3"
          style={{ background: DS.bg, border: `1px solid ${DS.borderLight}` }}
        >
          <h4 className="text-[13px] font-semibold" style={{ color: DS.fg }}>
            Calibration Results
          </h4>
          {calibrationResult.writing_rules && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: DS.mutedFg }}>
                Writing Rules
              </label>
              <div
                className="text-[13px] whitespace-pre-wrap rounded-md p-3"
                style={{
                  background: DS.white,
                  border: `1px solid ${DS.borderLight}`,
                  color: DS.muted,
                }}
              >
                {calibrationResult.writing_rules}
              </div>
            </div>
          )}
          {calibrationResult.calibration_prompt && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: DS.mutedFg }}>
                Calibration Prompt
              </label>
              <div
                className="text-[12px] whitespace-pre-wrap rounded-md p-3 font-mono"
                style={{
                  background: DS.white,
                  border: `1px solid ${DS.borderLight}`,
                  color: DS.muted,
                }}
              >
                {calibrationResult.calibration_prompt}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Test It Section */}
      {calibrationResult && (
        <div>
          <h4 className="text-[14px] font-semibold mb-2" style={{ color: DS.fg }}>
            Test It
          </h4>
          <textarea
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="Paste any text to rewrite in your voice..."
            rows={3}
            className="w-full text-[13px] px-3 py-2 rounded-lg outline-none resize-y mb-2"
            style={{
              border: `1px solid ${DS.borderLight}`,
              color: DS.fg,
            }}
          />
          <Btn
            variant="secondary"
            size="small"
            onClick={handleRewrite}
            disabled={rewriting || !testInput.trim()}
          >
            {rewriting ? (
              <>
                <RefreshCw size={13} className="animate-spin" /> Rewriting...
              </>
            ) : (
              "Rewrite in my voice"
            )}
          </Btn>

          {/* Before / After preview */}
          {rewrittenOutput !== null && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label
                  className="block text-[11px] font-semibold uppercase tracking-wide mb-1"
                  style={{ color: DS.mutedFg }}
                >
                  Original
                </label>
                <div
                  className="text-[13px] p-3 rounded-lg whitespace-pre-wrap"
                  style={{
                    background: DS.bg,
                    border: `1px solid ${DS.borderLight}`,
                    color: DS.muted,
                  }}
                >
                  {testInput}
                </div>
              </div>
              <div>
                <label
                  className="block text-[11px] font-semibold uppercase tracking-wide mb-1"
                  style={{ color: DS.primary }}
                >
                  Rewritten
                </label>
                <div
                  className="text-[13px] p-3 rounded-lg whitespace-pre-wrap"
                  style={{
                    background: DS.primaryLighter,
                    border: `1px solid ${DS.primary}25`,
                    color: DS.fg,
                  }}
                >
                  {rewrittenOutput}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
