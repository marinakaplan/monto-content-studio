"use client";

import {
  Shield,
  Lightbulb,
  Brain,
  Sparkles,
  Check,
  X,
  ArrowRight,
  Linkedin,
  Instagram,
  Mail,
  FileText,
  BarChart3,
  Megaphone,
  Heart,
  Award,
  Package,
  Monitor,
  Factory,
  Users,
  TrendingUp,
  Quote,
  type LucideIcon,
} from "lucide-react";
import { DS, PILLARS, PLATFORMS, ICPS, SENIORITY } from "@/lib/constants";

/* ------------------------------------------------------------------ */
/* Tiny helpers                                                        */
/* ------------------------------------------------------------------ */
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-[${DS.borderLight}] ${className}`}
      style={{ boxShadow: DS.shadowSm }}
    >
      {children}
    </div>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-[#1f2128] mb-1">{title}</h2>
      {subtitle && <p className="text-sm text-[#545b6d]">{subtitle}</p>}
    </div>
  );
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      className="inline-block text-[11px] font-semibold rounded-full px-2.5 py-0.5"
      style={{ background: color + "18", color }}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Voice Spectrum Slider                                               */
/* ------------------------------------------------------------------ */
function VoiceSlider({
  left,
  right,
  position,
  note,
}: {
  left: string;
  right: string;
  position: number; // 0-100
  note: string;
}) {
  return (
    <div className="mb-6 last:mb-0">
      <div className="flex justify-between text-xs font-semibold text-[#545b6d] mb-2">
        <span>{left}</span>
        <span>{right}</span>
      </div>
      <div className="relative h-2 rounded-full bg-gradient-to-r from-[#EFEBFF] to-[#7B59FF]">
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#7B59FF] border-2 border-white"
          style={{ left: `calc(${position}% - 8px)`, boxShadow: "0 0 0 3px rgba(123,89,255,0.25)" }}
        />
      </div>
      <p className="text-xs text-[#71757e] mt-1.5 italic">{note}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Color Swatch                                                        */
/* ------------------------------------------------------------------ */
function Swatch({ name, hex }: { name: string; hex: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="w-20 h-20 rounded-xl border border-[#e6e7eb]"
        style={{ background: hex, boxShadow: DS.shadowSm }}
      />
      <span className="text-xs font-semibold text-[#1f2128]">{name}</span>
      <span className="text-[11px] text-[#71757e] font-mono">{hex}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Example Post Card                                                   */
/* ------------------------------------------------------------------ */
function PostCard({
  pillar,
  style,
  content,
  color,
}: {
  pillar: string;
  style: string;
  content: string;
  color: string;
}) {
  return (
    <Card className="p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Badge color={color}>{pillar}</Badge>
        <span className="text-[11px] text-[#71757e]">{style}</span>
      </div>
      <pre className="whitespace-pre-wrap text-[13px] leading-relaxed text-[#1f2128] font-sans m-0">
        {content.trim()}
      </pre>
    </Card>
  );
}

/* ================================================================== */
/* PAGE                                                                */
/* ================================================================== */
export default function BrandDNAPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      {/* ---- HERO ---- */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1f2128] via-[#2a2440] to-[#1f2128] text-white py-20 px-6">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle at 20% 50%, #7B59FF 0%, transparent 50%), radial-gradient(circle at 80% 30%, #beadff 0%, transparent 40%)",
        }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <p className="text-sm font-semibold tracking-widest uppercase mb-3" style={{ color: DS.primaryLight }}>
            Single Source of Truth
          </p>
          <h1 className="text-5xl font-bold mb-4">
            Monto <span className="bg-gradient-to-r from-[#7B59FF] to-[#beadff] bg-clip-text text-transparent">Brand DNA</span>
          </h1>
          <p className="text-lg text-[#c4c9d4] max-w-2xl mb-10">
            Monto automates how suppliers get paid through their customers&apos; AP portals — turning manual portal chaos into zero-touch payments.
          </p>

          {/* Core taglines */}
          <div className="flex flex-wrap gap-4">
            {[
              "Click. Connect. Get paid.",
              "It's smart. It's seamless. It's magic.",
              "Touch-free invoice-to-payment",
            ].map((t) => (
              <div
                key={t}
                className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium"
                style={{ background: "rgba(123,89,255,0.15)", border: "1px solid rgba(123,89,255,0.3)" }}
              >
                <Quote size={14} style={{ color: DS.primaryLight }} />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-16 flex flex-col gap-20">

        {/* ---- VOICE SPECTRUM ---- */}
        <section>
          <SectionHeading title="Voice Spectrum" subtitle="Where Monto sits on each communication axis" />
          <Card className="p-8">
            <VoiceSlider left="Professional" right="Conversational" position={35} note="Lean professional, stay approachable. Say 'Hi' not 'Dear'." />
            <VoiceSlider left="Serious" right="Winky" position={65} note="Light, playful touch. 'New feature just dropped' over 'Feature update complete'." />
            <VoiceSlider left="Respectful" right="Irreverent" position={25} note="Never dismiss portals. They are essential tools." />
            <VoiceSlider left="Matter-of-fact" right="Enthusiastic" position={50} note="Get to the point. Keep it engaging. Inspire action without being promotional." />
          </Card>
        </section>

        {/* ---- KEY TRAITS ---- */}
        <section>
          <SectionHeading title="Key Traits" subtitle="The four pillars of Monto's personality" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {([
              { icon: Shield, label: "Trustworthy", desc: "Transparency, proven solutions, real numbers. We earn trust by showing receipts.", example: "\"87.3% zero-touch payments\" not \"great results\"", color: DS.primary },
              { icon: Lightbulb, label: "Forward-Thinking", desc: "Innovation and AI agents as part of the vision — not the sole focus.", example: "AI is the engine, not the headline", color: DS.info },
              { icon: Brain, label: "Insightful", desc: "Actionable insights that educate the audience. Less marketing-speak, more substance.", example: "\"DSO starts before you send the invoice\"", color: "#6344E5" },
              { icon: Sparkles, label: "Joyful", desc: "Light, upbeat energy. Celebrate achievements without going overboard.", example: "\"The strongest thing in the office isn't the coffee\"", color: DS.warning },
            ] as const).map((t) => {
              const Icon = t.icon;
              return (
                <Card key={t.label} className="p-5 flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: t.color + "14" }}>
                    <Icon size={20} style={{ color: t.color }} />
                  </div>
                  <h3 className="text-sm font-bold text-[#1f2128]">{t.label}</h3>
                  <p className="text-xs text-[#545b6d] leading-relaxed">{t.desc}</p>
                  <p className="text-[11px] italic text-[#71757e] border-l-2 pl-2" style={{ borderColor: t.color }}>{t.example}</p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ---- WRITING RULES ---- */}
        <section>
          <SectionHeading title="Writing Rules" subtitle="The non-negotiables for every piece of Monto content" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* DOs */}
            <Card className="p-6">
              <h3 className="text-sm font-bold text-[#007737] mb-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#E6F4EA] flex items-center justify-center">
                  <Check size={14} className="text-[#007737]" />
                </div>
                Do
              </h3>
              <ul className="space-y-2.5">
                {[
                  "Active voice always",
                  "Short sentences: 15-20 words average",
                  "Everyday words, no jargon",
                  "One idea per sentence",
                  "Be concise — eliminate unnecessary words",
                  "Max 1-2 emojis, only at end or for emphasis",
                  "Hook in first 2 lines (LinkedIn)",
                ].map((r) => (
                  <li key={r} className="flex items-start gap-2 text-xs text-[#1f2128]">
                    <Check size={14} className="text-[#007737] shrink-0 mt-0.5" />
                    {r}
                  </li>
                ))}
              </ul>
            </Card>

            {/* DON'Ts */}
            <Card className="p-6">
              <h3 className="text-sm font-bold text-[#DF1C41] mb-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#FFEBEE] flex items-center justify-center">
                  <X size={14} className="text-[#DF1C41]" />
                </div>
                Don&apos;t
              </h3>
              <ul className="space-y-2.5">
                {[
                  "Never say \"we're excited to announce\"",
                  "Never say \"In today's fast-paced world...\"",
                  "Never use: leverage, synergy, best-in-class, cutting-edge",
                  "Never be overly formal, rigid, or stuffy",
                  "Never overuse humor in serious contexts",
                  "Never post generic content with no clear value",
                  "Never sound overly promotional or salesy",
                ].map((r) => (
                  <li key={r} className="flex items-start gap-2 text-xs text-[#1f2128]">
                    <X size={14} className="text-[#DF1C41] shrink-0 mt-0.5" />
                    {r}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Word Swaps */}
          <Card className="p-6">
            <h3 className="text-sm font-bold text-[#1f2128] mb-4">Word Swaps</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {([
                ["Hi", "Dear"],
                ["But", "However"],
                ["So", "Therefore"],
                ["I've attached", "Please find attached"],
                ["As we discussed", "Per our previous correspondence"],
              ] as const).map(([good, bad]) => (
                <div key={good} className="rounded-xl bg-[#f8f9fb] p-3 text-center">
                  <p className="text-xs font-bold text-[#007737] mb-1">Say &ldquo;{good}&rdquo;</p>
                  <p className="text-[11px] text-[#DF1C41] line-through">Not &ldquo;{bad}&rdquo;</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* ---- COLOR PALETTE ---- */}
        <section>
          <SectionHeading title="Color Palette" subtitle="The official Monto color system" />
          <Card className="p-8">
            <div className="flex flex-wrap gap-6 justify-center">
              <Swatch name="Primary Purple" hex="#7B59FF" />
              <Swatch name="Primary Dark" hex="#6344E5" />
              <Swatch name="Primary Light" hex="#beadff" />
              <Swatch name="Primary Lighter" hex="#EFEBFF" />
              <Swatch name="Dark / FG" hex="#1f2128" />
              <Swatch name="Yellow Accent" hex="#FFD93D" />
              <Swatch name="Success" hex="#007737" />
              <Swatch name="Error" hex="#DF1C41" />
              <Swatch name="Info Blue" hex="#1750FB" />
              <Swatch name="Muted" hex="#545b6d" />
            </div>
          </Card>
        </section>

        {/* ---- CONTENT PILLARS ---- */}
        <section>
          <SectionHeading title="Content Pillars" subtitle="The five categories that guide every piece of content" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {([
              {
                pillar: PILLARS[0],
                topics: ["B2B payment trends", "DSO optimization", "Zero-touch payments", "AI agents vs band-aids"],
              },
              {
                pillar: PILLARS[1],
                topics: ["Partnership announcements", "Conference recaps", "Processing milestones"],
              },
              {
                pillar: PILLARS[2],
                topics: ["Office dogs & coffee stats", "Day-in-the-life", "Team photos & events"],
              },
              {
                pillar: PILLARS[3],
                topics: ["Case studies with real numbers", "G2 reviews", "Customer quotes"],
              },
              {
                pillar: PILLARS[4],
                topics: ["Invoice status dashboard", "Exception handling", "SOC 2 & security"],
              },
            ] as const).map(({ pillar, topics }) => {
              const Icon = pillar.icon;
              return (
                <Card key={pillar.id} className="p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: pillar.color + "14" }}>
                      <Icon size={18} style={{ color: pillar.color }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1f2128]">{pillar.label}</h3>
                      <p className="text-[11px] text-[#71757e]">{pillar.desc}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {topics.map((t) => (
                      <span key={t} className="text-[11px] rounded-md px-2 py-0.5 bg-[#f8f9fb] text-[#545b6d] border border-[#e6e7eb]">{t}</span>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ---- TARGET AUDIENCE ---- */}
        <section>
          <SectionHeading title="Target Audience" subtitle="Who we talk to and what they care about" />

          {/* ICPs */}
          <h3 className="text-sm font-bold text-[#1f2128] mb-3">Ideal Customer Profiles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {ICPS.map((icp) => {
              const Icon = icp.icon;
              return (
                <Card key={icp.id} className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: icp.color + "14" }}>
                      <Icon size={20} style={{ color: icp.color }} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1f2128]">{icp.label}</h4>
                      <span className="text-[11px] text-[#71757e]">{icp.size} employees</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#545b6d] mb-2"><span className="font-semibold">Pain:</span> {icp.painPoint}</p>
                  <p className="text-xs text-[#545b6d]">
                    <span className="font-semibold">Messaging angle:</span>{" "}
                    {icp.id === "tech"
                      ? "Portal volume, login fatigue, scattered workflows"
                      : "Complex portal rules, document requirements, compliance burden"}
                  </p>
                </Card>
              );
            })}
          </div>

          {/* Seniority */}
          <h3 className="text-sm font-bold text-[#1f2128] mb-3">Seniority Levels</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {([
              { ...SENIORITY[0], feel: "Buried in portals, chasing statuses, firefighting" },
              { ...SENIORITY[1], feel: "Blind to what's happening, can't forecast, process won't scale" },
            ] as const).map((s) => {
              const Icon = s.icon;
              return (
                <Card key={s.id} className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#EFEBFF]">
                      <Icon size={20} className="text-[#7B59FF]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1f2128]">{s.label}</h4>
                      <span className="text-[11px] text-[#71757e]">{s.titles}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#545b6d] mb-1"><span className="font-semibold">Focus:</span> {s.focus}</p>
                  <p className="text-xs text-[#545b6d]"><span className="font-semibold">They feel:</span> {s.feel}</p>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ---- PLATFORM TONE GUIDE ---- */}
        <section>
          <SectionHeading title="Platform Tone Guide" subtitle="How voice adapts across channels" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {([
              {
                label: "LinkedIn",
                icon: Linkedin,
                color: "#0A66C2",
                rules: [
                  "Respectful, friendly, educational",
                  "Insightful and expert-driven",
                  "Hook in first 2 lines",
                  "End with 3-5 hashtags",
                ],
              },
              {
                label: "Instagram",
                icon: Instagram,
                color: "#E1306C",
                rules: [
                  "Short, punchy, bold",
                  "Visual-first storytelling",
                  "1-2 hashtags max",
                  "Culture & community focus",
                ],
              },
              {
                label: "Email",
                icon: Mail,
                color: DS.primary,
                rules: [
                  "Direct, professional, warm",
                  "Get to the point fast",
                  "Clear CTA",
                  "No fluff",
                ],
              },
              {
                label: "Blog",
                icon: FileText,
                color: DS.success,
                rules: [
                  "Educational, forward-thinking",
                  "In-depth but conversational",
                  "Actionable takeaways",
                  "Substance over style",
                ],
              },
            ] as const).map((p) => {
              const Icon = p.icon;
              return (
                <Card key={p.label} className="p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: p.color + "14" }}>
                      <Icon size={18} style={{ color: p.color }} />
                    </div>
                    <h3 className="text-sm font-bold text-[#1f2128]">{p.label}</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {p.rules.map((r) => (
                      <li key={r} className="flex items-start gap-2 text-xs text-[#545b6d]">
                        <ArrowRight size={12} className="shrink-0 mt-0.5" style={{ color: p.color }} />
                        {r}
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </section>

        {/* ---- PROOF POINTS ---- */}
        <section>
          <SectionHeading title="Proof Points" subtitle="Real customer results you can cite in any content" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {([
              {
                customer: "Cloudinary",
                stats: [
                  { value: "87.3%", label: "zero-touch payments" },
                  { value: "66%", label: "faster processing" },
                  { value: "23.5%", label: "fewer rejections" },
                ],
                quote: null as string | null,
                color: DS.primary,
              },
              {
                customer: "AppsFlyer",
                stats: [
                  { value: "2x", label: "approval rate" },
                  { value: "48", label: "portals connected" },
                  { value: "77%", label: "quicker payments" },
                ],
                quote: null as string | null,
                color: DS.info,
              },
              {
                customer: "TechTarget",
                stats: [
                  { value: "60.2%", label: "faster collections" },
                  { value: "85%", label: "payments automated" },
                  { value: "47.8%", label: "less time on invoices" },
                ],
                quote: null as string | null,
                color: "#6344E5",
              },
              {
                customer: "Invoca",
                stats: [
                  { value: "85%", label: "portal payments automated" },
                ],
                quote: "\"Payment just appears in our bank account\" — CFO",
                color: DS.success,
              },
            ]).map((c) => (
              <Card key={c.customer} className="p-5 flex flex-col gap-3">
                <h3 className="text-sm font-bold text-[#1f2128]">{c.customer}</h3>
                <div className="flex flex-col gap-2">
                  {c.stats.map((s) => (
                    <div key={s.label}>
                      <span className="text-2xl font-bold" style={{ color: c.color }}>{s.value}</span>
                      <span className="text-xs text-[#545b6d] ml-1.5">{s.label}</span>
                    </div>
                  ))}
                </div>
                {c.quote && (
                  <p className="text-[11px] italic text-[#71757e] border-t border-[#e6e7eb] pt-2 mt-1">{c.quote}</p>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* ---- EXAMPLE POSTS ---- */}
        <section>
          <SectionHeading title="Example Posts" subtitle="Best-in-class Monto content for reference" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PostCard
              pillar="Thought Leadership"
              style="Pain Point"
              color={DS.primary}
              content={`Things that should be illegal in 2025 (finance edition):

\u274C Logging into 37 AP portals just to get paid
\u274C Manually updating portal profiles every month
\u274C Waiting weeks to realize an invoice got rejected
\u274C Sharing passwords via spreadsheets
\u274C Forecasting cash flow based on guesses

Your team deserves better.

Monto automates invoice delivery, adapts to each portal's quirks, flags issues before they happen - and gives you real-time visibility across every portal.

No more extra work, just payments that flow!`}
            />
            <PostCard
              pillar="Customer Success"
              style="Numbers-driven"
              color={DS.success}
              content={`Monto helps Invoca collect 85% of portal payments with minimal effort

Here's what their CFO told us:
"We create the invoice in our ERP, don't do anything else, and the payment just appears in our bank account!"

They used to chase invoice statuses manually across multiple portals. Now they have one source of truth \u2014 and 85% of portal payments just\u2026 happen.

The best part? No one needed to change systems. Monto became the invisible glue across all of their customer portals.`}
            />
            <PostCard
              pillar="Culture & Community"
              style="Winky"
              color={DS.warning}
              content={`\u2615 This month, our office coffee machine did more than keep us caffeinated\u2026

\uD83D\uDCCA Hundreds of thousands of invoices processed
\uD83D\uDCB8 Millions flowing through portals automatically
\uD83D\uDCE9 0 angry emails to portal support

Turns out the strongest thing in the office isn't the coffee \u2014 it's the cash flow.`}
            />
            <PostCard
              pillar="Product Updates"
              style="Build vs Buy"
              color="#6344E5"
              content={`When Fortune 500s talk Build vs. Buy, the script is always the same:

Act I: Drown in portals.
Act II: "Let's just build our own automation."
Act III: The plot twist \u2014 realizing why building doesn't stick.

What we hear (over and over):
\u2022 RPA doesn't stretch. Works fine inside the org, collapses across hundreds of external portals.
\u2022 Every buyer's a snowflake. Same portal, new customer = new workflow, new data rules, new docs.
\u2022 Build = baggage. Security, compliance, edge cases, constant portal changes.

So the real question isn't can you build?
It's do you want to chase portal changes forever \u2014 or get paid faster?`}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
