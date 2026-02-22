export async function generateImage(
  illustrationDesc: string,
  platform: string,
  referenceImages?: string[]
): Promise<string | null> {
  const aspectMap: Record<string, string> = {
    linkedin: "16:9",
    twitter: "16:9",
    instagram: "1:1",
    email: "16:9",
    blog: "16:9",
  };

  const aspectRatio = aspectMap[platform] || "16:9";

  const hasRefs = referenceImages && referenceImages.length > 0;

  const imagePrompt = hasRefs
    ? `Generate an image in the exact same visual style as the reference images provided. Match the color treatment, composition style, typography placement, and overall aesthetic.

Subject: ${illustrationDesc}

Keep the same mood, layout patterns, and design language as the references. Output a single finished marketing visual suitable for ${platform}.`
    : `Create a clean, modern illustration for a B2B fintech marketing post by Monto.

Style guidelines:
- Minimalist vector-style illustration with soft shadows and generous white space
- Color palette: primary purple (#7B59FF), dark text (#1f2128), yellow accent (#FFD93D), white background
- Clean geometric shapes, floating UI elements, subtle 3D depth
- No text, no words, no letters in the image
- No photorealistic elements, no human faces, no photographs
- Professional and modern, suitable for LinkedIn B2B audience

Subject: ${illustrationDesc}`;

  // Nano Banana Pro (Gemini 3 Pro Image)
  if (process.env.GOOGLE_API_KEY) {
    try {
      // Build multimodal parts: reference images first, then text prompt
      const parts: Array<Record<string, unknown>> = [];

      if (hasRefs) {
        for (const ref of referenceImages) {
          // Strip data URI prefix if present (e.g. "data:image/png;base64,...")
          const base64Data = ref.includes(",") ? ref.split(",")[1] : ref;
          const mimeType = ref.startsWith("data:image/jpeg") ? "image/jpeg" : "image/png";
          parts.push({
            inlineData: {
              mimeType,
              data: base64Data,
            },
          });
        }
      }

      parts.push({ text: imagePrompt });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": process.env.GOOGLE_API_KEY,
          },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              responseModalities: ["TEXT", "IMAGE"],
              imageConfig: {
                aspectRatio,
              },
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0]?.content?.parts;
        if (candidate) {
          for (const part of candidate) {
            if (part.inlineData?.data) {
              const mime = part.inlineData.mimeType || "image/png";
              return `data:${mime};base64,${part.inlineData.data}`;
            }
          }
        }
        console.warn("Nano Banana Pro returned no image in response");
      } else {
        const errText = await response.text();
        console.error("Nano Banana Pro error:", response.status, errText.slice(0, 300));
      }
    } catch (e) {
      console.error("Nano Banana Pro failed, trying DALL-E fallback:", e);
    }
  }

  // Fallback: DALL-E 3
  if (process.env.OPENAI_API_KEY) {
    try {
      const size = aspectRatio === "1:1" ? "1024x1024" : "1792x1024";
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: imagePrompt,
          n: 1,
          size,
          response_format: "url",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.data?.[0]?.url ?? null;
      } else {
        const errText = await response.text();
        console.error("DALL-E 3 error:", response.status, errText.slice(0, 300));
      }
    } catch (e) {
      console.error("DALL-E fallback also failed:", e);
    }
  }

  // Both failed — return null, UI will show placeholder
  return null;
}
