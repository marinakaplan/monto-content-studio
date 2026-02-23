import type { Asset, Brief } from "./supabase";
import { PILLARS, PLATFORMS } from "./constants";

const FIGMA_API = "https://api.figma.com/v1";

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

  const fromCodePage = pages.find((p: { name: string }) =>
    p.name.toLowerCase().includes("from code")
  );

  if (fromCodePage) return { id: fromCodePage.id, name: fromCodePage.name };
  if (pages.length > 0) return { id: pages[0].id, name: pages[0].name };
  throw new Error("No pages found in Figma file");
}

/**
 * Post a comment to Figma with the handoff link and summary.
 */
export async function postHandoffComment(
  assets: Asset[],
  brief: Brief,
  handoffUrl: string,
): Promise<{ commentId: string }> {
  const token = process.env.FIGMA_ACCESS_TOKEN;
  const fileKey = process.env.FIGMA_FILE_KEY;
  if (!token || !fileKey) {
    throw new Error("Figma credentials not configured. Add FIGMA_ACCESS_TOKEN and FIGMA_FILE_KEY to .env.local");
  }

  const targetPage = await findTargetPage(fileKey, token);

  // Build a concise comment
  const assetSummaries = assets.map((a) => {
    const pillar = PILLARS.find((p) => p.id === a.pillar);
    const platform = PLATFORMS.find((p) => p.id === a.platform);
    const [w, h] = (platform?.imageSize || "1200x675").split("x");
    return `  - ${pillar?.label || a.pillar} | ${platform?.label} (${w}x${h}): ${a.headline.slice(0, 60)}`;
  });

  const message = [
    `New handoff from Monto Studio`,
    `Campaign: ${brief.campaign_name}`,
    `${assets.length} asset${assets.length > 1 ? "s" : ""} approved`,
    ``,
    ...assetSummaries,
    ``,
    `Full handoff with illustrations & briefs:`,
    handoffUrl,
  ].join("\n");

  const res = await fetch(`${FIGMA_API}/files/${fileKey}/comments`, {
    method: "POST",
    headers: {
      "X-Figma-Token": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      client_meta: {
        node_id: targetPage.id,
        node_offset: { x: 100, y: 100 },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Figma comment failed (${res.status}): ${err}`);
  }

  const data = await res.json();
  return { commentId: data.id };
}
