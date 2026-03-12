import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date_from = searchParams.get("date_from");
  const date_to = searchParams.get("date_to");
  const platform = searchParams.get("platform");
  const brief_id = searchParams.get("brief_id");

  const supabase = createServerClient();

  let query = supabase
    .from("scheduled_items")
    .select("*, briefs(campaign_name)")
    .order("scheduled_date", { ascending: true })
    .order("lane_order", { ascending: true });

  if (date_from) {
    query = query.gte("scheduled_date", date_from);
  }
  if (date_to) {
    query = query.lte("scheduled_date", date_to);
  }
  if (platform) {
    query = query.eq("platform", platform);
  }
  if (brief_id) {
    query = query.eq("brief_id", brief_id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const {
    brief_id,
    asset_id,
    platform,
    scheduled_date,
    scheduled_time,
    recurrence_rule,
  } = body;

  if (!brief_id || !platform || !scheduled_date) {
    return NextResponse.json(
      { error: "brief_id, platform, and scheduled_date are required" },
      { status: 400 }
    );
  }

  const supabase = createServerClient();

  // Create the primary scheduled item
  const { data: primary, error: primaryError } = await supabase
    .from("scheduled_items")
    .insert({
      brief_id,
      asset_id: asset_id || null,
      platform,
      scheduled_date,
      scheduled_time: scheduled_time || null,
      recurrence_rule: recurrence_rule || null,
      status: "scheduled",
    })
    .select()
    .single();

  if (primaryError) {
    return NextResponse.json({ error: primaryError.message }, { status: 500 });
  }

  const results = [primary];

  // If recurrence_rule is set, auto-generate future instances for next 6 months
  if (recurrence_rule === "monthly" || recurrence_rule === "quarterly") {
    const intervalMonths = recurrence_rule === "monthly" ? 1 : 3;
    const futureItems = [];
    const baseDate = new Date(scheduled_date);

    for (let i = 1; i <= (recurrence_rule === "monthly" ? 6 : 2); i++) {
      const futureDate = new Date(baseDate);
      futureDate.setMonth(futureDate.getMonth() + intervalMonths * i);

      // Stay within 6 months
      const sixMonthsOut = new Date(baseDate);
      sixMonthsOut.setMonth(sixMonthsOut.getMonth() + 6);
      if (futureDate > sixMonthsOut) break;

      futureItems.push({
        brief_id,
        asset_id: asset_id || null,
        platform,
        scheduled_date: futureDate.toISOString().split("T")[0],
        scheduled_time: scheduled_time || null,
        recurrence_rule,
        recurrence_parent_id: primary.id,
        status: "scheduled",
      });
    }

    if (futureItems.length > 0) {
      const { data: children, error: childError } = await supabase
        .from("scheduled_items")
        .insert(futureItems)
        .select();

      if (childError) {
        return NextResponse.json({ error: childError.message }, { status: 500 });
      }

      results.push(...(children || []));
    }
  }

  return NextResponse.json(results);
}
