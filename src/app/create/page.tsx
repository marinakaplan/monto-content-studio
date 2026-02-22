"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BriefForm, type BriefFormData, type BriefPrefill } from "@/components/brief-form";
import { EventsPanel, type EventPrefill } from "@/components/events-panel";

export default function CreatePage() {
  const router = useRouter();
  const [, setSubmitting] = useState(false);
  const [prefill, setPrefill] = useState<BriefPrefill | null>(null);

  // Pick up structured prefill from dashboard event click (sessionStorage)
  useEffect(() => {
    const stored = sessionStorage.getItem("eventPrefill");
    if (stored) {
      try {
        const data = JSON.parse(stored) as BriefPrefill;
        setPrefill(data);
      } catch {
        // ignore
      }
      sessionStorage.removeItem("eventPrefill");
    }
  }, []);

  // Handle "Use" from the sidebar events panel
  function handleEventUse(eventPrefill: EventPrefill) {
    setPrefill(eventPrefill);
  }

  async function handleSubmit(data: BriefFormData) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_name: data.campaign,
          icp: data.icp,
          seniority: data.seniority,
          key_message: data.message,
          pillar: data.pillar || null,
          platforms: data.platforms,
          deadline: data.deadline || null,
          context: data.context || null,
        }),
      });
      const brief = await res.json();
      if (brief.id) {
        router.push(`/create/${brief.id}`);
      }
    } catch (err) {
      console.error("Failed to create brief:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="px-6 pb-12 max-w-[1200px]">
      <nav className="flex items-center gap-1.5 text-[13px] text-[#a1a5ae] pt-6 pb-5">
        <Link href="/" className="hover:text-[#545b6d] transition-colors">Dashboard</Link>
        <ChevronRight size={12} />
        <span className="text-[#1f2128] font-medium">New Campaign</span>
      </nav>
      <BriefForm
        onSubmit={handleSubmit}
        sidebarExtras={<EventsPanel onUseEvent={handleEventUse} />}
        prefill={prefill}
      />
    </div>
  );
}
