"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, Input, LinkChip } from "@/components/ui/ui";

const STATUSES = ["NEW", "CONFIRMED", "READY", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"] as const;
type Status = (typeof STATUSES)[number] | "ALL";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState<Status>("ALL");
  const [q, setQ] = useState("");

  const adminKey = () => localStorage.getItem("ADMIN_KEY") || "";

  async function load() {
    setLoading(true);
    setErr(null);

    const res = await fetch("/api/orders", { headers: { "x-admin-key": adminKey() } });
    const data = await res.json();

    if (!res.ok) {
      setErr(data.error ?? "Failed to load orders");
      setLoading(false);
      return;
    }

    setOrders(data.orders ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(orderId: string, status: string) {
    setErr(null);

    // optimistic update
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));

    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-key": adminKey() },
      body: JSON.stringify({ status }),
    });

    const data = await res.json();

    if (!res.ok) {
      await load(); // rollback
      setErr(data.error ?? "Failed to update status");
      return;
    }

    // update with server-confirmed row
    setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: orders.length };
    for (const s of STATUSES) c[s] = 0;
    for (const o of orders) {
      if (o?.status && c[o.status] !== undefined) c[o.status] += 1;
    }
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return orders.filter((o) => {
      const okStatus = statusFilter === "ALL" || o.status === statusFilter;

      const hay = [
        o.id,
        o.customer_name,
        o.phone,
        o.fulfillment_type,
        o.scheduled_date,
        o.zip,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const okText = !text || hay.includes(text);
      return okStatus && okText;
    });
  }, [orders, statusFilter, q]);

  return (
    <div className="space-y-4">
      {/* Header + Filters */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-2xl font-extrabold">Admin • Orders</div>
              <div className="text-slate-600 text-sm">
                Filter by status + search to find orders quickly.
              </div>
            </div>

            <button
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
              onClick={load}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {/* Filter chips */}
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

          {/* Search */}
          <div className="max-w-xl">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, phone, order id, ZIP…"
            />
          </div>

          {err && <div className="text-red-600 font-semibold">{err}</div>}
        </CardContent>
      </Card>

      {/* Compact list */}
      <Card>
        <CardContent className="p-0">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-600">
            <div className="col-span-4">Customer</div>
            <div className="col-span-3">Schedule</div>
            <div className="col-span-2">Fulfillment</div>
            <div className="col-span-1 text-right">Total</div>
            <div className="col-span-2 text-right">Status</div>
          </div>

          {filtered.length === 0 ? (
            <div className="px-4 py-10 text-center text-slate-600">
              No orders found for this filter.
            </div>
          ) : (
            filtered.map((o) => (
              <div
                key={o.id}
                className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-slate-100 hover:bg-slate-50"
              >
                {/* Customer */}
                <div className="col-span-4 min-w-0">
                  <div className="truncate text-sm font-extrabold text-slate-900">
                    {o.customer_name} <span className="font-semibold text-slate-500">• {o.phone}</span>
                  </div>
                  <div className="truncate text-xs text-slate-500">
                    {o.id}
                    {o.zip ? ` • ZIP ${o.zip}` : ""}
                  </div>
                </div>

                {/* Schedule */}
                <div className="col-span-3">
                  <div className="text-sm font-semibold">{o.scheduled_date}</div>
                  <div className="text-xs text-slate-500">{o.time_window ?? ""}</div>
                </div>

                {/* Fulfillment */}
                <div className="col-span-2">
                  <div className="text-sm font-semibold capitalize">{o.fulfillment_type}</div>
                  <div className="text-xs text-slate-500 truncate">
                    {o.fulfillment_type === "delivery" ? (o.address ?? "") : "Pickup"}
                  </div>
                </div>

                {/* Total */}
                <div className="col-span-1 text-right">
                  <div className="text-sm font-extrabold">${Number(o.total).toFixed(2)}</div>
                </div>

                {/* Status */}
                <div className="col-span-2 flex justify-end">
                  <select
                    className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold"
                    value={o.status}
                    onChange={(e) => setStatus(o.id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
