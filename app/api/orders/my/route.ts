import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization") ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";

    if (!token) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const userId = data.user.id;

    const res = await supabaseAdmin
      .from("orders")
      .select("id, created_at, status, total, fulfillment_type, scheduled_date, time_window, items")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (res.error) {
      return NextResponse.json({ error: res.error.message }, { status: 500 });
    }

    return NextResponse.json({ orders: res.data ?? [] });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
