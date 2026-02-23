import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * Mark assets as created in Figma (set figma_frame_id to 'created').
 */
export async function POST(request: Request) {
  const { asset_ids } = await request.json();
  const supabase = createServerClient();

  for (const id of asset_ids) {
    await supabase
      .from("assets")
      .update({ figma_frame_id: "created" })
      .eq("id", id);
  }

  return NextResponse.json(
    { success: true },
    { headers: CORS_HEADERS }
  );
}
