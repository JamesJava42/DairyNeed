import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { isDeliveryZipAllowed } from "@/lib/zip";

function requireAdmin(req: Request): boolean {
  const key = req.headers.get("x-admin-key");
  return key === process.env.ADMIN_KEY;
}

export async function GET(req: Request) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const res = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (res.error) return NextResponse.json({ error: res.error.message }, { status: 500 });
  return NextResponse.json({ subscriptions: res.data });
}

export async function POST(req: Request) {
  const body = await req.json();

  const {
    customer_name,
    phone,
    fulfillment_type,
    address,
    city,
    state,
    zip,
    frequency,
    start_date,
    time_window,
    items,
  } = body as {
    customer_name: string;
    phone: string;
    fulfillment_type: "pickup" | "delivery";
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    frequency: "WEEKLY" | "BIWEEKLY";
    start_date: string;
    time_window?: string;
    items: { product_id: string; qty: number }[];
  };

  if (!customer_name || !phone || !fulfillment_type || !frequency || !start_date || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
  }

  if (!["WEEKLY", "BIWEEKLY"].includes(frequency)) {
    return NextResponse.json({ error: "INVALID_FREQUENCY" }, { status: 400 });
  }

  if (fulfillment_type === "delivery") {
    if (!zip || !isDeliveryZipAllowed(zip)) {
      return NextResponse.json(
        { error: "DELIVERY_NOT_AVAILABLE", message: "Delivery not available in your ZIP yet. Please choose pickup." },
        { status: 400 }
      );
    }
  }

  const storeRes = await supabase
    .from("stores")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  if (storeRes.error) return NextResponse.json({ error: storeRes.error.message }, { status: 500 });

  // Snapshot product prices into subscription_items
  const productIds = items.map((i) => i.product_id);
  const productsRes = await supabase.from("products").select("id,price").in("id", productIds);
  if (productsRes.error) return NextResponse.json({ error: productsRes.error.message }, { status: 500 });

  const priceMap = new Map(productsRes.data.map((p) => [p.id, Number(p.price)]));

  const subItems = items.map((i) => {
    const unit = priceMap.get(i.product_id);
    if (!unit) throw new Error("PRODUCT_NOT_FOUND");
    return {
      product_id: i.product_id,
      qty: Math.max(1, Number(i.qty || 1)),
      unit_price: unit,
    };
  });

  const subRes = await supabase
    .from("subscriptions")
    .insert({
      store_id: storeRes.data.id,
      customer_name,
      phone,
      fulfillment_type,
      address: fulfillment_type === "delivery" ? address ?? null : null,
      city: fulfillment_type === "delivery" ? city ?? "Long Beach" : null,
      state: fulfillment_type === "delivery" ? state ?? "CA" : null,
      zip: fulfillment_type === "delivery" ? zip ?? null : null,
      frequency,
      start_date,
      next_delivery_date: start_date, // phase 1: next = start
      time_window: time_window ?? null,
      status: "ACTIVE",
    })
    .select("id,status,next_delivery_date")
    .single();

  if (subRes.error) return NextResponse.json({ error: subRes.error.message }, { status: 500 });

  const itemsRes = await supabase
    .from("subscription_items")
    .insert(subItems.map((si) => ({ ...si, subscription_id: subRes.data.id })));

  if (itemsRes.error) return NextResponse.json({ error: itemsRes.error.message }, { status: 500 });

  return NextResponse.json({
    subscription_id: subRes.data.id,
    status: subRes.data.status,
    next_delivery_date: subRes.data.next_delivery_date,
    message: "Subscription created. We will confirm your first delivery/pickup.",
  });
}
