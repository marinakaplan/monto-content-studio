// Monto Studio — Figma Plugin (sandbox code)
// Creates design handoff frames from approved campaign assets

figma.showUI(__html__, { width: 360, height: 480, themeColors: true });

const BRAND = {
  primary: { r: 0.482, g: 0.349, b: 1 },       // #7B59FF
  dark: { r: 0.122, g: 0.129, b: 0.157 },       // #1F2128
  gold: { r: 1, g: 0.851, b: 0.239 },            // #FFD93D
  white: { r: 1, g: 1, b: 1 },
  bg: { r: 0.973, g: 0.976, b: 0.984 },          // #f8f9fb
  border: { r: 0.902, g: 0.906, b: 0.922 },      // #e6e7eb
  muted: { r: 0.329, g: 0.357, b: 0.427 },       // #545b6d
  sectionBg: { r: 0.937, g: 0.922, b: 1 },       // #EFEBFF
};

figma.ui.onmessage = async (msg) => {
  if (msg.type === "create-frames") {
    try {
      await createHandoffFrames(msg.data, msg.images);
      figma.ui.postMessage({
        type: "done",
        count: msg.data.assets.length,
        assetIds: msg.assetIds || [],
        apiBase: msg.apiBase || "",
      });
    } catch (err) {
      figma.ui.postMessage({ type: "error", message: String(err) });
    }
  }
};

async function createHandoffFrames(data, images) {
  const { brief, assets } = data;

  // Load fonts
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });

  let offsetY = 0;

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    const imageBytes = images[i];
    const platform = data.constants?.platforms?.find((p) => p.id === asset.platform);
    const pillar = data.constants?.pillars?.find((p) => p.id === asset.pillar);
    const dims = platform ? platform.imageSize.split("x") : ["1200", "675"];
    const imgW = 480;
    const imgH = Math.round(imgW * (parseInt(dims[1]) / parseInt(dims[0])));

    // ── Outer frame ──
    const outer = figma.createFrame();
    outer.name = `${pillar?.label || asset.pillar} — ${asset.headline.slice(0, 50)}`;
    outer.layoutMode = "VERTICAL";
    outer.primaryAxisSizingMode = "AUTO";
    outer.counterAxisSizingMode = "AUTO";
    outer.fills = [{ type: "SOLID", color: BRAND.white }];
    outer.strokes = [{ type: "SOLID", color: BRAND.border }];
    outer.strokeWeight = 1;
    outer.cornerRadius = 12;
    outer.x = 0;
    outer.y = offsetY;

    // ── Header bar ──
    const header = figma.createFrame();
    header.name = "Header";
    header.layoutMode = "HORIZONTAL";
    header.primaryAxisSizingMode = "FIXED";
    header.counterAxisSizingMode = "AUTO";
    header.resize(880, 1);
    header.primaryAxisAlignItems = "SPACE_BETWEEN";
    header.counterAxisAlignItems = "CENTER";
    header.paddingLeft = 24;
    header.paddingRight = 24;
    header.paddingTop = 16;
    header.paddingBottom = 16;
    header.fills = [{ type: "SOLID", color: BRAND.primary }];
    header.topLeftRadius = 12;
    header.topRightRadius = 12;

    const headerText = figma.createText();
    headerText.characters = "MONTO STUDIO — Design Handoff";
    headerText.fontName = { family: "Inter", style: "Bold" };
    headerText.fontSize = 13;
    headerText.fills = [{ type: "SOLID", color: BRAND.white }];
    headerText.letterSpacing = { value: 4, unit: "PERCENT" };
    header.appendChild(headerText);

    const campaignText = figma.createText();
    campaignText.characters = brief.campaign_name;
    campaignText.fontName = { family: "Inter", style: "Medium" };
    campaignText.fontSize = 12;
    campaignText.fills = [{ type: "SOLID", color: { r: 0.85, g: 0.8, b: 1 } }];
    header.appendChild(campaignText);

    outer.appendChild(header);

    // ── Body row: image left, brief right ──
    const bodyRow = figma.createFrame();
    bodyRow.name = "Body";
    bodyRow.layoutMode = "HORIZONTAL";
    bodyRow.primaryAxisSizingMode = "AUTO";
    bodyRow.counterAxisSizingMode = "AUTO";
    bodyRow.itemSpacing = 0;
    bodyRow.fills = [];

    // ── Left: Illustration ──
    const leftCol = figma.createFrame();
    leftCol.name = "Illustration";
    leftCol.resize(imgW, Math.max(imgH, 600));
    leftCol.layoutMode = "VERTICAL";
    leftCol.primaryAxisSizingMode = "FIXED";
    leftCol.counterAxisSizingMode = "FIXED";
    leftCol.fills = [{ type: "SOLID", color: BRAND.bg }];
    leftCol.paddingLeft = 24;
    leftCol.paddingRight = 24;
    leftCol.paddingTop = 24;
    leftCol.paddingBottom = 24;

    if (imageBytes && imageBytes.length > 0) {
      const img = figma.createImage(new Uint8Array(imageBytes));
      const rect = figma.createRectangle();
      rect.name = "Illustration Image";
      rect.resize(imgW - 48, imgH - 48);
      rect.fills = [{ type: "IMAGE", imageHash: img.hash, scaleMode: "FILL" }];
      rect.cornerRadius = 8;
      leftCol.appendChild(rect);
    } else {
      const placeholder = figma.createText();
      placeholder.characters = "[Illustration — view in Monto Studio]";
      placeholder.fontName = { family: "Inter", style: "Regular" };
      placeholder.fontSize = 13;
      placeholder.fills = [{ type: "SOLID", color: BRAND.muted }];
      leftCol.appendChild(placeholder);
    }

    bodyRow.appendChild(leftCol);

    // ── Right: Design Brief ──
    const rightCol = figma.createFrame();
    rightCol.name = "Design Brief";
    rightCol.resize(400, Math.max(imgH, 600));
    rightCol.layoutMode = "VERTICAL";
    rightCol.primaryAxisSizingMode = "FIXED";
    rightCol.counterAxisSizingMode = "FIXED";
    rightCol.itemSpacing = 16;
    rightCol.paddingLeft = 28;
    rightCol.paddingRight = 28;
    rightCol.paddingTop = 24;
    rightCol.paddingBottom = 24;
    rightCol.fills = [{ type: "SOLID", color: BRAND.white }];

    // Title
    addText(rightCol, "DESIGN BRIEF", 14, "Bold", BRAND.primary, 6);

    // Meta line
    const metaLine = `${pillar?.label || asset.pillar}  |  ${platform?.label || asset.platform}  |  ${platform?.imageSize || "1200x675"}`;
    addText(rightCol, metaLine, 11, "Medium", BRAND.muted);

    // Template
    addText(rightCol, `Template: ${asset.template}`, 11, "Regular", BRAND.muted);

    // Divider
    addDivider(rightCol, 344);

    // Headline
    addText(rightCol, "HEADLINE", 9, "Bold", BRAND.muted, 3);
    addText(rightCol, asset.headline, 16, "Semi Bold", BRAND.dark);

    // Divider
    addDivider(rightCol, 344);

    // Body copy
    addText(rightCol, "BODY COPY", 9, "Bold", BRAND.muted, 3);
    addText(rightCol, asset.body, 12, "Regular", BRAND.dark, 5);

    // Hashtags
    if (asset.hashtags && asset.hashtags.length > 0) {
      addDivider(rightCol, 344);
      addText(rightCol, "HASHTAGS", 9, "Bold", BRAND.muted, 3);
      addText(rightCol, asset.hashtags.join("  "), 11, "Medium", BRAND.primary);
    }

    // Illustration brief
    if (asset.illustration_desc) {
      addDivider(rightCol, 344);
      addText(rightCol, "ILLUSTRATION BRIEF", 9, "Bold", BRAND.muted, 3);
      addText(rightCol, asset.illustration_desc, 11, "Regular", BRAND.muted, 4);
    }

    // Designer instructions
    if (brief.designer_instructions) {
      addDivider(rightCol, 344);
      addText(rightCol, "DESIGNER NOTES", 9, "Bold", BRAND.muted, 3);
      addText(rightCol, brief.designer_instructions, 11, "Regular", BRAND.dark, 4);
    }

    // Brand colors
    addDivider(rightCol, 344);
    addText(rightCol, "BRAND COLORS", 9, "Bold", BRAND.muted, 3);

    const swatchRow = figma.createFrame();
    swatchRow.name = "Color Swatches";
    swatchRow.layoutMode = "HORIZONTAL";
    swatchRow.primaryAxisSizingMode = "AUTO";
    swatchRow.counterAxisSizingMode = "AUTO";
    swatchRow.itemSpacing = 8;
    swatchRow.fills = [];

    const colors = [
      { hex: "#7B59FF", label: "Primary", color: BRAND.primary },
      { hex: "#1F2128", label: "Dark", color: BRAND.dark },
      { hex: "#FFD93D", label: "Accent", color: BRAND.gold },
    ];

    for (const c of colors) {
      const swatch = figma.createFrame();
      swatch.layoutMode = "HORIZONTAL";
      swatch.primaryAxisSizingMode = "AUTO";
      swatch.counterAxisSizingMode = "AUTO";
      swatch.itemSpacing = 6;
      swatch.counterAxisAlignItems = "CENTER";
      swatch.fills = [];

      const rect = figma.createRectangle();
      rect.resize(16, 16);
      rect.fills = [{ type: "SOLID", color: c.color }];
      rect.cornerRadius = 3;
      swatch.appendChild(rect);

      const label = figma.createText();
      label.characters = c.hex;
      label.fontName = { family: "Inter", style: "Regular" };
      label.fontSize = 10;
      label.fills = [{ type: "SOLID", color: BRAND.muted }];
      swatch.appendChild(label);

      swatchRow.appendChild(swatch);
    }

    rightCol.appendChild(swatchRow);

    // Font
    addText(rightCol, "Font: Inter  |  Export: PNG @2x", 10, "Regular", BRAND.muted);

    bodyRow.appendChild(rightCol);
    outer.appendChild(bodyRow);

    figma.currentPage.appendChild(outer);
    offsetY += outer.height + 60;
  }

  // Scroll to the first created frame
  figma.viewport.scrollAndZoomIntoView(figma.currentPage.children.slice(-assets.length));
  figma.notify(`Created ${assets.length} design handoff frame${assets.length > 1 ? "s" : ""}`);
}

function addText(parent, chars, size, style, color, spacing) {
  const node = figma.createText();
  node.characters = chars || "";
  node.fontName = { family: "Inter", style: style };
  node.fontSize = size;
  node.fills = [{ type: "SOLID", color: color }];
  if (size >= 12) {
    node.lineHeight = { value: size * 1.5, unit: "PIXELS" };
  }
  node.layoutSizingHorizontal = "FILL";
  if (spacing) {
    node.letterSpacing = { value: spacing, unit: "PERCENT" };
  }
  parent.appendChild(node);
  return node;
}

function addDivider(parent, width) {
  const line = figma.createRectangle();
  line.name = "Divider";
  line.resize(width, 1);
  line.fills = [{ type: "SOLID", color: BRAND.border }];
  parent.appendChild(line);
}
