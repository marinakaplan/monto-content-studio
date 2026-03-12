import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const assetId = searchParams.get("asset_id");
  const supabase = createServerClient();

  if (!assetId) {
    return NextResponse.json({ error: "asset_id is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("asset_id", assetId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Build threaded structure: top-level comments with nested replies
  const topLevel = (data || []).filter((c) => !c.parent_id);
  const replies = (data || []).filter((c) => c.parent_id);

  const threaded = topLevel.map((comment) => ({
    ...comment,
    replies: replies.filter((r) => r.parent_id === comment.id),
  }));

  return NextResponse.json(threaded);
}

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = createServerClient();

  if (!body.asset_id || !body.body) {
    return NextResponse.json(
      { error: "asset_id and body are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      asset_id: body.asset_id,
      body: body.body,
      parent_id: body.parent_id || null,
      author_name: body.author_name || "Anonymous",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
