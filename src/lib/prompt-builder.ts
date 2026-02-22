import type { Brief } from "./supabase";

const icpMap: Record<string, string> = {
  tech: "Tech & Business Services (500-5K employees, pain: portal volume)",
  manufacturing: "Manufacturing (2K-10K employees, pain: process complexity + portals)",
};

const seniorityMap: Record<string, string> = {
  manager: "Manager/Director level — focus on visibility, manual work reduction",
  executive: "VP/CFO level — focus on cash flow, predictability, DSO",
};

export function buildUserPrompt(brief: Brief): string {
  const pillarInstruction = brief.pillar
    ? `Generate 2 variants for the "${brief.pillar}" pillar.`
    : 'Generate one variant for EACH of these pillars: Thought Leadership, Milestone & News, Culture & Community, Customer Success, Product Updates.';

  const overlayInstruction = brief.overlay_title
    ? `\nOverlay Title: The following title text should appear on the post image: "${brief.overlay_title}". Factor this into the illustration description so the image composition accommodates the text overlay.`
    : "";

  return `
Campaign: ${brief.campaign_name}
ICP: ${icpMap[brief.icp]}
Seniority: ${seniorityMap[brief.seniority]}
Key Message: ${brief.key_message}
Platform: ${brief.platforms.join(", ")}
${brief.context ? `Additional Context: ${brief.context}` : ""}${overlayInstruction}

${pillarInstruction}

For each variant, respond in this JSON format:
{
  "variants": [
    {
      "pillar": "thought|milestone|culture|customer|product",
      "headline": "...",
      "body": "...",
      "template": "target|vortex|maze|engine|hero",
      "illustration_desc": "1-2 sentence description for image generation",
      "hashtags": ["#tag1", "#tag2", "#tag3"]
    }
  ]
}

Respond ONLY with the JSON. No preamble, no markdown fences.
`;
}
