import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const supabase = createServerClient();

  const updates: Record<string, unknown> = {};
  if (body.impressions !== undefined) updates.impressions = body.impressions;
  if (body.clicks !== undefined) updates.clicks = body.clicks;
  if (body.engagement !== undefined) updates.engagement = body.engagement;
  if (body.shares !== undefined) updates.shares = body.shares;
  if (body.conversions !== undefined) updates.conversions = body.conversions;
  if (body.notes !== undefined) updates.notes = body.notes;
  if (body.platform !== undefined) updates.platform = body.platform;

  const { data, error } = await supabase
    .from("campaign_scorecards")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
