import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { isDeliveryZipAllowed } from "@/lib/zip";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function requireAdmin(req: Request): boolean {
  const key = req.headers.get("x-admin-key");
  return key === process.env.ADMIN_KEY;
}

export async function GET(req: Request) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const res = await supabaseAdmin
  .from("orders")
  .select("*")
  .order("created_at", { ascending: false })
  .limit(200);


  if (res.error) return NextResponse.json({ error: res.error.message }, { status: 500 });
  return NextResponse.json({ orders: res.data });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      customer_name,
      phone,
      fulfillment_type,
      address,
      city,
      state,
      zip,
      scheduled_date,
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
      scheduled_date: string;
      time_window?: string;
      items: { product_id: string; qty: number }[];
    };

    if (!customer_name || !phone || !fulfillment_type || !scheduled_date || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });
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
      .select("id")
      .eq("is_active", true)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (storeRes.error || !storeRes.data) {
      return NextResponse.json({ error: storeRes.error?.message ?? "STORE_NOT_FOUND" }, { status: 500 });
    }

    const ids = Array.from(new Set(items.map((i) => i.product_id)));
    const productsRes = await supabase
      .from("products")
      .select("id,price,is_active")
      .in("id", ids);

    if (productsRes.error) {
      return NextResponse.json({ error: productsRes.error.message }, { status: 500 });
    }

    // validate all ids exist + active
    const activeMap = new Map(productsRes.data.map((p) => [p.id, { price: Number(p.price), is_active: !!(p as any).is_active }]));
    for (const id of ids) {
      const entry = activeMap.get(id);
      if (!entry) {
        return NextResponse.json({ error: "PRODUCT_NOT_FOUND", message: "A product in your cart is no longer available." }, { status: 400 });
      }
      // If your select doesn't include is_active in schema, remove this check.
      if (!entry.is_active) {
        return NextResponse.json({ error: "PRODUCT_INACTIVE", message: "A product in your cart is currently unavailable." }, { status: 400 });
      }
    }

    let total = 0;
    const orderItems = items.map((i) => {
      const entry = activeMap.get(i.product_id)!;
      const qty = Math.max(1, Number(i.qty || 1));
      const unit = entry.price;
      const line = unit * qty;
      total += line;
      return { product_id: i.product_id, qty, unit_price: unit, line_total: Number(line.toFixed(2)) };
    });

    // Create order first
    const orderRes = await supabase
      .from("orders")
      .insert({
        store_id: storeRes.data.id,
        customer_name,
        phone,
        fulfillment_type,
        address: fulfillment_type === "delivery" ? address ?? null : null,
        city: fulfillment_type === "delivery" ? city ?? "Long Beach" : null,
        state: fulfillment_type === "delivery" ? state ?? "CA" : null,
        zip: fulfillment_type === "delivery" ? zip ?? null : null,
        scheduled_date,
        time_window: time_window ?? null,
        payment_method: "COD",
        status: "NEW",
        total: Number(total.toFixed(2)),
      })
      .select("id,status,total")
      .single();

    if (orderRes.error || !orderRes.data) {
      return NextResponse.json({ error: orderRes.error?.message ?? "ORDER_CREATE_FAILED" }, { status: 500 });
    }

    // Insert items
    const itemsRes = await supabase
      .from("order_items")
      .insert(orderItems.map((oi) => ({ ...oi, order_id: orderRes.data.id })));

    if (itemsRes.error) {
      // rollback order if items insert fails
      await supabase.from("orders").delete().eq("id", orderRes.data.id);
      return NextResponse.json({ error: itemsRes.error.message, message: "Order failed. Please try again." }, { status: 500 });
    }

    return NextResponse.json({
      order_id: orderRes.data.id,
      status: orderRes.data.status,
      total: orderRes.data.total,
      message: "Order placed. We will confirm by text/call.",
    });
  } catch (e) {
    return NextResponse.json({ error: "SERVER_ERROR", message: "Something went wrong. Please try again." }, { status: 500 });
  }
}
