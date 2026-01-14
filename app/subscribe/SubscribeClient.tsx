"use client";

import { useEffect, useMemo, useState } from "react";
import { Container, Card, CardContent, Button, Input, LinkChip } from "@/components/ui/ui";
import { useSearchParams } from "next/navigation";

type Product = {
  id: string;
  category: string;
  name: string;
  size: string;
  price: number;
  image_url?: string;
};

export default function SubscribeClient() {
  const sp = useSearchParams();
  const q = (sp.get("q") ?? "").toLowerCase();

  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [frequency, setFrequency] = useState<"WEEKLY" | "BIWEEKLY">("WEEKLY");
  const [startDate, setStartDate] = useState("");

  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zip, setZip] = useState("");
  const [timeWindow, setTimeWindow] = useState("5-7pm");

  const [cat, setCat] = useState("All");
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []));
  }, []);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ["All", ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const okCat = cat === "All" || p.category === cat;
      const okText = !q || `${p.name} ${p.size} ${p.category}`.toLowerCase().includes(q);
      return okCat && okText;
    });
  }, [products, cat, q]);

  const items = useMemo(
    () =>
      Object.entries(selected)
        .filter(([, qty]) => qty > 0)
        .map(([product_id, qty]) => ({ product_id, qty })),
    [selected]
  );

  async function createSubscription() {
    setErr(null);
    setMsg(null);

    if (!customerName.trim()) return setErr("Enter your name.");
    if (!phone.trim()) return setErr("Enter your phone.");
    if (!startDate) return setErr("Choose a start date.");
    if (items.length === 0) return setErr("Select at least one product.");

    if (fulfillment === "delivery") {
      if (!address.trim()) return setErr("Enter address.");
      if (!zip.trim()) return setErr("Enter ZIP.");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName,
          phone,
          fulfillment_type: fulfillment,
          address: fulfillment === "delivery" ? address : undefined,
          city: fulfillment === "delivery" ? "Long Beach" : undefined,
          state: fulfillment === "delivery" ? "CA" : undefined,
          zip: fulfillment === "delivery" ? zip : undefined,
          frequency,
          start_date: startDate,
          time_window: timeWindow,
          items,
        }),
      });

      const data = await res.json();
      if (!res.ok) return setErr(data.message ?? data.error ?? "Subscription failed.");

      setMsg(`Subscription created! Next delivery: ${data.next_delivery_date}`);
      setSelected({});
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container className="space-y-6">
      <Card>
        <CardContent className="p-10">
          <div className="text-3xl font-extrabold">Subscription</div>
          <div className="mt-2 text-slate-600">Weekly or Biweekly. COD only for Phase 1.</div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant={frequency === "WEEKLY" ? "primary" : "secondary"} onClick={() => setFrequency("WEEKLY")}>
              Weekly
            </Button>
            <Button variant={frequency === "BIWEEKLY" ? "primary" : "secondary"} onClick={() => setFrequency("BIWEEKLY")}>
              Biweekly
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1 h-fit">
          <CardContent className="p-8 space-y-4">
            <div className="text-lg font-bold">Details</div>

            <Input placeholder="Full name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />

            <div className="flex flex-wrap gap-3">
              <Button variant={fulfillment === "pickup" ? "primary" : "secondary"} onClick={() => setFulfillment("pickup")}>
                Pickup
              </Button>
              <Button variant={fulfillment === "delivery" ? "primary" : "secondary"} onClick={() => setFulfillment("delivery")}>
                Delivery
              </Button>
            </div>

            {fulfillment === "delivery" && (
              <>
                <Input placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
                <Input placeholder="ZIP (90804–90814)" value={zip} onChange={(e) => setZip(e.target.value)} />
              </>
            )}

            <div>
              <div className="mb-2 text-sm font-semibold text-slate-600">Start Date</div>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <Input value={timeWindow} onChange={(e) => setTimeWindow(e.target.value)} placeholder="Time window (ex: 5-7pm)" />

            {err && <div className="text-red-600 font-semibold">{err}</div>}
            {msg && <div className="text-green-700 font-semibold">{msg}</div>}

            <Button className="w-full" onClick={createSubscription} disabled={loading}>
              {loading ? "Creating..." : "Create subscription"}
            </Button>

            <div className="text-xs text-slate-500">Payment: COD</div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <LinkChip key={c} active={c === cat} onClick={() => setCat(c)}>
                {c}
              </LinkChip>
            ))}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {filtered.map((p) => {
              const qty = selected[p.id] ?? 0;

              return (
                <Card key={p.id}>
                  <CardContent className="p-6">
                    {/* IMAGE + TEXT */}
                    <div className="flex items-start gap-4">
                      <img
                        src={p.image_url || "/products/placeholder.png"}
                        alt={p.name}
                        className="h-16 w-16 rounded-2xl object-cover border border-slate-200 bg-white"
                        loading="lazy"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-500">{p.category}</div>
                        <div className="mt-1 text-lg font-bold truncate">{p.name}</div>
                        <div className="text-sm text-slate-600 truncate">{p.size}</div>
                      </div>
                    </div>

                    {/* PRICE + ADD */}
                    <div className="mt-5 flex items-center justify-between">
                      <div className="text-xl font-extrabold">${Number(p.price).toFixed(2)}</div>

                      {qty === 0 ? (
                        <Button onClick={() => setSelected((s) => ({ ...s, [p.id]: 1 }))}>Add</Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            className="h-10 w-10 rounded-2xl border border-slate-200 hover:bg-slate-50 font-bold"
                            onClick={() =>
                              setSelected((s) => ({
                                ...s,
                                [p.id]: Math.max(0, (s[p.id] ?? 0) - 1),
                              }))
                            }
                          >
                            −
                          </button>
                          <div className="min-w-10 text-center font-bold">{qty}</div>
                          <button
                            className="h-10 w-10 rounded-2xl border border-slate-200 hover:bg-slate-50 font-bold"
                            onClick={() => setSelected((s) => ({ ...s, [p.id]: (s[p.id] ?? 0) + 1 }))}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </Container>
  );
}
