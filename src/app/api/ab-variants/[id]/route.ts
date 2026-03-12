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
  if (body.was_published !== undefined) updates.was_published = body.was_published;
  if (body.metrics !== undefined) updates.metrics = body.metrics;

  const { data, error } = await supabase
    .from("ab_variants")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
