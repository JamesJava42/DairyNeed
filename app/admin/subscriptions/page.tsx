"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/ui";

export default function AdminSubscriptions() {
  const [subs, setSubs] = useState<any[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const adminKey = () => localStorage.getItem("ADMIN_KEY") || "";

  async function load() {
    setErr(null);
    const res = await fetch("/api/subscriptions", { headers: { "x-admin-key": adminKey() } });
    const data = await res.json();
    if (!res.ok) return setErr(data.error ?? "Failed to load subscriptions");
    setSubs(data.subscriptions ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-10">
          <div className="text-3xl font-extrabold">Admin • Subscriptions</div>
          <div className="mt-2 text-slate-600">All active subscriptions.</div>
          {err && <div className="mt-3 text-red-600 font-semibold">{err}</div>}
        </CardContent>
      </Card>

      <div className="space-y-3">
        {subs.map((s) => (
          <Card key={s.id}>
            <CardContent className="p-6">
              <div className="font-extrabold">{s.customer_name} • {s.phone}</div>
              <div className="text-sm text-slate-600">
                {s.frequency} • Next: {s.next_delivery_date} • {s.fulfillment_type} • {s.status}
              </div>
              {s.fulfillment_type === "delivery" && (
                <div className="text-sm text-slate-600">
                  {s.address}, {s.city}, {s.state} {s.zip}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
