// app/api/orders/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendMail } from "@/lib/mailer";

export const dynamic = "force-dynamic";

function money(n: number) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "$0.00";
  return `$${x.toFixed(2)}`;
}

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

/**
 * ✅ Admin list orders (your admin page is calling this)
 */
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ orders: data ?? [] });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}

/**
 * ✅ Place order + send email
 * Expects:
 * customer_name, phone, customer_email, fulfillment_type, scheduled_date, time_window, address, zip, plan, items[]
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const customer_name = String(body.customer_name ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    const customer_email = String(body.customer_email ?? "").trim();

    const fulfillment_type = String(body.fulfillment_type ?? "").trim(); // pickup | delivery
    const scheduled_date = String(body.scheduled_date ?? "").trim();
    const time_window = String(body.time_window ?? "").trim();

    const address = String(body.address ?? "").trim();
    const apt = String(body.apt ?? "").trim();
    const city = String(body.city ?? "").trim();
    const state = String(body.state ?? "").trim();
    const zip = String(body.zip ?? "").trim();

    const plan = String(body.plan ?? "one_time");
    const items = Array.isArray(body.items) ? body.items : [];

    if (!customer_name) return NextResponse.json({ error: "Missing customer_name" }, { status: 400 });
    if (!phone) return NextResponse.json({ error: "Missing phone" }, { status: 400 });
    if (!customer_email) return NextResponse.json({ error: "Missing customer_email" }, { status: 400 });
    if (!isEmail(customer_email)) return NextResponse.json({ error: "Invalid customer_email" }, { status: 400 });
    if (!fulfillment_type) return NextResponse.json({ error: "Missing fulfillment_type" }, { status: 400 });
    if (!scheduled_date) return NextResponse.json({ error: "Missing scheduled_date" }, { status: 400 });
    if (!items.length) return NextResponse.json({ error: "Cart is empty" }, { status: 400 });

    // Build address string
    const address_full = apt ? `${address}, Apt ${apt}` : address;

    // Fetch product info for email + total
    const ids = items.map((i: any) => String(i.product_id));
    const { data: products, error: prodErr } = await supabaseAdmin
      .from("products")
      .select("id, name, size, price")
      .in("id", ids);

    if (prodErr) return NextResponse.json({ error: prodErr.message }, { status: 500 });

    const pmap = new Map<string, any>();
    for (const p of products ?? []) pmap.set(String(p.id), p);

    const lines = items.map((it: any) => {
      const p = pmap.get(String(it.product_id)) ?? { name: "Item", size: "", price: 0 };
      const qty = Number(it.qty || 0);
      const price = Number(p.price || 0);
      return {
        product_id: String(it.product_id),
        qty,
        name: String(p.name ?? "Item"),
        size: String(p.size ?? ""),
        price,
        line: qty * price,
      };
    });

    const total = lines.reduce((sum: number, x: any) => sum + Number(x.line || 0), 0);

    // Insert order (columns must exist in your orders table)
    const { data: order, error: insErr } = await supabaseAdmin
      .from("orders")
      .insert([
        {
          customer_name,
          phone,
          customer_email,
          fulfillment_type,
          scheduled_date,
          time_window: time_window || null,
          address: address_full || null,
          city: city || null,
          state: state || null,
          zip: zip || null,
          plan,
          total,
          items: items, // keep raw items array
          status: "NEW",
          source: String(body.source ?? "web"),
        },
      ])
      .select("id")
      .single();

    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

    const orderId = String(order.id);

    // Send email (do not fail order if email fails)
    try {
      const subject = `Rockview Dairy Order Confirmed • ${orderId}`;

      const itemsText = lines
        .map((x: any) => `- ${x.name} ${x.size ? `(${x.size})` : ""} • Qty ${x.qty} • ${money(x.line)}`)
        .join("\n");

      const text = `Order confirmed!

Confirmation: ${orderId}
Name: ${customer_name}
Phone: ${phone}
Email: ${customer_email}

Fulfillment: ${fulfillment_type}
Address: ${address_full || "Pickup"}
Scheduled: ${scheduled_date} ${time_window ? `(${time_window})` : ""}

Items:
${itemsText}

Total: ${money(total)}

Thank you!
Rockview Dairy`;

      const htmlRows = lines
        .map(
          (x: any) => `
            <tr>
              <td style="padding:8px 0;font-weight:700">${x.name} ${x.size ? `(${x.size})` : ""}</td>
              <td style="padding:8px 0;text-align:center">${x.qty}</td>
              <td style="padding:8px 0;text-align:right">${money(x.price)}</td>
              <td style="padding:8px 0;text-align:right;font-weight:800">${money(x.line)}</td>
            </tr>
          `
        )
        .join("");

      const html = `
        <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;color:#0f172a">
          <h2 style="margin:0 0 6px">Order confirmed ✅</h2>
          <div style="color:#475569;font-weight:700;margin-bottom:14px">Confirmation: ${orderId}</div>

          <div style="border:1px solid #e2e8f0;border-radius:16px;padding:12px;background:#f8fafc;margin-bottom:14px">
            <div><b>${customer_name}</b></div>
            <div>Phone: ${phone}</div>
            <div>Email: ${customer_email}</div>
            <div style="margin-top:8px"><b>${fulfillment_type.toUpperCase()}</b> • ${address_full || "Pickup"}</div>
            <div>Scheduled: <b>${scheduled_date}</b> ${time_window ? `• ${time_window}` : ""}</div>
          </div>

          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr style="border-bottom:1px solid #e2e8f0">
                <th style="text-align:left;padding:8px 0;color:#64748b">Item</th>
                <th style="text-align:center;padding:8px 0;color:#64748b">Qty</th>
                <th style="text-align:right;padding:8px 0;color:#64748b">Price</th>
                <th style="text-align:right;padding:8px 0;color:#64748b">Line</th>
              </tr>
            </thead>
            <tbody>${htmlRows}</tbody>
          </table>

          <div style="margin-top:12px;text-align:right;font-size:18px">
            Total: <b>${money(total)}</b>
          </div>
        </div>
      `;

      await sendMail({ to: customer_email, subject, html, text });

      const adminTo = process.env.ADMIN_NOTIFY_EMAIL;
      if (adminTo) {
        await sendMail({ to: adminTo, subject: `[ADMIN] ${subject}`, html, text });
      }
    } catch (e: any) {
      console.warn("Email failed:", e?.message ?? e);
    }

    return NextResponse.json({ order_id: orderId, total });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}
