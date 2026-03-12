"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  ThumbsUp, ThumbsDown, RefreshCw, MessageCircle, Copy, Download,
  MoreVertical, CheckCircle, Clock, AlertCircle, Image, Sparkles,
  Repeat2, Languages, Pencil, X, Save,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { PILLARS, PLATFORMS, DS } from "@/lib/constants";

export type AssetData = {
  id: string;
  template: string;
  pillar: string;
  platform: string;
  icp: string;
  seniority: string;
  status: "pending" | "approved" | "rejected";
  headline: string;
  body: string;
  illustrationDesc: string;
  illustrationUrl: string | null;
  hashtags: string[];
  notes: string[];
};

type AssetCardProps = {
  asset: AssetData;
  onAction: (id: string, action: string, data?: string) => void;
};

const statusConfig = {
  pending: { bg: DS.warningBg, color: DS.warning, label: "Pending", icon: Clock },
  approved: { bg: DS.successBg, color: DS.success, label: "Approved", icon: CheckCircle },
  rejected: { bg: DS.errorBg, color: DS.error, label: "Rejected", icon: AlertCircle },
} as const;

function FigmaIcon({ size = 14 }: { size?: number }) {
  return (
    <img src="/figma.svg" alt="Figma" width={size} height={size} className="inline-block" />
  );
}

const INPUT_STYLE =
  "w-full rounded-lg bg-white text-[#1f2128] outline-none transition-shadow shadow-[inset_0_0_0_1px_#e6e7eb] focus:shadow-[inset_0_0_0_1.5px_#7B59FF,0_0_0_3px_rgba(123,89,255,0.12)]";

export function AssetCard({ asset, onAction }: AssetCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Inline editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editHeadline, setEditHeadline] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editHashtags, setEditHashtags] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState("");
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const pil = PILLARS.find((p) => p.id === asset.pillar);
  const plat = PLATFORMS.find((p) => p.id === asset.platform);
  const st = statusConfig[asset.status];
  const StatusIcon = st.icon;

  // Auto-resize textarea
  const autoResize = useCallback(() => {
    const ta = bodyRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = ta.scrollHeight + "px";
    }
  }, []);

  useEffect(() => {
    if (isEditing) autoResize();
  }, [isEditing, editBody, autoResize]);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  function enterEditMode() {
    setEditHeadline(asset.headline);
    setEditBody(asset.body);
    setEditHashtags([...asset.hashtags]);
    setNewHashtag("");
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
  }

  function saveEdit() {
    onAction(
      asset.id,
      "edit",
      JSON.stringify({ headline: editHeadline, body: editBody, hashtags: editHashtags })
    );
    setIsEditing(false);
  }

  function removeHashtag(index: number) {
    setEditHashtags((prev) => prev.filter((_, i) => i !== index));
  }

  function addHashtag() {
    const tag = newHashtag.trim();
    if (!tag) return;
    const formatted = tag.startsWith("#") ? tag : `#${tag}`;
    setEditHashtags((prev) => [...prev, formatted]);
    setNewHashtag("");
  }

  const addNote = () => {
    if (noteText.trim()) {
      onAction(asset.id, "note", noteText);
      setNoteText("");
    }
  };

  const handleCopy = () => {
    const text = `${asset.headline}\n\n${asset.body}\n\n${asset.hashtags.join(" ")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setMenuOpen(false);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!asset.illustrationUrl) return;
    const link = document.createElement("a");
    link.href = asset.illustrationUrl;
    link.download = `${asset.headline.replace(/[^a-zA-Z0-9]/g, "-").slice(0, 40)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMenuOpen(false);
  };

  return (
    <div
      className="bg-white rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md"
      style={{
        border: `1px solid ${isEditing ? "#7B59FF40" : asset.status === "approved" ? DS.success + "40" : "#e6e7eb"}`,
      }}
    >
      {/* Image Preview — LinkedIn 16:9 proportion */}
      <div className="relative aspect-[1200/675] bg-[#f8f9fb] overflow-hidden">
        {asset.illustrationUrl ? (
          <img
            src={asset.illustrationUrl}
            alt={asset.illustrationDesc}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center px-6">
              <Image size={28} className="mx-auto mb-2 text-[#c4c9d4]" />
              <p className="text-xs text-[#a1a5ae] leading-relaxed max-w-[240px]">
                {asset.illustrationDesc}
              </p>
            </div>
          </div>
        )}

        {/* Floating badges on image */}
        <div className="absolute top-3 left-3">
          <Badge
            color={pil?.color}
            bg="rgba(255,255,255,0.92)"
            className="text-xs !py-0.5 !px-2.5 backdrop-blur-sm shadow-sm"
          >
            {pil?.label}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge
            color={st.color}
            bg={st.bg}
            icon={StatusIcon}
            className="text-xs !py-0.5 !px-2.5 shadow-sm"
          >
            {st.label}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Platform + edit button + kebab menu */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-[#a1a5ae] uppercase tracking-wide">
            {plat?.label}
          </span>

          <div className="flex items-center gap-1">
            {/* Edit toggle button */}
            {!isEditing && (
              <button
                onClick={enterEditMode}
                title="Edit content"
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#EFEBFF] cursor-pointer transition-colors"
              >
                <Pencil size={14} className="text-[#7B59FF]" />
              </button>
            )}

            {/* Kebab menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#f0f1f3] cursor-pointer transition-colors"
              >
                <MoreVertical size={15} className="text-[#a1a5ae]" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-[#e6e7eb] py-1.5 z-20">
                  <button
                    onClick={handleCopy}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#545b6d] hover:bg-[#f8f9fb] cursor-pointer transition-colors"
                  >
                    <Copy size={13} /> Copy text
                  </button>
                  {asset.illustrationUrl && (
                    <button
                      onClick={handleDownload}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#545b6d] hover:bg-[#f8f9fb] cursor-pointer transition-colors"
                    >
                      <Download size={13} /> Download image
                    </button>
                  )}
                  <div className="h-px bg-[#e6e7eb] my-1" />
                  <button
                    onClick={() => { onAction(asset.id, "regenerate"); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#545b6d] hover:bg-[#f8f9fb] cursor-pointer transition-colors"
                  >
                    <RefreshCw size={13} /> Regenerate
                  </button>
                  <button
                    onClick={() => { onAction(asset.id, "regenerate-image"); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#545b6d] hover:bg-[#f8f9fb] cursor-pointer transition-colors"
                  >
                    <Sparkles size={13} /> New image
                  </button>
                  <div className="h-px bg-[#e6e7eb] my-1" />
                  <button
                    onClick={() => { setShowNotes(!showNotes); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#545b6d] hover:bg-[#f8f9fb] cursor-pointer transition-colors"
                  >
                    <MessageCircle size={13} /> {showNotes ? "Hide notes" : "Add note"}
                    {asset.notes.length > 0 && (
                      <span className="ml-auto text-xs text-[#a1a5ae]">{asset.notes.length}</span>
                    )}
                  </button>
                  <button
                    onClick={() => { onAction(asset.id, "push-figma"); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#545b6d] hover:bg-[#f8f9fb] cursor-pointer transition-colors"
                  >
                    <FigmaIcon size={13} /> Push to Figma
                  </button>
                  <div className="h-px bg-[#e6e7eb] my-1" />
                  {asset.status === "approved" && (
                    <button
                      onClick={() => { onAction(asset.id, "add-to-queue"); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#545b6d] hover:bg-[#f8f9fb] cursor-pointer transition-colors"
                    >
                      <RefreshCw size={13} /> Add to Advocacy Queue
                    </button>
                  )}
                  <button
                    onClick={() => { onAction(asset.id, "save-template"); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#545b6d] hover:bg-[#f8f9fb] cursor-pointer transition-colors"
                  >
                    <Copy size={13} /> Save as Template
                  </button>
                  <button
                    onClick={() => { onAction(asset.id, "repurpose"); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#545b6d] hover:bg-[#f8f9fb] cursor-pointer transition-colors"
                  >
                    <Repeat2 size={13} /> Repurpose for All Platforms
                  </button>
                  <button
                    onClick={() => { onAction(asset.id, "translate"); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#545b6d] hover:bg-[#f8f9fb] cursor-pointer transition-colors"
                  >
                    <Languages size={13} /> Translate
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Headline */}
        {isEditing ? (
          <input
            type="text"
            value={editHeadline}
            onChange={(e) => setEditHeadline(e.target.value)}
            className={`${INPUT_STYLE} text-base font-bold mb-2 leading-snug px-3 py-1.5`}
          />
        ) : (
          <h4 className="text-base font-bold text-[#1f2128] mb-2 leading-snug">
            {asset.headline}
          </h4>
        )}

        {/* Body */}
        {isEditing ? (
          <div className="mb-4">
            <textarea
              ref={bodyRef}
              value={editBody}
              onChange={(e) => {
                setEditBody(e.target.value);
                autoResize();
              }}
              className={`${INPUT_STYLE} text-[13px] text-[#545b6d] leading-relaxed px-3 py-2 resize-none min-h-[80px]`}
              rows={4}
            />
            <div className="text-[11px] text-[#a1a5ae] mt-1 text-right">
              {editBody.length} / 3000 chars
            </div>
          </div>
        ) : (
          <div className="text-[13px] text-[#545b6d] leading-relaxed whitespace-pre-line mb-4 max-h-[160px] overflow-hidden relative">
            {asset.body}
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
          </div>
        )}

        {/* Hashtags */}
        {isEditing ? (
          <div className="mb-4">
            <div className="flex gap-1.5 flex-wrap mb-2">
              {editHashtags.map((h, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#7B59FF] bg-[#EFEBFF] rounded-full px-2.5 py-1"
                >
                  {h}
                  <button
                    onClick={() => removeHashtag(i)}
                    className="w-3.5 h-3.5 flex items-center justify-center rounded-full hover:bg-[#7B59FF20] cursor-pointer transition-colors"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newHashtag}
                onChange={(e) => setNewHashtag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addHashtag();
                  }
                }}
                placeholder="Add hashtag..."
                className={`${INPUT_STYLE} flex-1 h-8 px-3 text-xs`}
              />
              <button
                onClick={addHashtag}
                className="h-8 px-3 text-xs font-medium text-[#7B59FF] bg-[#EFEBFF] hover:bg-[#e2daff] rounded-lg cursor-pointer transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        ) : (
          asset.hashtags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mb-4">
              {asset.hashtags.map((h, i) => (
                <span key={i} className="text-xs text-[#7B59FF] font-medium">
                  {h}
                </span>
              ))}
            </div>
          )
        )}

        {/* Notes */}
        {asset.notes.length > 0 && (
          <div className="mb-3">
            {asset.notes.map((n, i) => (
              <div
                key={i}
                className="py-1.5 px-3 bg-[#f8f9fb] rounded-md mb-1.5 text-[13px] text-[#545b6d] border-l-2 border-[#7B59FF]"
              >
                {n}
              </div>
            ))}
          </div>
        )}

        {showNotes && (
          <div className="flex gap-2 mb-3">
            <input
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addNote()}
              placeholder="Add a note..."
              className="flex-1 h-8 px-3 border border-[#e6e7eb] rounded-lg text-[13px] text-[#1f2128] outline-none focus:border-[#7B59FF] transition-colors"
            />
            <button
              onClick={addNote}
              className="h-8 px-3 bg-[#7B59FF] text-white text-[13px] font-medium rounded-lg hover:bg-[#6a4be0] cursor-pointer transition-colors"
            >
              Add
            </button>
          </div>
        )}

        {/* Copied toast */}
        {copied && (
          <div className="text-xs text-[#007737] text-center mb-2 font-medium">
            Copied to clipboard!
          </div>
        )}

        {/* Edit mode: Save / Cancel buttons */}
        {isEditing ? (
          <div className="flex gap-2 pt-3 border-t border-[#f0f1f3]">
            <button
              onClick={saveEdit}
              className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-[13px] font-medium text-white bg-[#7B59FF] hover:bg-[#6a4be0] cursor-pointer transition-colors"
            >
              <Save size={13} /> Save
            </button>
            <button
              onClick={cancelEdit}
              className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-[13px] font-medium text-[#545b6d] bg-[#f0f1f3] hover:bg-[#e6e7eb] cursor-pointer transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          /* Action buttons — clean, minimal */
          <div className="flex gap-2 pt-3 border-t border-[#f0f1f3]">
            {asset.status === "pending" && (
              <>
                <button
                  onClick={() => onAction(asset.id, "approve")}
                  className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-[13px] font-medium text-[#007737] bg-[#E6F4EA] hover:bg-[#d4edda] cursor-pointer transition-colors"
                >
                  <ThumbsUp size={13} /> Approve
                </button>
                <button
                  onClick={() => onAction(asset.id, "reject")}
                  className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-[13px] font-medium text-[#DF1C41] bg-[#FFEBEE] hover:bg-[#fdd] cursor-pointer transition-colors"
                >
                  <ThumbsDown size={13} /> Reject
                </button>
              </>
            )}
            {asset.status === "approved" && (
              <button
                onClick={() => onAction(asset.id, "reject")}
                className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-[13px] font-medium text-[#545b6d] bg-[#f0f1f3] hover:bg-[#e6e7eb] cursor-pointer transition-colors"
              >
                Undo approval
              </button>
            )}
            {asset.status === "rejected" && (
              <button
                onClick={() => onAction(asset.id, "approve")}
                className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-[13px] font-medium text-[#545b6d] bg-[#f0f1f3] hover:bg-[#e6e7eb] cursor-pointer transition-colors"
              >
                Undo rejection
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
