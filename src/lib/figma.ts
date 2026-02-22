import type { Asset, Brief, Event } from "./supabase";
import { TEMPLATES, PILLARS, PLATFORMS, ICPS, SENIORITY } from "./constants";

type FigmaNode = {
  id: string;
  name: string;
};

const FIGMA_API = "https://api.figma.com/v1";

/**
 * Build a comprehensive Design Brief text for Figma handoff.
 * Contains everything a designer needs to start working.
 */
export function buildDesignBriefText(
  asset: Asset,
  brief: Brief,
  event?: Event | null
): string {
  const pillar = PILLARS.find((p) => p.id === asset.pillar);
  const platform = PLATFORMS.find((p) => p.id === asset.platform);
  const tpl = TEMPLATES.find((t) => t.id === asset.template);
  const icp = ICPS.find((i) => i.id === brief.icp);
  const sen = SENIORITY.find((s) => s.id === brief.seniority);
  const [width, height] = (platform?.imageSize || "1200x675").split("x").map(Number);

  // Calculate deadline info
  const deadlineDate = event?.date || brief.deadline;
  let deadlineStr = "No deadline set";
  let deadlineNote = "";
  if (deadlineDate) {
    const d = new Date(deadlineDate);
    const formatted = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const now = new Date(); now.setHours(0, 0, 0, 0); d.setHours(0, 0, 0, 0);
    const days = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) {
      deadlineStr = `${formatted} (OVERDUE by ${Math.abs(days)} days)`;
    } else if (days === 0) {
      deadlineStr = `${formatted} (TODAY)`;
    } else {
      deadlineStr = `${formatted} (${days} days remaining)`;
    }
    deadlineNote = days <= 3 ? `URGENT: Creative due by ${formatted}` : `Creative due by ${formatted}`;
  }

  const isManual = brief.brief_type === "manual";

  // Build designer notes dynamically
  const notes: string[] = [];
  if (brief.overlay_title) {
    notes.push(`Title "${brief.overlay_title}" should be prominent on the image`);
  }
  if (event) {
    notes.push(`Tied to ${event.name} — ensure event branding if applicable`);
  }
  if (deadlineNote) {
    notes.push(deadlineNote);
  }
  notes.push("Maintain brand consistency with Monto visual language");
  notes.push(`Export at ${width}x${height} for ${platform?.label || asset.platform}`);

  const sections: string[] = [];

  // Header
  sections.push("DESIGN BRIEF");
  sections.push("━━━━━━━━━━━━━━━━━━━━");
  sections.push("");

  // Campaign
  sections.push("CAMPAIGN");
  sections.push(brief.campaign_name);
  sections.push("");

  // Type
  sections.push("TYPE");
  sections.push(isManual ? "Designer Brief" : "AI Generated");
  sections.push("");

  // Status
  sections.push("STATUS");
  sections.push(`${asset.status} — ready for design polish`);
  sections.push("");

  // Deadline
  sections.push("DEADLINE");
  sections.push(deadlineStr);
  sections.push("");

  sections.push("━━━━━━━━━━━━━━━━━━━━");
  sections.push("");

  // Headline
  if (asset.headline) {
    sections.push("HEADLINE (final copy)");
    sections.push(asset.headline);
    sections.push("");
  }

  // Overlay title
  sections.push("OVERLAY / TITLE ON POST");
  sections.push(brief.overlay_title || "No overlay title — clean image");
  sections.push("");

  // Body copy
  if (asset.body) {
    sections.push("BODY COPY (final)");
    sections.push(asset.body);
    sections.push("");
  }

  // Hashtags
  if (asset.hashtags && asset.hashtags.length > 0) {
    sections.push("HASHTAGS");
    sections.push(asset.hashtags.join("  "));
    sections.push("");
  }

  sections.push("━━━━━━━━━━━━━━━━━━━━");
  sections.push("");

  // Designer instructions (manual briefs)
  if (brief.designer_instructions) {
    sections.push("DESIGNER INSTRUCTIONS");
    sections.push(brief.designer_instructions);
    sections.push("");
  }

  // Illustration brief
  if (asset.illustration_desc) {
    sections.push("ILLUSTRATION BRIEF");
    sections.push(asset.illustration_desc);
    sections.push("");
  }

  sections.push("━━━━━━━━━━━━━━━━━━━━");
  sections.push("");

  // Design direction
  sections.push("DESIGN DIRECTION");
  sections.push(`Platform: ${platform?.label || asset.platform} (${width}x${height})`);
  if (tpl) sections.push(`Template: ${tpl.label}`);
  sections.push(`Audience: ${icp?.label || brief.icp} / ${sen?.label || brief.seniority}`);
  sections.push("Tone: Professional, conversational");
  sections.push("Brand colors: #7B59FF (primary), #1f2128 (dark), #FFD93D (accent)");
  sections.push("Font: DM Sans");
  sections.push("");

  // Designer notes
  sections.push("DESIGNER NOTES");
  notes.forEach((n, i) => sections.push(`${i + 1}. ${n}`));

  return sections.join("\n");
}

/**
 * Find the "From Code" page in the Figma file, or fall back to the first page.
 */
async function findTargetPage(fileKey: string, token: string): Promise<{ id: string; name: string }> {
  const res = await fetch(`${FIGMA_API}/files/${fileKey}?depth=1`, {
    headers: { "X-Figma-Token": token },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Figma API error (${res.status}): ${err}`);
  }

  const data = await res.json();
  const pages = data.document?.children || [];

  // Prefer "From Code" page, fall back to first page
  const fromCodePage = pages.find((p: { name: string }) =>
    p.name.toLowerCase().includes("from code")
  );

  if (fromCodePage) {
    return { id: fromCodePage.id, name: fromCodePage.name };
  }

  if (pages.length > 0) {
    return { id: pages[0].id, name: pages[0].name };
  }

  throw new Error("No pages found in Figma file");
}

/**
 * Post a comment on the Figma file with the design brief.
 */
async function postFigmaComment(
  fileKey: string,
  token: string,
  message: string,
  pageNodeId: string,
  offsetX: number,
  offsetY: number
): Promise<{ id: string }> {
  const res = await fetch(`${FIGMA_API}/files/${fileKey}/comments`, {
    method: "POST",
    headers: {
      "X-Figma-Token": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      client_meta: {
        node_id: pageNodeId,
        node_offset: { x: offsetX, y: offsetY },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Figma comment failed (${res.status}): ${err}`);
  }

  const data = await res.json();
  return { id: data.id };
}

/**
 * Push approved assets to Figma as comments with full design briefs.
 * Each asset gets a comment pinned to the "From Code" page with:
 * - Full design brief (headline, body, hashtags, design direction)
 * - Illustration URL
 * - Platform dimensions and designer notes
 */
export async function pushToFigma(
  assets: Asset[],
  brief: Brief,
  event?: Event | null
): Promise<FigmaNode[]> {
  const token = process.env.FIGMA_ACCESS_TOKEN;
  const fileKey = process.env.FIGMA_FILE_KEY;
  if (!token || !fileKey) {
    throw new Error("Figma credentials not configured. Add FIGMA_ACCESS_TOKEN and FIGMA_FILE_KEY to .env.local");
  }

  // Find the target page in Figma
  const targetPage = await findTargetPage(fileKey, token);
  console.log(`[Figma Push] Target page: "${targetPage.name}" (${targetPage.id})`);

  const results: FigmaNode[] = [];

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    const pillar = PILLARS.find((p) => p.id === asset.pillar);

    const frameName = `${pillar?.label || asset.pillar} — ${asset.headline.slice(0, 40)}`;
    const platform = PLATFORMS.find((p) => p.id === asset.platform);
    const [width, height] = (platform?.imageSize || "1200x675").split("x").map(Number);

    // Build a concise comment (Figma has a ~1KB limit on comments)
    const messageParts = [
      `📋 ${brief.campaign_name}`,
      `${pillar?.label || asset.pillar} | ${platform?.label || asset.platform} (${width}x${height})`,
      "",
      `HEADLINE: ${asset.headline}`,
      "",
      `BODY: ${asset.body.slice(0, 200)}${asset.body.length > 200 ? "..." : ""}`,
    ];

    if (asset.hashtags?.length > 0) {
      messageParts.push("", asset.hashtags.join(" "));
    }

    if (asset.illustration_url && !asset.illustration_url.startsWith("data:")) {
      messageParts.push("", `Illustration: ${asset.illustration_url}`);
    } else if (asset.illustration_url) {
      messageParts.push("", "Illustration: [base64 image — view in Monto Studio]");
    }

    if (brief.overlay_title) {
      messageParts.push("", `Overlay: "${brief.overlay_title}"`);
    }

    messageParts.push("", `Template: ${asset.template} | Brand: #7B59FF #1F2128 #FFD93D`);

    const message = messageParts.join("\n");

    // Post comment to Figma — offset each by 400px so they don't overlap
    const offsetX = 100 + (i * 400);
    const offsetY = 100;

    try {
      const comment = await postFigmaComment(
        fileKey,
        token,
        message,
        targetPage.id,
        offsetX,
        offsetY
      );

      console.log(`[Figma Push] Created comment ${comment.id} for "${frameName}"`);

      results.push({
        id: comment.id,
        name: frameName,
      });
    } catch (err) {
      console.error(`[Figma Push] Failed for "${frameName}":`, err);
      // Continue with other assets even if one fails
      results.push({
        id: `error-${asset.id}`,
        name: `${frameName} (failed)`,
      });
    }
  }

  return results;
}
