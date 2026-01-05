"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cartStore";
import { Container, Card, CardContent, Button, Input } from "@/components/ui/ui";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const total = useCart((s) => s.total());

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zip, setZip] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [timeWindow, setTimeWindow] = useState("5-7pm");

  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const orderItems = useMemo(
    () => items.map((i) => ({ product_id: i.id, qty: i.qty })),
    [items]
  );

  async function placeOrder() {
    setErr(null);
    setMsg(null);

    if (!customerName.trim()) return setErr("Please enter your name.");
    if (!phone.trim()) return setErr("Please enter your phone.");
    if (!scheduledDate) return setErr("Please choose a date.");
    if (items.length === 0) return setErr("Your cart is empty.");

    if (fulfillment === "delivery") {
      if (!address.trim()) return setErr("Please enter delivery address.");
      if (!zip.trim()) return setErr("Please enter ZIP code.");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
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
          scheduled_date: scheduledDate,
          time_window: timeWindow,
          items: orderItems,
        }),
      });

      const data = await res.json();
      if (!res.ok) return setErr(data.message ?? data.error ?? "Order failed.");

      setMsg("Order placed! Redirecting...");
      clear();
      router.push(`/success?order=${data.order_id}`);
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) {
    return (
      <Container>
        <Card><CardContent className="p-10 text-slate-600">Loading…</CardContent></Card>
      </Container>
    );
  }

  return (
    <Container className="space-y-6">
      <Card>
        <CardContent className="p-10">
          <div className="text-3xl font-extrabold">Checkout</div>
          <div className="mt-2 text-slate-600">Pickup or delivery (ZIP-based). Pay with COD.</div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-8 space-y-4">
            <div className="text-lg font-bold">Customer details</div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Input placeholder="Full name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant={fulfillment === "pickup" ? "primary" : "secondary"} onClick={() => setFulfillment("pickup")}>
                Pickup
              </Button>
              <Button variant={fulfillment === "delivery" ? "primary" : "secondary"} onClick={() => setFulfillment("delivery")}>
                Delivery
              </Button>
            </div>

            {fulfillment === "delivery" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Input placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
                <Input placeholder="ZIP (90804–90814)" value={zip} onChange={(e) => setZip(e.target.value)} />
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="mb-2 text-sm font-semibold text-slate-600">Date</div>
                <Input type="date" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
              </div>

              <div>
                <div className="mb-2 text-sm font-semibold text-slate-600">Time Window</div>
                <Input value={timeWindow} onChange={(e) => setTimeWindow(e.target.value)} placeholder="5-7pm" />
              </div>
            </div>

            <Card className="border-slate-200 bg-slate-50">
              <CardContent className="p-5">
                <div className="text-sm font-semibold text-slate-600">Payment</div>
                <div className="mt-1 font-extrabold text-slate-900">COD / Pay at door or pickup</div>
              </CardContent>
            </Card>

            {err && <div className="text-red-600 font-semibold">{err}</div>}
            {msg && <div className="text-green-700 font-semibold">{msg}</div>}

            <Button className="w-full" onClick={placeOrder} disabled={loading}>
              {loading ? "Placing order..." : "Place order"}
            </Button>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardContent className="p-8">
            <div className="text-sm font-semibold text-slate-500">Summary</div>
            <div className="mt-4 space-y-3">
              {items.map((i) => (
                <div key={i.id} className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-extrabold">{i.name}</div>
                    <div className="text-sm text-slate-600">{i.size} • Qty {i.qty}</div>
                  </div>
                  <div className="font-extrabold">${(i.price * i.qty).toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <div className="text-lg font-bold">Total</div>
              <div className="text-2xl font-extrabold">${total.toFixed(2)}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
