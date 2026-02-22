import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const supabase = createServerClient();

  if (body.status) {
    const { error } = await supabase
      .from("assets")
      .update({ status: body.status })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  if (body.note) {
    const { error } = await supabase
      .from("notes")
      .insert({
        asset_id: id,
        content: body.note,
        author: "marketing",
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
