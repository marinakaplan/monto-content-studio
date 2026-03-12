import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const supabase = createServerClient();

  const updatePayload: Record<string, unknown> = {};

  // Handle claim
  if (body.claimed_by !== undefined) {
    updatePayload.claimed_by = body.claimed_by;
    updatePayload.claimed_at = body.claimed_by ? new Date().toISOString() : null;
    if (body.claimed_by) {
      updatePayload.status = "claimed";
    }
  }

  // Handle rewrite content
  if (body.rewritten_headline !== undefined) updatePayload.rewritten_headline = body.rewritten_headline;
  if (body.rewritten_body !== undefined) updatePayload.rewritten_body = body.rewritten_body;
  if (body.rewritten_hashtags !== undefined) updatePayload.rewritten_hashtags = body.rewritten_hashtags;

  // Handle approval status
  if (body.approval_status !== undefined) updatePayload.approval_status = body.approval_status;

  // Handle status
  if (body.status !== undefined) updatePayload.status = body.status;

  const { data, error } = await supabase
    .from("advocacy_queue")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
