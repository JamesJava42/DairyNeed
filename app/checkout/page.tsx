"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cartStore";
import { Container, Card, CardContent, Button, Input, LinkChip, cn } from "@/components/ui/ui";

function money(n: number) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "$0.00";
  return `$${x.toFixed(2)}`;
}

const STORE_PICKUP_ADDRESS = "Pickup — Rockview Dairy";
const STORE_PICKUP_ZIP = "90804";

export default function CheckoutPage() {
  const router = useRouter();

  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const total = useCart((s) => s.total());

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [plan, setPlan] = useState<"weekly" | "biweekly">("weekly");
  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">("delivery");

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zip, setZip] = useState("");

  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // prevents double submit (even if user double-clicks)
  const inFlight = useRef(false);

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + Number(i.qty || 0), 0), [items]);

  const orderItems = useMemo(
    () => items.map((i) => ({ product_id: i.id, qty: i.qty })),
    [items]
  );

  // keep pickup defaults consistent (but still editable if you want)
  useEffect(() => {
    if (fulfillment === "pickup") {
      if (!address.trim()) setAddress(STORE_PICKUP_ADDRESS);
      if (!zip.trim()) setZip(STORE_PICKUP_ZIP);
    }
  }, [fulfillment]); // eslint-disable-line react-hooks/exhaustive-deps

  async function placeOrder() {
    if (inFlight.current) return;
    inFlight.current = true;

    setErr(null);
    setMsg(null);

    const name = customerName.trim();
    const ph = phone.trim();
    const addr = address.trim();
    const z = zip.trim();

    if (!name) {
      inFlight.current = false;
      return setErr("Please enter your name.");
    }
    if (!ph) {
      inFlight.current = false;
      return setErr("Please enter your phone.");
    }
    if (items.length === 0) {
      inFlight.current = false;
      return setErr("Your cart is empty.");
    }

    // Your current /api/orders (v3) requires address + zip + plan + total + items.
    if (!addr) {
      inFlight.current = false;
      return setErr("Please enter an address.");
    }
    if (z.length < 5) {
      inFlight.current = false;
      return setErr("Please enter a valid ZIP (5 digits).");
    }
    if (!plan) {
      inFlight.current = false;
      return setErr("Please choose a plan.");
    }
    if (!Number.isFinite(total) || total <= 0) {
      inFlight.current = false;
      return setErr("Total looks invalid. Please refresh and try again.");
    }

    setLoading(true);
      const scheduled_date = new Date().toISOString().slice(0, 10);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: name,
          phone: ph,
          fulfillment_type: fulfillment,
          scheduled_date,
          time_window: "5-7pm",
          address: addr,
          zip: z,
          plan,
          total,
          items: orderItems,
          source: "web",
        }),
      });

      const text = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch {}

      if (!res.ok) {
        inFlight.current = false;
        return setErr(data?.message ?? data?.error ?? text ?? "Order failed.");
      }

      setMsg("Order placed! Redirecting...");
      clear();
      router.push(`/success?order=${data.order_id}`);
    } catch (e: any) {
      inFlight.current = false;
      setErr(e?.message ?? "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) {
    return (
      <Container>
        <Card>
          <CardContent className="p-10 text-slate-600">Loading…</CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-10 flex items-start justify-between gap-6">
          <div className="min-w-0">
            <div className="text-3xl font-extrabold">Checkout</div>
            <div className="mt-2 text-slate-600">
              Confirm your details, choose plan + fulfillment, then place order (COD).
            </div>

            {/* Stepper */}
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-extrabold">1</div>
                <div className="font-bold">Cart</div>
              </div>
              <div className="h-[2px] w-10 bg-slate-200" />
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-extrabold">2</div>
                <div className="font-bold">Checkout</div>
              </div>
              <div className="h-[2px] w-10 bg-slate-200" />
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full border border-slate-200 bg-white text-slate-900 flex items-center justify-center font-extrabold">3</div>
                <div className="font-semibold text-slate-600">Confirm</div>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex gap-2">
            <Link href="/cart"><Button variant="secondary">Back to cart</Button></Link>
            <Link href="/shop"><Button variant="ghost">Shop</Button></Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Form */}
        <Card className="lg:col-span-2">
          <CardContent className="p-8 space-y-6">
            {/* Preferences */}
            <div>
              <div className="text-lg font-bold">Preferences</div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="mb-2 text-sm font-semibold text-slate-600">Fulfillment</div>
                  <div className="flex flex-wrap gap-2">
                    <LinkChip active={fulfillment === "delivery"} onClick={() => setFulfillment("delivery")}>
                      Delivery
                    </LinkChip>
                    <LinkChip active={fulfillment === "pickup"} onClick={() => setFulfillment("pickup")}>
                      Pickup
                    </LinkChip>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    Prototype: ZIP validation + COD only.
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-sm font-semibold text-slate-600">Plan</div>
                  <div className="flex flex-wrap gap-2">
                    <LinkChip active={plan === "weekly"} onClick={() => setPlan("weekly")}>
                      Weekly
                    </LinkChip>
                    <LinkChip active={plan === "biweekly"} onClick={() => setPlan("biweekly")}>
                      Biweekly
                    </LinkChip>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    You can change plan later (Phase 2).
                  </div>
                </div>
              </div>
            </div>

            {/* Customer details */}
            <div className="border-t pt-6">
              <div className="text-lg font-bold">Customer details</div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Input
                  disabled={loading}
                  placeholder="Full name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <Input
                  disabled={loading}
                  placeholder="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Input
                  disabled={loading}
                  placeholder={fulfillment === "pickup" ? "Pickup note / name" : "Address"}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <Input
                  disabled={loading}
                  placeholder="ZIP"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                />
              </div>

              <Card className="mt-4 border-slate-200 bg-slate-50">
                <CardContent className="p-5">
                  <div className="text-sm font-semibold text-slate-600">Payment</div>
                  <div className="mt-1 font-extrabold text-slate-900">COD / Pay at delivery or pickup</div>
                  <div className="mt-1 text-xs text-slate-500">We’ll confirm the order by text/call.</div>
                </CardContent>
              </Card>

              {err && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 font-semibold">
                  {err}
                </div>
              )}
              {msg && (
                <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-800 font-semibold">
                  {msg}
                </div>
              )}

              <Button className="mt-5 w-full" onClick={placeOrder} disabled={loading || items.length === 0}>
                {loading ? "Placing order..." : "Place order"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right: Summary */}
        <Card className="h-fit lg:sticky lg:top-6">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-500">Summary</div>
                <div className="mt-1 text-xs text-slate-500">{itemCount} item(s)</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Plan</div>
                <div className="font-extrabold">{plan === "weekly" ? "Weekly" : "Biweekly"}</div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {items.length === 0 ? (
                <div className="text-slate-600">Your cart is empty.</div>
              ) : (
                items.slice(0, 5).map((i) => (
                  <div key={i.id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-extrabold truncate">{i.name}</div>
                      <div className="text-sm text-slate-600 truncate">{i.size} • Qty {i.qty}</div>
                    </div>
                    <div className="font-extrabold">{money(i.price * i.qty)}</div>
                  </div>
                ))
              )}
              {items.length > 5 ? (
                <div className="text-xs text-slate-500 font-semibold">+ {items.length - 5} more item(s)</div>
              ) : null}
            </div>

            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <div className="text-lg font-bold">Total</div>
              <div className="text-2xl font-extrabold">{money(total)}</div>
            </div>

            <div className="mt-3 text-xs text-slate-500">
              Fulfillment: <span className="font-semibold text-slate-700">{fulfillment}</span>
            </div>

            <div className={cn("mt-6 rounded-2xl p-4", "bg-slate-900 text-white")}>
              <div className="text-xs text-slate-200 font-semibold">Ready?</div>
              <div className="mt-1 font-extrabold">Place order in one tap</div>
              <Button className="mt-4 w-full bg-white text-slate-900 hover:bg-slate-100" onClick={placeOrder} disabled={loading || items.length === 0}>
                {loading ? "Placing..." : `Place order • ${money(total)}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
