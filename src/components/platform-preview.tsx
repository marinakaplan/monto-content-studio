"use client";

import { Linkedin, Instagram, Mail, FileText } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";

type PlatformPreviewProps = {
  platform: string;
  content: string;
  formatType: "text" | "html" | "markdown";
  headline?: string;
  hashtags?: string[];
};

function LinkedInPreview({ content, hashtags }: { content: string; hashtags?: string[] }) {
  return (
    <div className="bg-[#1b1f23] rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#2d3239]">
        <Linkedin size={16} className="text-[#0A66C2]" />
        <span className="text-[13px] font-semibold text-white">LinkedIn</span>
      </div>
      <div className="p-4 max-h-[320px] overflow-y-auto">
        <p className="text-[13px] text-[#d1d5db] leading-relaxed whitespace-pre-line">{content}</p>
        {hashtags && hashtags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {hashtags.map((tag, i) => (
              <span key={i} className="text-[12px] text-[#0A66C2]">
                {tag.startsWith("#") ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InstagramPreview({ content, hashtags }: { content: string; hashtags?: string[] }) {
  return (
    <div className="bg-white border border-[#e6e7eb] rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737]">
        <Instagram size={16} className="text-white" />
        <span className="text-[13px] font-semibold text-white">Instagram</span>
      </div>
      <div className="p-4 max-h-[320px] overflow-y-auto">
        <p className="text-[13px] text-[#1f2128] leading-relaxed whitespace-pre-line">{content}</p>
        {hashtags && hashtags.length > 0 && (
          <div className="mt-3 pt-2 border-t border-[#f0f1f3]">
            <p className="text-[12px] text-[#0095f6] leading-relaxed">
              {hashtags.map((tag) => (tag.startsWith("#") ? tag : `#${tag}`)).join(" ")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function EmailPreview({ content }: { content: string }) {
  return (
    <div className="bg-white border border-[#e6e7eb] rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-[#f8f9fb] border-b border-[#e6e7eb]">
        <Mail size={16} className="text-[#545b6d]" />
        <span className="text-[13px] font-semibold text-[#1f2128]">Email</span>
      </div>
      <div
        className="p-4 max-h-[320px] overflow-y-auto text-[13px] text-[#1f2128] leading-relaxed"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}

function BlogPreview({ content, headline, hashtags }: { content: string; headline?: string; hashtags?: string[] }) {
  return (
    <div className="bg-white border border-[#e6e7eb] rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#e6e7eb]">
        <FileText size={16} className="text-[#545b6d]" />
        <span className="text-[13px] font-semibold text-[#1f2128]">Blog</span>
      </div>
      <div className="p-4 max-h-[320px] overflow-y-auto">
        {headline && (
          <h3 className="text-[16px] font-bold text-[#1f2128] mb-3">{headline}</h3>
        )}
        <div className="text-[13px] text-[#545b6d] leading-relaxed whitespace-pre-line">{content}</div>
        {hashtags && hashtags.length > 0 && (
          <div className="mt-3 pt-2 border-t border-[#f0f1f3] flex flex-wrap gap-1.5">
            {hashtags.map((tag, i) => (
              <span
                key={i}
                className="text-[11px] font-medium text-[#7B59FF] bg-[#EFEBFF] rounded px-2 py-0.5"
              >
                {tag.startsWith("#") ? tag : `#${tag}`}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function PlatformPreview({ platform, content, formatType, headline, hashtags }: PlatformPreviewProps) {
  return (
    <div className="relative group">
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton text={content} />
      </div>
      {platform === "linkedin" && <LinkedInPreview content={content} hashtags={hashtags} />}
      {platform === "instagram" && <InstagramPreview content={content} hashtags={hashtags} />}
      {platform === "email" && <EmailPreview content={content} />}
      {platform === "blog" && <BlogPreview content={content} headline={headline} hashtags={hashtags} />}
      {!["linkedin", "instagram", "email", "blog"].includes(platform) && (
        <div className="bg-white border border-[#e6e7eb] rounded-lg p-4 max-h-[320px] overflow-y-auto">
          <p className="text-[13px] text-[#545b6d] whitespace-pre-line">{content}</p>
        </div>
      )}
    </div>
  );
}
