"use client";

import { CopyButton } from "@/components/ui/copy-button";

type PlatformPreviewProps = {
  platform: string;
  headline: string;
  body: string;
  hashtags?: string[];
  illustrationUrl?: string | null;
  illustrationDesc?: string | null;
  /* backward compat with publish page */
  content?: string;
  formatType?: "text" | "html" | "markdown";
};

/* ------------------------------------------------------------------ */
/*  LinkedIn Preview                                                   */
/* ------------------------------------------------------------------ */
function LinkedInPreview({
  headline,
  body,
  hashtags,
  illustrationUrl,
}: {
  headline: string;
  body: string;
  hashtags?: string[];
  illustrationUrl?: string | null;
}) {
  const truncated = body.split("\n").slice(0, 3).join("\n");
  const needsTruncation = body.split("\n").length > 3 || body.length > 280;
  const displayText = needsTruncation ? truncated.slice(0, 280) : body;

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-[#E8E8E8]" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
      {/* Header */}
      <div className="px-4 pt-3 pb-2 flex items-start gap-2.5">
        <div className="w-12 h-12 rounded-full bg-[#7B59FF] flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-[18px] leading-none">M</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-[14px] font-semibold text-[#1D2226]">Monto</span>
          </div>
          <p className="text-[12px] text-[#666666] leading-tight">1,234 followers</p>
          <div className="flex items-center gap-1 text-[12px] text-[#666666]">
            <span>1h</span>
            <span>&middot;</span>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="#666666"><path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm5.354-3.354a.5.5 0 0 0-.708.708l3 3a.5.5 0 0 0 .708-.708l-3-3zM8 4a.5.5 0 0 1 .5.5V8a.5.5 0 0 1-1 0V4.5A.5.5 0 0 1 8 4z" /></svg>
          </div>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#666666" className="flex-shrink-0 mt-1"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
      </div>

      {/* Post text */}
      <div className="px-4 pb-2">
        <p className="text-[14px] text-[#1D2226] leading-[1.4] whitespace-pre-line">
          {displayText}
          {needsTruncation && (
            <span className="text-[#666666]">... <span className="text-[#0A66C2] font-medium cursor-pointer hover:underline">see more</span></span>
          )}
        </p>
        {hashtags && hashtags.length > 0 && (
          <p className="mt-1 text-[14px] text-[#0A66C2]">
            {hashtags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ")}
          </p>
        )}
      </div>

      {/* Image area */}
      {illustrationUrl ? (
        <div className="w-full border-t border-[#E8E8E8]">
          <img src={illustrationUrl} alt={headline} className="w-full object-cover max-h-[300px]" />
        </div>
      ) : (
        <div className="w-full h-[200px] bg-gradient-to-br from-[#EDE9FF] to-[#D4CCFF] border-t border-b border-[#E8E8E8] flex items-center justify-center">
          <div className="text-center px-6">
            <div className="w-10 h-10 rounded-lg bg-[#7B59FF] flex items-center justify-center mx-auto mb-2">
              <span className="text-white font-bold text-[16px]">M</span>
            </div>
            <p className="text-[13px] font-semibold text-[#5B3FD9] max-w-[260px]">{headline}</p>
          </div>
        </div>
      )}

      {/* Engagement counts */}
      <div className="px-4 py-1.5 flex items-center justify-between text-[12px] text-[#666666]">
        <div className="flex items-center gap-0.5">
          <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-[#0A66C2]">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M2 21h3V9H2v12zm18.37-6.64c.34-.51.63-1.04.63-1.61 0-1.1-.9-2-2-2h-5.5c.61-1.55 1-3.37 1-4.75 0-2.1-1.53-3.5-3-3.5-.81 0-1.42.39-1.83.85-.41.47-.65 1.04-.82 1.62l-.85 2.87c-.34 1.15-1.22 2.09-2 2.66V19c.58.36 1.31.72 2.18.96.87.24 1.82.29 2.82.29h5.3c.89 0 1.63-.59 1.88-1.42l1.76-5.95c.08-.28.12-.57.12-.86 0-.13-.01-.25-.03-.37z" /></svg>
          </span>
          <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-[#DF704D] -ml-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
          </span>
          <span className="ml-1">47</span>
        </div>
        <span>12 comments &middot; 3 reposts</span>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-[#E8E8E8]" />

      {/* Action bar */}
      <div className="px-2 py-0.5 flex items-center justify-around">
        {[
          { icon: "M2 21h3V9H2v12zm18.37-6.64c.34-.51.63-1.04.63-1.61 0-1.1-.9-2-2-2h-5.5c.61-1.55 1-3.37 1-4.75 0-2.1-1.53-3.5-3-3.5-.81 0-1.42.39-1.83.85-.41.47-.65 1.04-.82 1.62l-.85 2.87c-.34 1.15-1.22 2.09-2 2.66V19c.58.36 1.31.72 2.18.96.87.24 1.82.29 2.82.29h5.3c.89 0 1.63-.59 1.88-1.42l1.76-5.95c.08-.28.12-.57.12-.86 0-.13-.01-.25-.03-.37z", label: "Like" },
          { icon: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z", label: "Comment" },
          { icon: "M7 7h10v2H7V7zm0 4h7v2H7v-2z M18 2H6c-1.1 0-2 .9-2 2v16l4-4h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z", label: "Repost" },
          { icon: "M2 21l21-9L2 3v7l15 2-15 2v7z", label: "Send" },
        ].map((action) => (
          <button
            key={action.label}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded text-[#666666] hover:bg-[#F3F2EF] transition-colors bg-transparent border-0 cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#666666"><path d={action.icon} /></svg>
            <span className="text-[12px] font-medium">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Instagram Preview                                                  */
/* ------------------------------------------------------------------ */
function InstagramPreview({
  headline,
  body,
  hashtags,
  illustrationUrl,
}: {
  headline: string;
  body: string;
  hashtags?: string[];
  illustrationUrl?: string | null;
}) {
  const captionLimit = 125;
  const needsTruncation = body.length > captionLimit;
  const displayCaption = needsTruncation ? body.slice(0, captionLimit) : body;

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-[#DBDBDB]">
      {/* Header */}
      <div className="px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FEDA75] via-[#FA7E1E] to-[#D62976] p-[2px]">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <div className="w-[26px] h-[26px] rounded-full bg-[#7B59FF] flex items-center justify-center">
                <span className="text-white font-bold text-[11px] leading-none">M</span>
              </div>
            </div>
          </div>
          <span className="text-[13px] font-semibold text-[#262626]">monto_official</span>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#262626"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
      </div>

      {/* Image area — square */}
      {illustrationUrl ? (
        <div className="w-full aspect-square bg-[#EFEFEF]">
          <img src={illustrationUrl} alt={headline} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="w-full aspect-square bg-gradient-to-br from-[#7B59FF] via-[#A78BFA] to-[#6D28D9] flex items-center justify-center relative">
          <div className="text-center px-8">
            <p className="text-white font-bold text-[20px] leading-tight drop-shadow-md">{headline}</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center">
                <span className="text-white font-bold text-[10px]">M</span>
              </div>
              <span className="text-white/80 text-[12px] font-medium">monto.ai</span>
            </div>
          </div>
        </div>
      )}

      {/* Action bar */}
      <div className="px-3 pt-2.5 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2"><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4z" /></svg>
        </div>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
      </div>

      {/* Likes */}
      <div className="px-3 pt-1 pb-0.5">
        <p className="text-[13px] font-semibold text-[#262626]">1,234 likes</p>
      </div>

      {/* Caption */}
      <div className="px-3 pb-1">
        <p className="text-[13px] text-[#262626] leading-[1.4]">
          <span className="font-semibold">monto_official</span>{" "}
          {displayCaption}
          {needsTruncation && (
            <span className="text-[#8E8E8E] cursor-pointer">...more</span>
          )}
        </p>
        {hashtags && hashtags.length > 0 && (
          <p className="text-[13px] text-[#00376B] mt-0.5 leading-[1.4]">
            {hashtags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ")}
          </p>
        )}
      </div>

      {/* Comments link */}
      <div className="px-3 pb-1">
        <p className="text-[13px] text-[#8E8E8E] cursor-pointer">View all 23 comments</p>
      </div>

      {/* Timestamp */}
      <div className="px-3 pb-3">
        <p className="text-[10px] text-[#8E8E8E] uppercase tracking-wide">2 hours ago</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Email Preview                                                      */
/* ------------------------------------------------------------------ */
function EmailPreview({
  headline,
  body,
}: {
  headline: string;
  body: string;
}) {
  return (
    <div className="rounded-lg overflow-hidden border border-[#D1D5DB]" style={{ background: "#f5f5f5" }}>
      {/* Window chrome */}
      <div className="bg-[#E5E7EB] px-3 py-2 flex items-center gap-1.5 border-b border-[#D1D5DB]">
        <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
        <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
        <span className="w-3 h-3 rounded-full bg-[#22C55E]" />
        <span className="flex-1" />
        <span className="text-[10px] text-[#9CA3AF] font-medium">Mail</span>
      </div>

      {/* Email header */}
      <div className="bg-white mx-3 mt-3 rounded-t-lg border border-[#E5E7EB] border-b-0">
        <div className="px-4 pt-3 pb-2 space-y-1.5">
          <div className="flex items-center text-[12px]">
            <span className="text-[#9CA3AF] w-[52px] flex-shrink-0">From:</span>
            <span className="text-[#374151] font-medium">Monto</span>
            <span className="text-[#9CA3AF] ml-1">&lt;marketing@monto.ai&gt;</span>
          </div>
          <div className="flex items-center text-[12px]">
            <span className="text-[#9CA3AF] w-[52px] flex-shrink-0">To:</span>
            <span className="text-[#374151]">you@example.com</span>
          </div>
          <div className="flex items-center text-[12px]">
            <span className="text-[#9CA3AF] w-[52px] flex-shrink-0">Subject:</span>
            <span className="text-[#111827] font-semibold">{headline}</span>
          </div>
        </div>
        <div className="mx-4 border-t border-[#E5E7EB]" />
      </div>

      {/* Email body */}
      <div className="bg-white mx-3 mb-3 rounded-b-lg border border-[#E5E7EB] border-t-0 px-6 pb-6 pt-4">
        <p className="text-[14px] text-[#374151] leading-[1.7] whitespace-pre-line">{body}</p>

        {/* CTA Button */}
        <div className="mt-6 mb-2">
          <div
            className="inline-block px-6 py-3 rounded-lg text-white font-semibold text-[14px]"
            style={{ background: "#7B59FF" }}
          >
            Learn More &rarr;
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-[#E5E7EB] text-center">
          <div className="flex items-center justify-center gap-1 mb-2">
            <div className="w-5 h-5 rounded bg-[#7B59FF] flex items-center justify-center">
              <span className="text-white font-bold text-[9px]">M</span>
            </div>
            <span className="text-[12px] font-semibold text-[#374151]">Monto</span>
          </div>
          <p className="text-[11px] text-[#9CA3AF]">
            <span className="cursor-pointer hover:underline">Unsubscribe</span>
            {" "}&middot;{" "}
            <span className="cursor-pointer hover:underline">View in browser</span>
            {" "}&middot;{" "}
            <span className="cursor-pointer hover:underline">Manage preferences</span>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Blog Preview                                                       */
/* ------------------------------------------------------------------ */
function BlogPreview({
  headline,
  body,
  hashtags,
  illustrationUrl,
}: {
  headline: string;
  body: string;
  hashtags?: string[];
  illustrationUrl?: string | null;
}) {
  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-[#E5E7EB]">
      {/* Blog header bar */}
      <div className="px-5 pt-4 pb-3 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <div className="w-[3px] h-[14px] rounded-full bg-[#7B59FF]" />
          <span className="text-[11px] font-bold text-[#7B59FF] uppercase tracking-[1.5px]">Monto Blog</span>
        </div>
      </div>

      {/* Article */}
      <div className="px-5 pt-5 pb-2">
        <h1 className="text-[22px] font-bold text-[#111827] leading-tight mb-3">{headline}</h1>
        <div className="flex items-center gap-2 text-[12px] text-[#9CA3AF] mb-4">
          <span className="text-[#6B7280] font-medium">By Monto Marketing Team</span>
          <span>&middot;</span>
          <span>5 min read</span>
          <span>&middot;</span>
          <span>{today}</span>
        </div>
      </div>

      {/* Hero image */}
      {illustrationUrl ? (
        <div className="px-5 pb-4">
          <img src={illustrationUrl} alt={headline} className="w-full rounded-lg object-cover max-h-[220px]" />
        </div>
      ) : (
        <div className="mx-5 mb-4 h-[180px] rounded-lg bg-gradient-to-br from-[#EDE9FF] via-[#DDD6FE] to-[#C4B5FD] flex items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-[#7B59FF] flex items-center justify-center">
            <span className="text-white font-bold text-[20px]">M</span>
          </div>
        </div>
      )}

      {/* Body text */}
      <div className="px-5 pb-4">
        <div className="text-[14px] text-[#374151] leading-[1.75] whitespace-pre-line max-w-[540px]">{body}</div>
      </div>

      {/* Tags */}
      {hashtags && hashtags.length > 0 && (
        <div className="px-5 pb-4 flex flex-wrap gap-2">
          {hashtags.map((tag, i) => (
            <span
              key={i}
              className="text-[11px] font-medium text-[#7B59FF] bg-[#EDE9FF] rounded-full px-3 py-1"
            >
              {tag.startsWith("#") ? tag : `#${tag}`}
            </span>
          ))}
        </div>
      )}

      {/* Share row */}
      <div className="px-5 pb-4 pt-2 border-t border-[#E5E7EB] flex items-center gap-3">
        <span className="text-[12px] text-[#9CA3AF] font-medium">Share:</span>
        {["Twitter", "LinkedIn", "Facebook", "Link"].map((s) => (
          <span
            key={s}
            className="text-[11px] text-[#6B7280] font-medium px-2.5 py-1 rounded-md bg-[#F3F4F6] cursor-pointer hover:bg-[#E5E7EB] transition-colors"
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */
export function PlatformPreview({
  platform,
  headline: headlineProp,
  body: bodyProp,
  hashtags,
  illustrationUrl,
  illustrationDesc,
  /* backward compat */
  content,
  formatType,
}: PlatformPreviewProps) {
  /* Support old callers that pass content instead of headline+body */
  const headline = headlineProp || "";
  const body = bodyProp || content || "";

  const inner = (() => {
    switch (platform) {
      case "linkedin":
        return <LinkedInPreview headline={headline} body={body} hashtags={hashtags} illustrationUrl={illustrationUrl} />;
      case "instagram":
        return <InstagramPreview headline={headline} body={body} hashtags={hashtags} illustrationUrl={illustrationUrl} />;
      case "email":
        return <EmailPreview headline={headline} body={body} />;
      case "blog":
        return <BlogPreview headline={headline} body={body} hashtags={hashtags} illustrationUrl={illustrationUrl} />;
      default:
        return (
          <div className="bg-white border border-[#E5E7EB] rounded-lg p-4 max-h-[320px] overflow-y-auto">
            <p className="text-[13px] text-[#545b6d] whitespace-pre-line">{body}</p>
          </div>
        );
    }
  })();

  return (
    <div className="relative group">
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton text={body} />
      </div>
      {inner}
    </div>
  );
}
