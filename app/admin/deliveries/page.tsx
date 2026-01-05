"use client";

import { useState } from "react";
import { Card, CardContent, Button, Input } from "@/components/ui/ui";

export default function AdminDeliveries() {
  const [date, setDate] = useState("");
  const [data, setData] = useState<any | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const adminKey = () => localStorage.getItem("ADMIN_KEY") || "";

  async function load() {
    setErr(null);
    if (!date) return setErr("Pick a date.");
    const res = await fetch(`/api/deliveries?date=${date}`, { headers: { "x-admin-key": adminKey() } });
    const d = await res.json();
    if (!res.ok) return setErr(d.error ?? "Failed to load deliveries");
    setData(d);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-10 space-y-4">
          <div className="text-3xl font-extrabold">Admin • Deliveries</div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Button onClick={load}>Load</Button>
          </div>
          {err && <div className="text-red-600 font-semibold">{err}</div>}
        </CardContent>
      </Card>

      {data && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <div className="text-lg font-extrabold">One-time Orders</div>
              <div className="mt-4 space-y-3">
                {(data.one_time_orders ?? []).map((o: any) => (
                  <div key={o.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="font-bold">{o.customer_name}</div>
                    <div className="text-sm text-slate-600">
                      {o.fulfillment_type} • {o.status} • ${Number(o.total).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-lg font-extrabold">Subscriptions Due</div>
              <div className="mt-4 space-y-3">
                {(data.subscriptions_due ?? []).map((s: any) => (
                  <div key={s.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="font-bold">{s.customer_name}</div>
                    <div className="text-sm text-slate-600">
                      {s.frequency} • {s.fulfillment_type} • {s.status}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
