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
  if (body.scheduled_date !== undefined) updates.scheduled_date = body.scheduled_date;
  if (body.scheduled_time !== undefined) updates.scheduled_time = body.scheduled_time;
  if (body.status !== undefined) updates.status = body.status;
  if (body.lane_order !== undefined) updates.lane_order = body.lane_order;
  if (body.platform !== undefined) updates.platform = body.platform;

  const { data, error } = await supabase
    .from("scheduled_items")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServerClient();

  // Delete recurrence children first
  await supabase
    .from("scheduled_items")
    .delete()
    .eq("recurrence_parent_id", id);

  // Delete the item itself
  const { error } = await supabase
    .from("scheduled_items")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
