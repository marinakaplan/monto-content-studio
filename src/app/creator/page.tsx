"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users, FileText, Clock, CheckCircle, Plus, X, Loader2, User,
} from "lucide-react";
import { Btn } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DS, ROLES } from "@/lib/constants";
import type { TeamMember } from "@/lib/supabase";
import type { LucideIcon } from "lucide-react";

const ROLE_COLORS: Record<string, { color: string; bg: string }> = {
  admin: { color: DS.error, bg: DS.errorBg },
  marketing: { color: DS.primary, bg: DS.primaryLighter },
  creator: { color: DS.info, bg: DS.infoBg },
};

const AVATAR_COLORS = [DS.primary, DS.info, DS.success, DS.warning, DS.error, "#6344E5"];

function StatsCard({ label, value, icon: Icon, color, bg }: {
  label: string; value: number; icon: LucideIcon; color: string; bg: string;
}) {
  return (
    <div className="bg-white border border-[#e6e7eb] rounded-lg p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: bg }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <div className="text-2xl font-bold text-[#1f2128]">{value}</div>
        <div className="text-[13px] text-[#545b6d]">{label}</div>
      </div>
    </div>
  );
}

export default function CreatorModePage() {
  const router = useRouter();
  const [members, setMembers] = useState<(TeamMember & { voice_calibrated?: boolean; leadership_tracks?: string[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<"admin" | "marketing" | "creator">("creator");
  const [formLinkedin, setFormLinkedin] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/team-members")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setMembers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleAddMember() {
    if (!formName.trim() || !formEmail.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/team-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          email: formEmail.trim(),
          role: formRole,
          linkedin_url: formLinkedin.trim() || null,
        }),
      });
      if (res.ok) {
        const newMember = await res.json();
        setMembers((prev) => [...prev, newMember]);
        setShowModal(false);
        setFormName("");
        setFormEmail("");
        setFormRole("creator");
        setFormLinkedin("");
      }
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  }

  const queueCount = 0; // placeholder — would come from API
  const pendingApprovals = 0;
  const publishedCount = 0;

  return (
    <div className="px-8 pb-12 max-w-[1200px] mx-auto pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1f2128]">Creator Mode</h1>
          <p className="text-sm text-[#545b6d] mt-1">
            Manage team members, voice profiles, and advocacy content.
          </p>
        </div>
        <Btn variant="primary" onClick={() => setShowModal(true)}>
          <Plus size={15} /> Add Team Member
        </Btn>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatsCard label="Team Members" value={members.length} icon={Users} color={DS.fg} bg={DS.bg} />
          <StatsCard label="Content in Queue" value={queueCount} icon={FileText} color={DS.info} bg={DS.infoBg} />
          <StatsCard label="Pending Approvals" value={pendingApprovals} icon={Clock} color={DS.warning} bg={DS.warningBg} />
          <StatsCard label="Published" value={publishedCount} icon={CheckCircle} color={DS.success} bg={DS.successBg} />
        </div>
      )}

      {/* Team Members Grid */}
      {loading ? (
        <div className="text-center py-20 text-[#71757e]">Loading team members...</div>
      ) : members.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-[#EFEBFF] flex items-center justify-center mx-auto mb-4">
            <Users size={24} color={DS.primary} />
          </div>
          <h3 className="text-lg font-semibold text-[#1f2128] mb-2">No team members yet</h3>
          <p className="text-sm text-[#545b6d] mb-6 max-w-sm mx-auto">
            Add your first team member to start calibrating their voice and managing advocacy content.
          </p>
          <Btn variant="primary" onClick={() => setShowModal(true)}>
            <Plus size={15} /> Add First Member
          </Btn>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3">
          {members.map((member, idx) => {
            const rc = ROLE_COLORS[member.role] || ROLE_COLORS.creator;
            const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            return (
              <div
                key={member.id}
                className="bg-white border border-[#e6e7eb] rounded-lg p-4 hover:border-[#c4c9d4] hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[15px] font-bold text-white shrink-0"
                    style={{ background: avatarColor }}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[14px] font-semibold text-[#1f2128] truncate">{member.name}</h4>
                    <p className="text-[12px] text-[#71757e] truncate">{member.email}</p>
                  </div>
                  <Badge color={rc.color} bg={rc.bg}>
                    {member.role}
                  </Badge>
                </div>

                {/* Voice calibration status */}
                <div className="flex items-center gap-2 mb-3">
                  {member.voice_calibrated ? (
                    <Badge color={DS.success} bg={DS.successBg} icon={CheckCircle}>
                      Calibrated
                    </Badge>
                  ) : (
                    <Badge color={DS.muted} bg={DS.neutralBg}>
                      Not calibrated
                    </Badge>
                  )}
                </div>

                {/* Leadership tracks */}
                {member.leadership_tracks && member.leadership_tracks.length > 0 && (
                  <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                    {member.leadership_tracks.map((track) => (
                      <span
                        key={track}
                        className="text-[10px] font-medium text-[#7B59FF] bg-[#EFEBFF] rounded px-1.5 py-0.5"
                      >
                        {track}
                      </span>
                    ))}
                  </div>
                )}

                {/* View Profile link */}
                <Link
                  href={`/creator/${member.id}`}
                  className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#7B59FF] hover:underline no-underline"
                >
                  <User size={12} /> View Profile
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Team Member Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-bold text-[#1f2128]">Add Team Member</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#a1a5ae] hover:text-[#545b6d] bg-transparent border-0 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[12px] font-semibold text-[#545b6d] uppercase tracking-wider mb-1.5 block">
                  Name
                </label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Full name"
                  className="w-full text-[13px] px-3 py-2 rounded-lg border border-[#e6e7eb] bg-white outline-none focus:border-[#7B59FF]"
                />
              </div>

              <div>
                <label className="text-[12px] font-semibold text-[#545b6d] uppercase tracking-wider mb-1.5 block">
                  Email
                </label>
                <input
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="email@company.com"
                  type="email"
                  className="w-full text-[13px] px-3 py-2 rounded-lg border border-[#e6e7eb] bg-white outline-none focus:border-[#7B59FF]"
                />
              </div>

              <div>
                <label className="text-[12px] font-semibold text-[#545b6d] uppercase tracking-wider mb-1.5 block">
                  Role
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as "admin" | "marketing" | "creator")}
                  className="w-full text-[13px] px-3 py-2 rounded-lg border border-[#e6e7eb] bg-white outline-none focus:border-[#7B59FF]"
                >
                  {ROLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label} — {r.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-[#545b6d] uppercase tracking-wider mb-1.5 block">
                  LinkedIn URL
                </label>
                <input
                  value={formLinkedin}
                  onChange={(e) => setFormLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full text-[13px] px-3 py-2 rounded-lg border border-[#e6e7eb] bg-white outline-none focus:border-[#7B59FF]"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-6">
              <Btn variant="primary" onClick={handleAddMember} disabled={saving || !formName.trim() || !formEmail.trim()}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {saving ? "Adding..." : "Add Member"}
              </Btn>
              <Btn variant="tertiary" onClick={() => setShowModal(false)}>
                Cancel
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
