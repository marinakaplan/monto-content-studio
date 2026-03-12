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

  if (body.publish_status) {
    updates.publish_status = body.publish_status;

    if (body.publish_status === "copied") {
      updates.copied_at = new Date().toISOString();
    }
    if (body.publish_status === "published") {
      updates.published_at = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from("publishing_formats")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
