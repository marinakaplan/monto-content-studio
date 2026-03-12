"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Edit2, Plus, X, Loader2, Trash2,
  Linkedin, Globe, CheckCircle,
} from "lucide-react";
import { Btn } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VoiceCalibration } from "@/components/voice-calibration";
import { AdvocacyCard } from "@/components/advocacy-card";
import { DS, PILLARS } from "@/lib/constants";
import type { TeamMember, VoiceProfile, LeadershipTrack, AdvocacyQueueItem } from "@/lib/supabase";

const ROLE_COLORS: Record<string, { color: string; bg: string }> = {
  admin: { color: DS.error, bg: DS.errorBg },
  marketing: { color: DS.primary, bg: DS.primaryLighter },
  creator: { color: DS.info, bg: DS.infoBg },
};

export default function MemberProfilePage() {
  const params = useParams();
  const router = useRouter();
  const memberId = params.memberId as string;

  const [member, setMember] = useState<TeamMember | null>(null);
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile | null>(null);
  const [tracks, setTracks] = useState<LeadershipTrack[]>([]);
  const [advocacyItems, setAdvocacyItems] = useState<AdvocacyQueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit profile modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editLinkedin, setEditLinkedin] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // Add track modal
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [trackTheme, setTrackTheme] = useState("");
  const [trackDescription, setTrackDescription] = useState("");
  const [trackPillars, setTrackPillars] = useState<string[]>([]);
  const [trackSaving, setTrackSaving] = useState(false);

  const fetchMember = useCallback(async () => {
    try {
      const res = await fetch(`/api/team-members/${memberId}`);
      if (res.ok) {
        const data = await res.json();
        setMember(data.member || data);
        if (data.voice_profile) setVoiceProfile(data.voice_profile);
        if (data.leadership_tracks) setTracks(data.leadership_tracks);
        if (data.advocacy_items) setAdvocacyItems(data.advocacy_items);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [memberId]);

  useEffect(() => {
    fetchMember();
  }, [fetchMember]);

  function openEditModal() {
    if (!member) return;
    setEditName(member.name);
    setEditEmail(member.email);
    setEditLinkedin(member.linkedin_url || "");
    setShowEditModal(true);
  }

  async function handleEditSave() {
    setEditSaving(true);
    try {
      const res = await fetch(`/api/team-members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          email: editEmail.trim(),
          linkedin_url: editLinkedin.trim() || null,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMember(updated);
        setShowEditModal(false);
      }
    } catch (err) {
      console.error(err);
    }
    setEditSaving(false);
  }

  async function handleAddTrack() {
    if (!trackTheme.trim()) return;
    setTrackSaving(true);
    try {
      const res = await fetch(`/api/team-members/${memberId}/tracks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: trackTheme.trim(),
          description: trackDescription.trim() || null,
          pillars: trackPillars,
        }),
      });
      if (res.ok) {
        const newTrack = await res.json();
        setTracks((prev) => [...prev, newTrack]);
        setShowTrackModal(false);
        setTrackTheme("");
        setTrackDescription("");
        setTrackPillars([]);
      }
    } catch (err) {
      console.error(err);
    }
    setTrackSaving(false);
  }

  async function handleDeleteTrack(trackId: string) {
    try {
      const res = await fetch(`/api/team-members/${memberId}/tracks/${trackId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTracks((prev) => prev.filter((t) => t.id !== trackId));
      }
    } catch (err) {
      console.error(err);
    }
  }

  function toggleTrackPillar(pillarId: string) {
    setTrackPillars((prev) =>
      prev.includes(pillarId) ? prev.filter((p) => p !== pillarId) : [...prev, pillarId]
    );
  }

  if (loading) {
    return (
      <div className="px-8 pb-12 max-w-[1200px] mx-auto pt-6">
        <div className="text-center py-20 text-[#71757e]">Loading profile...</div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="px-8 pb-12 max-w-[1200px] mx-auto pt-6">
        <div className="text-center py-20 text-[#71757e]">Member not found.</div>
      </div>
    );
  }

  const rc = ROLE_COLORS[member.role] || ROLE_COLORS.creator;

  return (
    <div className="px-8 pb-12 max-w-[1200px] mx-auto pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/creator"
            className="text-[#a1a5ae] hover:text-[#545b6d] transition-colors no-underline"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#1f2128]">{member.name}</h1>
              <Badge color={rc.color} bg={rc.bg}>{member.role}</Badge>
            </div>
            <p className="text-sm text-[#545b6d] mt-1">{member.email}</p>
          </div>
        </div>
        <Btn variant="tertiary" onClick={openEditModal}>
          <Edit2 size={14} /> Edit Profile
        </Btn>
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Profile details */}
          <div className="bg-white border border-[#e6e7eb] rounded-lg p-5">
            <h3 className="text-[14px] font-semibold text-[#1f2128] mb-4">Profile Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-[#a1a5ae] uppercase tracking-wider block mb-1">Name</label>
                <p className="text-[13px] text-[#1f2128]">{member.name}</p>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-[#a1a5ae] uppercase tracking-wider block mb-1">Email</label>
                <p className="text-[13px] text-[#1f2128]">{member.email}</p>
              </div>
              {member.linkedin_url && (
                <div>
                  <label className="text-[11px] font-semibold text-[#a1a5ae] uppercase tracking-wider block mb-1">LinkedIn</label>
                  <a
                    href={member.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] text-[#7B59FF] hover:underline inline-flex items-center gap-1"
                  >
                    <Linkedin size={12} /> Profile
                  </a>
                </div>
              )}
              {Object.keys(member.social_profiles || {}).length > 0 && (
                <div>
                  <label className="text-[11px] font-semibold text-[#a1a5ae] uppercase tracking-wider block mb-1">Social Profiles</label>
                  <div className="flex items-center gap-2">
                    {Object.entries(member.social_profiles).map(([platform, url]) => (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12px] text-[#7B59FF] hover:underline inline-flex items-center gap-1"
                      >
                        <Globe size={11} /> {platform}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Voice Calibration */}
          <VoiceCalibration
            teamMemberId={memberId}
            voiceProfile={voiceProfile}
            onCalibrated={() => fetchMember()}
          />

          {/* Leadership Tracks */}
          <div className="bg-white border border-[#e6e7eb] rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-semibold text-[#1f2128]">Leadership Tracks</h3>
              <Btn variant="ghost" size="small" onClick={() => setShowTrackModal(true)}>
                <Plus size={12} /> Add Track
              </Btn>
            </div>

            {tracks.length === 0 ? (
              <p className="text-[12px] text-[#71757e]">
                No leadership tracks defined. Add a track to guide content themes for this person.
              </p>
            ) : (
              <div className="space-y-3">
                {tracks.map((track) => (
                  <div key={track.id} className="bg-[#f8f9fb] rounded-lg p-3 group">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-[13px] font-semibold text-[#1f2128] mb-0.5">{track.theme}</h4>
                        {track.description && (
                          <p className="text-[12px] text-[#545b6d] mb-2">{track.description}</p>
                        )}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {track.pillars.map((pillarId) => {
                            const pillar = PILLARS.find((p) => p.id === pillarId);
                            return (
                              <span
                                key={pillarId}
                                className="text-[10px] font-medium rounded px-1.5 py-0.5"
                                style={{ color: pillar?.color || DS.muted, background: `${pillar?.color || DS.muted}15` }}
                              >
                                {pillar?.label || pillarId}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteTrack(track.id)}
                        className="text-[#a1a5ae] hover:text-[#DF1C41] bg-transparent border-0 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Personal Advocacy Queue */}
          <div className="bg-white border border-[#e6e7eb] rounded-lg p-5">
            <h3 className="text-[14px] font-semibold text-[#1f2128] mb-4">Advocacy Queue</h3>
            {advocacyItems.length === 0 ? (
              <p className="text-[12px] text-[#71757e]">
                No advocacy content claimed yet.
              </p>
            ) : (
              <div className="space-y-3">
                {advocacyItems.map((item) => (
                  <AdvocacyCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-[#e6e7eb] rounded-lg p-5">
            <h3 className="text-[14px] font-semibold text-[#1f2128] mb-4">Recent Activity</h3>
            <p className="text-[12px] text-[#71757e]">No recent activity to display.</p>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-bold text-[#1f2128]">Edit Profile</h2>
              <button onClick={() => setShowEditModal(false)} className="text-[#a1a5ae] hover:text-[#545b6d] bg-transparent border-0 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[12px] font-semibold text-[#545b6d] uppercase tracking-wider mb-1.5 block">Name</label>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full text-[13px] px-3 py-2 rounded-lg border border-[#e6e7eb] bg-white outline-none focus:border-[#7B59FF]" />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-[#545b6d] uppercase tracking-wider mb-1.5 block">Email</label>
                <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} type="email" className="w-full text-[13px] px-3 py-2 rounded-lg border border-[#e6e7eb] bg-white outline-none focus:border-[#7B59FF]" />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-[#545b6d] uppercase tracking-wider mb-1.5 block">LinkedIn URL</label>
                <input value={editLinkedin} onChange={(e) => setEditLinkedin(e.target.value)} className="w-full text-[13px] px-3 py-2 rounded-lg border border-[#e6e7eb] bg-white outline-none focus:border-[#7B59FF]" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <Btn variant="primary" onClick={handleEditSave} disabled={editSaving}>
                {editSaving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                {editSaving ? "Saving..." : "Save Changes"}
              </Btn>
              <Btn variant="tertiary" onClick={() => setShowEditModal(false)}>Cancel</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Add Leadership Track Modal */}
      {showTrackModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-bold text-[#1f2128]">Add Leadership Track</h2>
              <button onClick={() => setShowTrackModal(false)} className="text-[#a1a5ae] hover:text-[#545b6d] bg-transparent border-0 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[12px] font-semibold text-[#545b6d] uppercase tracking-wider mb-1.5 block">Theme</label>
                <input value={trackTheme} onChange={(e) => setTrackTheme(e.target.value)} placeholder="e.g., AI in Finance, Zero-Touch AP" className="w-full text-[13px] px-3 py-2 rounded-lg border border-[#e6e7eb] bg-white outline-none focus:border-[#7B59FF]" />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-[#545b6d] uppercase tracking-wider mb-1.5 block">Description</label>
                <textarea value={trackDescription} onChange={(e) => setTrackDescription(e.target.value)} placeholder="Describe this track's focus..." rows={3} className="w-full text-[12px] px-3 py-2 rounded-lg border border-[#e6e7eb] bg-white outline-none focus:border-[#7B59FF] resize-none" />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-[#545b6d] uppercase tracking-wider mb-1.5 block">Pillars</label>
                <div className="flex flex-wrap gap-1.5">
                  {PILLARS.map((pillar) => {
                    const selected = trackPillars.includes(pillar.id);
                    return (
                      <button
                        key={pillar.id}
                        onClick={() => toggleTrackPillar(pillar.id)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium border cursor-pointer transition-colors ${
                          selected
                            ? "border-[#7B59FF] bg-[#EFEBFF] text-[#7B59FF]"
                            : "border-[#e6e7eb] bg-white text-[#545b6d] hover:border-[#c4c9d4]"
                        }`}
                      >
                        {pillar.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <Btn variant="primary" onClick={handleAddTrack} disabled={trackSaving || !trackTheme.trim()}>
                {trackSaving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                {trackSaving ? "Adding..." : "Add Track"}
              </Btn>
              <Btn variant="tertiary" onClick={() => setShowTrackModal(false)}>Cancel</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
