import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../src/lib/supabaseAdmin";

const VERSION = "orders-route-2026-01-18-v3";

export async function GET() {
  return NextResponse.json({ ok: true, version: VERSION });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const customer_name = String(body.customer_name ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const address = String(body.address ?? "").trim();
    const zip = String(body.zip ?? "").trim();
    const plan = String(body.plan ?? "").trim();
    const items = body.items;
    const total = Number(body.total ?? 0);

    // required by DB
    const store_id = String(process.env.DEFAULT_STORE_ID ?? "").trim();
    const fulfillment_type = String(body.fulfillment_type ?? "delivery").trim(); // default for prototype

    if (!store_id) {
      return NextResponse.json({ error: "SERVER_MISSING_DEFAULT_STORE_ID", version: VERSION }, { status: 500 });
    }

    if (!customer_name || !phone || !address || zip.length < 5 || !plan) {
      return NextResponse.json({ error: "Missing required fields", version: VERSION }, { status: 400 });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty", version: VERSION }, { status: 400 });
    }
    if (!Number.isFinite(total) || total <= 0) {
      return NextResponse.json({ error: "Invalid total", version: VERSION }, { status: 400 });
    }
    if (fulfillment_type !== "delivery" && fulfillment_type !== "pickup") {
      return NextResponse.json({ error: "Invalid fulfillment_type", version: VERSION }, { status: 400 });
    }

    const insertRow: any = {
      store_id,
      customer_name,
      phone,
      fulfillment_type,
      address,
      zip,
      plan,
      items,
      total,
      source: "ios",
    };

    const { data, error } = await supabaseAdmin
      .from("orders")
      .insert([insertRow])
      .select("id")
      .single();

    if (error) return NextResponse.json({ error: error.message, version: VERSION }, { status: 500 });

    return NextResponse.json({ ok: true, order_id: data.id, version: VERSION });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error", version: VERSION }, { status: 500 });
  }
}
