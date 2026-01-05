import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function requireAdmin(req: Request) {
  return req.headers.get("x-admin-key") === process.env.ADMIN_KEY;
}

const ALLOWED = ["NEW", "CONFIRMED", "READY", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> } // <-- params is async in your Next version
) {
  if (!requireAdmin(req)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await ctx.params; // <-- unwrap params safely

  const body = await req.json();
  const status = body?.status;

  if (!ALLOWED.includes(status)) {
    return NextResponse.json({ error: "INVALID_STATUS" }, { status: 400 });
  }

  const res = await supabaseAdmin
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();

  if (res.error) {
    return NextResponse.json({ error: res.error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, order: res.data }, { status: 200 });
}
