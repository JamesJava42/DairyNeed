import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function requireAdmin(req: Request): boolean {
  const key = req.headers.get("x-admin-key");
  return key === process.env.ADMIN_KEY;
}

export async function GET(req: Request) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  if (!date) return NextResponse.json({ error: "MISSING_DATE" }, { status: 400 });

  const ordersRes = await supabase
    .from("orders")
    .select("*")
    .eq("scheduled_date", date)
    .order("created_at", { ascending: false });

  if (ordersRes.error) return NextResponse.json({ error: ordersRes.error.message }, { status: 500 });

  const subsRes = await supabase
    .from("subscriptions")
    .select("*")
    .eq("status", "ACTIVE")
    .eq("next_delivery_date", date)
    .order("created_at", { ascending: false });

  if (subsRes.error) return NextResponse.json({ error: subsRes.error.message }, { status: 500 });

  return NextResponse.json({
    date,
    one_time_orders: ordersRes.data,
    subscriptions_due: subsRes.data,
  });
}
