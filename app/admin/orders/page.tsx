"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, Input, LinkChip, Button, cn } from "@/components/ui/ui";

const STATUSES = ["NEW", "CONFIRMED", "READY", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"] as const;
type Status = (typeof STATUSES)[number] | "ALL";

function pill(s: string) {
  const base = "inline-flex items-center rounded-full border px-3 py-1 text-xs font-extrabold";
  if (s === "DELIVERED") return cn(base, "bg-green-50 border-green-200 text-green-800");
  if (s === "CANCELLED") return cn(base, "bg-red-50 border-red-200 text-red-700");
  if (s === "OUT_FOR_DELIVERY") return cn(base, "bg-indigo-50 border-indigo-200 text-indigo-800");
  if (s === "READY") return cn(base, "bg-amber-50 border-amber-200 text-amber-800");
  if (s === "CONFIRMED") return cn(base, "bg-sky-50 border-sky-200 text-sky-800");
  return cn(base, "bg-slate-50 border-slate-200 text-slate-800");
}

async function readJsonSafe(res: Response) {
  const text = await res.text();
  try {
    return { ok: res.ok, status: res.status, data: JSON.parse(text), raw: text };
  } catch {
    return { ok: res.ok, status: res.status, data: null, raw: text };
  }
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState<Status>("ALL");
  const [q, setQ] = useState("");

  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [openId, setOpenId] = useState<string | null>(null);

  const adminKey = () => localStorage.getItem("ADMIN_KEY") || "";

  async function load() {
    setLoading(true);
    setErr(null);
    setNote(null);

    const res = await fetch("/api/orders", { headers: { "x-admin-key": adminKey() }, cache: "no-store" });
    const out = await readJsonSafe(res);

    if (!out.ok) {
      setErr(out.data?.error ?? `Failed to load orders (${out.status}).`);
      setLoading(false);
      return;
    }

    const list = out.data?.orders ?? [];
    setOrders(list);

    // initialize drafts
    const next: Record<string, string> = {};
    for (const o of list) next[o.id] = o.status ?? "NEW";
    setDraft(next);

    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function saveStatus(orderId: string) {
    const nextStatus = draft[orderId];
    if (!nextStatus) return;

    setErr(null);
    setNote(null);
    setSaving((s) => ({ ...s, [orderId]: true }));

    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey() },
      body: JSON.stringify({ status: nextStatus }),
    });

    const out = await readJsonSafe(res);

    if (!out.ok) {
      // If this ever shows HTML, it means the request hit a missing route or got an HTML error page.
      setErr(out.data?.error ?? `Update failed (${out.status}). ${String(out.raw).slice(0, 160)}`);
      setSaving((s) => ({ ...s, [orderId]: false }));
      return;
    }

    const updated = out.data?.order;
    if (updated?.id) {
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      setDraft((d) => ({ ...d, [updated.id]: updated.status }));
    }

    setNote("Saved ✅");
    setTimeout(() => setNote(null), 1200);
    setSaving((s) => ({ ...s, [orderId]: false }));
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: orders.length };
    for (const s of STATUSES) c[s] = 0;
    for (const o of orders) {
      const st = o?.status;
      if (st && c[st] !== undefined) c[st] += 1;
    }
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return orders.filter((o) => {
      const okStatus = statusFilter === "ALL" || o.status === statusFilter;

      const hay = [o.id, o.customer_name, o.phone, o.fulfillment_type, o.scheduled_date, o.zip]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const okText = !text || hay.includes(text);
      return okStatus && okText;
    });
  }, [orders, statusFilter, q]);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-2xl font-extrabold">Admin • Orders</div>
              <div className="text-slate-600 text-sm">Filter, search, expand rows, and update status with Save.</div>
            </div>

            <div className="flex gap-2">
              <button
                className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                onClick={load}
              >
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <LinkChip active={statusFilter === "ALL"} onClick={() => setStatusFilter("ALL")}>
              All ({counts.ALL ?? 0})
            </LinkChip>
            {STATUSES.map((s) => (
              <LinkChip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
                {s} ({counts[s] ?? 0})
              </LinkChip>
            ))}
          </div>

          <div className="max-w-xl">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, order id, ZIP…" />
          </div>

          {err && <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-red-700 font-semibold">{err}</div>}
          {note && <div className="rounded-2xl border border-green-200 bg-green-50 p-3 text-green-800 font-semibold">{note}</div>}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-12 gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-600">
            <div className="col-span-4">Customer</div>
            <div className="col-span-3">Schedule</div>
            <div className="col-span-2">Fulfillment</div>
            <div className="col-span-1 text-right">Total</div>
            <div className="col-span-2 text-right">Status</div>
          </div>

          {filtered.length === 0 ? (
            <div className="px-4 py-10 text-center text-slate-600">No orders found for this filter.</div>
          ) : (
            filtered.map((o) => {
              const isOpen = openId === o.id;
              const current = o.status ?? "NEW";
              const selected = draft[o.id] ?? current;
              const changed = selected !== current;

              return (
                <div key={o.id} className="border-b border-slate-100">
                  <div
                    className="grid grid-cols-12 gap-2 px-4 py-3 hover:bg-slate-50 cursor-pointer"
                    onClick={() => setOpenId(isOpen ? null : o.id)}
                  >
                    <div className="col-span-4 min-w-0">
                      <div className="truncate text-sm font-extrabold text-slate-900">
                        {o.customer_name} <span className="font-semibold text-slate-500">• {o.phone}</span>
                      </div>
                      <div className="truncate text-xs text-slate-500">{o.id}{o.zip ? ` • ZIP ${o.zip}` : ""}</div>
                    </div>

                    <div className="col-span-3">
                      <div className="text-sm font-semibold">{o.scheduled_date}</div>
                      <div className="text-xs text-slate-500">{o.time_window ?? ""}</div>
                    </div>

                    <div className="col-span-2">
                      <div className="text-sm font-semibold capitalize">{o.fulfillment_type}</div>
                      <div className="text-xs text-slate-500 truncate">
                        {o.fulfillment_type === "delivery" ? (o.address ?? "") : "Pickup"}
                      </div>
                    </div>

                    <div className="col-span-1 text-right">
                      <div className="text-sm font-extrabold">${Number(o.total).toFixed(2)}</div>
                    </div>

                    <div className="col-span-2 flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <span className={pill(current)}>{current}</span>
                    </div>
                  </div>

                  {isOpen ? (
                    <div className="px-4 pb-4">
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="text-xs font-bold text-slate-600">Order details</div>
                          <div className="mt-2 text-sm text-slate-800">
                            <div><span className="font-bold">Address:</span> {o.address ?? "—"}</div>
                            <div><span className="font-bold">ZIP:</span> {o.zip ?? "—"}</div>
                            <div><span className="font-bold">Created:</span> {o.created_at ?? "—"}</div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="text-xs font-bold text-slate-600">Update status</div>

                          <div className="mt-3 flex gap-2">
                            <select
                              className="flex-1 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold"
                              value={selected}
                              onChange={(e) => setDraft((d) => ({ ...d, [o.id]: e.target.value }))}
                            >
                              {STATUSES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>

                            <Button
                              variant={changed ? "primary" : "secondary"}
                              disabled={!changed || !!saving[o.id]}
                              onClick={() => saveStatus(o.id)}
                            >
                              {saving[o.id] ? "Saving…" : changed ? "Save" : "Saved"}
                            </Button>
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {["CONFIRMED","READY","OUT_FOR_DELIVERY","DELIVERED","CANCELLED"].map((s) => (
                              <button
                                key={s}
                                className="rounded-full border border-slate-200 px-3 py-2 text-xs font-bold hover:bg-slate-50"
                                onClick={() => setDraft((d) => ({ ...d, [o.id]: s }))}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
