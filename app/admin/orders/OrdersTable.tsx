"use client";

import { useMemo, useState } from "react";

type OrderRow = {
  id: string;
  created_at: string;
  status: string | null;
  customer_name: string | null;
  phone: string | null;
  total: number | null;
  fulfillment_type: string | null;
  scheduled_date: string | null;
  zip: string | null;
  address: string | null;
  source: string | null;
  items: any[] | null;
};

const STATUS: { key: string; label: string }[] = [
  { key: "new", label: "New" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

function money(n: any) {
  const x = Number(n);
  return Number.isFinite(x) ? `$${x.toFixed(2)}` : "$0.00";
}

function fmtDate(s: any) {
  try {
    return new Date(String(s)).toLocaleString();
  } catch {
    return String(s ?? "");
  }
}

function pillBg(status: string) {
  if (status === "completed") return "#dcfce7";
  if (status === "cancelled") return "#fee2e2";
  if (status === "preparing") return "#fef9c3";
  if (status === "confirmed") return "#dbeafe";
  return "#e0f2fe";
}

export default function OrdersTable({ initialOrders }: { initialOrders: OrderRow[] }) {
  const [orders, setOrders] = useState<OrderRow[]>(initialOrders);
  const [filter, setFilter] = useState<string>("all");
  const [q, setQ] = useState<string>("");
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [dirty, setDirty] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return orders.filter((o) => {
      const s = String(o.status ?? "new").toLowerCase();

      if (filter !== "all" && s !== filter) return false;

      if (!query) return true;

      const hay = [
        o.id,
        o.customer_name,
        o.phone,
        o.zip,
        o.address,
        o.source,
        o.fulfillment_type,
        o.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(query);
    });
  }, [orders, filter, q]);

  async function refresh() {
    setError(null);
    setNote(null);
    const res = await fetch("/api/admin/orders", { cache: "no-store" });
    const text = await res.text();
    if (!res.ok) {
      setError(`Refresh failed: ${text.slice(0, 200)}`);
      return;
    }
    const data = JSON.parse(text);
    setOrders(data.orders ?? []);
    setNote("Refreshed ✅");
    setTimeout(() => setNote(null), 1500);
  }

  async function saveStatus(id: string) {
    const next = dirty[id];
    if (!next) return;

    setError(null);
    setNote(null);
    setSaving((s) => ({ ...s, [id]: true }));

    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const text = await res.text();

      if (!res.ok) {
        setError(`Update failed: ${text.slice(0, 220)}`);
        return;
      }

      const out = JSON.parse(text);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: out?.order?.status ?? next } : o))
      );

      setDirty((d) => {
        const copy = { ...d };
        delete copy[id];
        return copy;
      });

      setNote("Saved ✅");
      setTimeout(() => setNote(null), 1200);
    } finally {
      setSaving((s) => ({ ...s, [id]: false }));
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>Admin · Orders</h1>
          <div style={{ color: "#6b7280", marginTop: 6 }}>
            {filtered.length} shown • {orders.length} total
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, phone, zip, id…"
            style={{
              padding: "10px 12px",
              borderRadius: 14,
              border: "1px solid #e5e7eb",
              minWidth: 260,
              fontWeight: 700,
            }}
          />
          <button
            onClick={refresh}
            style={{
              padding: "10px 12px",
              borderRadius: 14,
              border: "1px solid #e5e7eb",
              background: "white",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
        <button onClick={() => setFilter("all")} style={chip(filter === "all")}>All</button>
        {STATUS.map((s) => (
          <button key={s.key} onClick={() => setFilter(s.key)} style={chip(filter === s.key)}>
            {s.label}
          </button>
        ))}
      </div>

      {error ? (
        <div style={{ marginTop: 14, border: "1px solid #fecaca", background: "#fef2f2", padding: 12, borderRadius: 14, color: "#b91c1c", fontWeight: 800 }}>
          {error}
        </div>
      ) : null}

      {note ? (
        <div style={{ marginTop: 14, border: "1px solid #bbf7d0", background: "#f0fdf4", padding: 12, borderRadius: 14, color: "#166534", fontWeight: 900 }}>
          {note}
        </div>
      ) : null}

      <div style={{ marginTop: 16, overflowX: "auto", border: "1px solid #e5e7eb", borderRadius: 16 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1050 }}>
          <thead style={{ background: "#f9fafb" }}>
            <tr>
              {["Created", "Status", "Update", "Customer", "Phone", "Items", "Total", "Order ID"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: 12, fontSize: 12, color: "#6b7280" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filtered.map((o) => {
              const current = String(o.status ?? "new").toLowerCase();
              const selected = dirty[o.id] ?? current;
              const changed = selected !== current;

              return (
                <tr key={o.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                  <td style={{ padding: 12, whiteSpace: "nowrap" }}>{fmtDate(o.created_at)}</td>

                  <td style={{ padding: 12 }}>
                    <span
                      style={{
                        padding: "6px 10px",
                        borderRadius: 999,
                        border: "1px solid #e5e7eb",
                        fontWeight: 900,
                        background: pillBg(current),
                      }}
                    >
                      {current}
                    </span>
                  </td>

                  <td style={{ padding: 12 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <select
                        value={selected}
                        onChange={(e) => setDirty((d) => ({ ...d, [o.id]: e.target.value }))}
                        style={{
                          padding: "8px 10px",
                          borderRadius: 12,
                          border: "1px solid #e5e7eb",
                          fontWeight: 800,
                        }}
                      >
                        {STATUS.map((s) => (
                          <option key={s.key} value={s.key}>
                            {s.label}
                          </option>
                        ))}
                      </select>

                      <button
                        disabled={!changed || !!saving[o.id]}
                        onClick={() => saveStatus(o.id)}
                        style={{
                          padding: "8px 10px",
                          borderRadius: 12,
                          border: "1px solid #e5e7eb",
                          background: changed ? "#111827" : "white",
                          color: changed ? "white" : "#111827",
                          fontWeight: 900,
                          cursor: changed ? "pointer" : "default",
                          opacity: saving[o.id] ? 0.7 : 1,
                        }}
                      >
                        {saving[o.id] ? "Saving…" : changed ? "Save" : "Saved"}
                      </button>
                    </div>
                  </td>

                  <td style={{ padding: 12 }}>
                    <div style={{ fontWeight: 900 }}>{o.customer_name ?? "-"}</div>
                    <div style={{ color: "#6b7280", fontSize: 12, fontWeight: 700 }}>
                      {o.fulfillment_type ?? "-"} • {o.zip ?? ""} • {o.source ?? ""}
                    </div>
                  </td>

                  <td style={{ padding: 12, whiteSpace: "nowrap" }}>{o.phone ?? "-"}</td>
                  <td style={{ padding: 12 }}>{Array.isArray(o.items) ? o.items.length : 0}</td>
                  <td style={{ padding: 12, fontWeight: 900 }}>{money(o.total)}</td>

                  <td style={{ padding: 12, fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12 }}>
                    {o.id}
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 18, color: "#6b7280" }}>
                  No orders found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function chip(active: boolean) {
  return {
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: active ? "#111827" : "white",
    color: active ? "white" : "#111827",
    fontWeight: 900 as const,
    cursor: "pointer",
  };
}
