import {
  Monitor, Factory, Users, TrendingUp, BarChart3, Megaphone,
  Heart, Award, Package, Linkedin, Instagram, Mail, FileText,
  Calendar, Gift, Building2, Video, Rocket,
  type LucideIcon,
} from "lucide-react";

export type ICP = {
  id: "tech" | "manufacturing";
  label: string;
  icon: LucideIcon;
  size: string;
  painPoint: string;
  color: string;
};

export type Seniority = {
  id: "manager" | "executive";
  label: string;
  titles: string;
  focus: string;
  icon: LucideIcon;
};

export type Pillar = {
  id: "thought" | "milestone" | "culture" | "customer" | "product";
  label: string;
  desc: string;
  icon: LucideIcon;
  color: string;
};

export type Platform = {
  id: string;
  label: string;
  icon: LucideIcon;
  imageSize: string;
};

export type Template = {
  id: "target" | "vortex" | "maze" | "engine" | "hero";
  label: string;
  color: string;
};

export const DS = {
  primary: "#7B59FF",
  primaryDark: "#6344E5",
  primaryLight: "#beadff",
  primaryLighter: "#EFEBFF",
  fg: "#1f2128",
  muted: "#545b6d",
  mutedFg: "#71757e",
  border: "#c4c9d4",
  borderLight: "#e6e7eb",
  bg: "#f8f9fb",
  bgLight: "#fafafa",
  white: "#ffffff",
  success: "#007737",
  successBg: "#E6F4EA",
  error: "#DF1C41",
  errorBg: "#FFEBEE",
  warning: "#D48806",
  warningBg: "#FFF8E1",
  info: "#1750FB",
  infoBg: "#E3F2FD",
  processing: "#7B59FF",
  processingBg: "#F3E8FF",
  neutral: "#9CA3AF",
  neutralBg: "#F3F4F6",
  font: "'Studio Feixen Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  borderSubtle: "#edeef1",
  shadowXs: "0 1px 2px rgba(0,0,0,0.04)",
  shadowSm: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)",
  shadowFocus: "0 0 0 3px rgba(123,89,255,0.12)",
} as const;

export const ICPS: ICP[] = [
  { id: "tech", label: "Tech & Business Services", icon: Monitor, size: "500-5K", painPoint: "Portal volume — too many logins, too many workflows", color: DS.primary },
  { id: "manufacturing", label: "Manufacturing", icon: Factory, size: "2K-10K", painPoint: "Process complexity + portal compliance burden", color: DS.info },
];

export const SENIORITY: Seniority[] = [
  { id: "manager", label: "Manager / Director", titles: "Controller, Lead, Director", focus: "Visibility, manual work reduction", icon: Users },
  { id: "executive", label: "VP / CFO", titles: "VP, CFO, C-level", focus: "Cash flow, predictability, DSO", icon: TrendingUp },
];

export const PILLARS: Pillar[] = [
  { id: "thought", label: "Thought Leadership", desc: "Trends, DSO, AI agents, zero-touch", icon: BarChart3, color: DS.primary },
  { id: "milestone", label: "Milestone & News", desc: "Partnerships, growth, conferences", icon: Megaphone, color: DS.info },
  { id: "culture", label: "Culture & Community", desc: "Team, dogs, coffee — no selling", icon: Heart, color: DS.warning },
  { id: "customer", label: "Customer Success", desc: "Case studies with real numbers", icon: Award, color: DS.success },
  { id: "product", label: "Product Updates", desc: "Features, SOC 2, smart connections", icon: Package, color: "#6344E5" },
];

export const PLATFORMS: Platform[] = [
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, imageSize: "1200x675" },
  { id: "instagram", label: "Instagram", icon: Instagram, imageSize: "1080x1080" },
  { id: "email", label: "Email", icon: Mail, imageSize: "600x200" },
  { id: "blog", label: "Blog", icon: FileText, imageSize: "1200x630" },
];

export const TEMPLATES: Template[] = [
  { id: "target", label: "Target", color: DS.primary },
  { id: "vortex", label: "Vortex", color: DS.fg },
  { id: "maze", label: "Maze", color: "#6344E5" },
  { id: "engine", label: "Engine", color: DS.success },
  { id: "hero", label: "Hero", color: DS.warning },
];

export type EventCategory = {
  id: "conference" | "holiday" | "industry" | "webinar" | "product-launch";
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
};

export const EVENT_CATEGORIES: EventCategory[] = [
  { id: "conference", label: "Conference", icon: Building2, color: DS.primary, bg: DS.primaryLighter },
  { id: "holiday", label: "Holiday", icon: Gift, color: DS.warning, bg: DS.warningBg },
  { id: "industry", label: "Industry", icon: Calendar, color: DS.info, bg: DS.infoBg },
  { id: "webinar", label: "Webinar", icon: Video, color: DS.success, bg: DS.successBg },
  { id: "product-launch", label: "Launch", icon: Rocket, color: "#6344E5", bg: DS.primaryLighter },
];

export const STATUS_CONFIG = {
  draft: { label: "Draft", color: DS.muted, bg: DS.neutralBg },
  generating: { label: "Generating", color: DS.processing, bg: DS.processingBg },
  review: { label: "In Review", color: DS.warning, bg: DS.warningBg },
  complete: { label: "Complete", color: DS.success, bg: DS.successBg },
} as const;

export const ROLES = [
  { id: "admin", label: "Admin", description: "Full access to all features" },
  { id: "marketing", label: "Marketing", description: "Create campaigns, approve content" },
  { id: "creator", label: "Creator", description: "Personal publishing, claim advocacy content" },
] as const;

export const VOICE_TONE_OPTIONS = [
  "direct", "casual", "technical", "executive", "data-driven",
  "storytelling", "conversational", "authoritative", "empathetic",
  "witty", "concise", "educational", "inspirational", "analytical",
] as const;

export const ADVOCACY_STATUS_CONFIG = {
  available: { label: "Available", color: DS.info, bg: DS.infoBg },
  claimed: { label: "Claimed", color: DS.warning, bg: DS.warningBg },
  rewritten: { label: "Rewritten", color: DS.processing, bg: DS.processingBg },
  published: { label: "Published", color: DS.success, bg: DS.successBg },
} as const;

export const APPROVAL_STATUS_CONFIG = {
  pending: { label: "Pending", color: DS.warning, bg: DS.warningBg },
  approved: { label: "Approved", color: DS.success, bg: DS.successBg },
  rejected: { label: "Rejected", color: DS.error, bg: DS.errorBg },
} as const;

export const LANGUAGES = [
  { id: "en", label: "English", flag: "\u{1F1FA}\u{1F1F8}" },
  { id: "de", label: "German", flag: "\u{1F1E9}\u{1F1EA}" },
  { id: "fr", label: "French", flag: "\u{1F1EB}\u{1F1F7}" },
  { id: "es", label: "Spanish", flag: "\u{1F1EA}\u{1F1F8}" },
] as const;

export const PUBLISH_STATUS_CONFIG = {
  draft: { label: "Draft", color: DS.muted, bg: DS.neutralBg },
  copied: { label: "Copied", color: DS.warning, bg: DS.warningBg },
  published: { label: "Published", color: DS.success, bg: DS.successBg },
} as const;

export const SCHEDULE_STATUS_CONFIG = {
  scheduled: { label: "Scheduled", color: DS.info, bg: DS.infoBg },
  published: { label: "Published", color: DS.success, bg: DS.successBg },
  skipped: { label: "Skipped", color: DS.muted, bg: DS.neutralBg },
} as const;
