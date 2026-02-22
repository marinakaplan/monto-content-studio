import { SYSTEM_PROMPT } from "./system-prompt";
import { buildUserPrompt } from "./prompt-builder";
import type { Brief } from "./supabase";

type Variant = {
  pillar: string;
  headline: string;
  body: string;
  template: string;
  illustration_desc: string;
  hashtags: string[];
};

export type GenerationMeta = {
  prompt: string;
  rawResponse: string;
  model: string;
  tokens: {
    input_tokens?: number;
    output_tokens?: number;
  };
  durationMs: number;
};

type GenerationResult = {
  variants: Variant[];
  _meta: GenerationMeta;
};

/**
 * Tool schema for structured JSON output.
 * Using tool_use forces Claude to return valid, parseable JSON
 * instead of free-form text that may contain unescaped quotes,
 * multiple JSON objects, or other formatting issues.
 */
const CONTENT_TOOL = {
  name: "generate_content",
  description: "Output the generated social media content variants as structured data.",
  input_schema: {
    type: "object" as const,
    properties: {
      variants: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            pillar: {
              type: "string" as const,
              description: "Content pillar: thought, milestone, culture, or product",
            },
            headline: {
              type: "string" as const,
              description: "The post headline / hook",
            },
            body: {
              type: "string" as const,
              description: "The full post body copy",
            },
            template: {
              type: "string" as const,
              description: "Visual template: vortex, maze, engine, or target",
            },
            illustration_desc: {
              type: "string" as const,
              description: "Description of the illustration to create",
            },
            hashtags: {
              type: "array" as const,
              items: { type: "string" as const },
              description: "Hashtags for the post",
            },
          },
          required: ["pillar", "headline", "body", "template", "illustration_desc", "hashtags"],
        },
      },
    },
    required: ["variants"],
  },
};

export async function generateCopy(brief: Brief): Promise<GenerationResult> {
  const userPrompt = buildUserPrompt(brief);
  const startTime = Date.now();

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": (process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || "").trim(),
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      // Force structured JSON output via tool_use — eliminates all JSON parse errors
      tools: [CONTENT_TOOL],
      tool_choice: { type: "tool", name: "generate_content" },
    }),
  });

  const durationMs = Date.now() - startTime;

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error: ${response.status} — ${err}`);
  }

  const data = await response.json();

  // Extract the tool_use block — its `input` is already parsed, valid JSON
  const toolUseBlock = data.content?.find(
    (block: { type: string }) => block.type === "tool_use"
  );

  if (!toolUseBlock?.input?.variants) {
    // Fallback: try text content in case tool_use wasn't returned
    const textBlock = data.content?.find(
      (block: { type: string }) => block.type === "text"
    );
    if (textBlock?.text) {
      const parsed = fallbackParseJSON(textBlock.text);
      return {
        variants: parsed.variants,
        _meta: buildMeta(userPrompt, textBlock.text, data, durationMs),
      };
    }
    throw new Error("No tool_use or text content in Claude response");
  }

  const parsed = toolUseBlock.input as { variants: Variant[] };

  return {
    variants: parsed.variants,
    _meta: buildMeta(userPrompt, JSON.stringify(parsed, null, 2), data, durationMs),
  };
}

function buildMeta(
  userPrompt: string,
  rawResponse: string,
  data: { usage?: { input_tokens?: number; output_tokens?: number } },
  durationMs: number
): GenerationMeta {
  return {
    prompt: `[SYSTEM]\n${SYSTEM_PROMPT}\n\n[USER]\n${userPrompt}`,
    rawResponse,
    model: "claude-3-haiku-20240307",
    tokens: {
      input_tokens: data.usage?.input_tokens,
      output_tokens: data.usage?.output_tokens,
    },
    durationMs,
  };
}

/**
 * Fallback JSON parser for when tool_use isn't available.
 * Handles markdown fences, multiple JSON objects, and unescaped characters.
 */
function fallbackParseJSON(text: string): { variants: Variant[] } {
  let cleaned = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();

  // Extract the outermost balanced JSON object
  const braceStart = cleaned.indexOf("{");
  if (braceStart !== -1) {
    let depth = 0;
    let inStr = false;
    let esc = false;
    for (let i = braceStart; i < cleaned.length; i++) {
      const c = cleaned[i];
      if (esc) { esc = false; continue; }
      if (c === "\\") { esc = true; continue; }
      if (c === '"') { inStr = !inStr; continue; }
      if (!inStr) {
        if (c === "{") depth++;
        else if (c === "}") { depth--; if (depth === 0) { cleaned = cleaned.slice(braceStart, i + 1); break; } }
      }
    }
  }

  try {
    return JSON.parse(cleaned);
  } catch {
    // Fix unescaped newlines/tabs inside string values
    let inString = false;
    let escaped = false;
    let fixed = "";
    for (let i = 0; i < cleaned.length; i++) {
      const ch = cleaned[i];
      if (escaped) { fixed += ch; escaped = false; continue; }
      if (ch === "\\") { fixed += ch; escaped = true; continue; }
      if (ch === '"') { inString = !inString; fixed += ch; continue; }
      if (inString && ch === "\n") { fixed += "\\n"; continue; }
      if (inString && ch === "\r") { fixed += "\\r"; continue; }
      if (inString && ch === "\t") { fixed += "\\t"; continue; }
      fixed += ch;
    }
    try {
      return JSON.parse(fixed);
    } catch (e2) {
      console.error("JSON parse failed. Cleaned text (first 800 chars):", cleaned.slice(0, 800));
      throw new Error(`Failed to parse Claude response as JSON: ${e2 instanceof Error ? e2.message : e2}`);
    }
  }
}
