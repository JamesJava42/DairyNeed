"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/cartStore";
import { Container, Card, CardContent, Button, Input, LinkChip } from "@/components/ui/ui";
import { useAuth } from "@/components/auth/AuthProvider";

const STORE_PICKUP_ADDRESS = "19922 Pioneer Blvd, Cerritos, CA 90703";
const STORE_PHONE_DISPLAY = "(562) 865-4406";

type Plan = "one_time" | "weekly" | "biweekly";
type Fulfillment = "pickup" | "delivery";

const TIME_WINDOWS = ["8-10am", "10am-12pm", "12-2pm", "2-4pm", "4-6pm", "6-8pm"];

function money(n: number) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "$0.00";
  return `$${x.toFixed(2)}`;
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function CheckoutPage() {
  const router = useRouter();

  // ✅ Auth (if logged in, we attach user_id via Bearer token)
  const { user, session } = useAuth();
  const accessToken = session?.access_token ?? "";

  // Cart
  const items = useCart((s: any) => s.items);
  const clear = useCart((s: any) => s.clear);
  const total = useCart((s: any) => s.total());

  // Mount guard for hydration/cart store
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Form
  const [plan, setPlan] = useState<Plan>("one_time");
  const [fulfillment, setFulfillment] = useState<Fulfillment>("pickup");

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");

  // ✅ NEW: email for confirmation (guest enters, user autofill)
  const [email, setEmail] = useState("");
  useEffect(() => {
    if (user?.email && !email) setEmail(user.email);
  }, [user, email]);

  // Delivery fields
  const [address, setAddress] = useState("");
  const [apt, setApt] = useState("");
  const [city, setCity] = useState("Cerritos");
  const [state, setState] = useState("CA");
  const [zip, setZip] = useState("");

  // Schedule
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [timeWindow, setTimeWindow] = useState<string>(TIME_WINDOWS[2]);

  useEffect(() => {
    if (!scheduledDate) setScheduledDate(isoDate(addDays(1)));
  }, [scheduledDate]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // prevent double submit
  const inFlight = useRef(false);

  const itemCount = useMemo(() => {
    if (!mounted) return 0;
    return items.reduce((sum: number, i: any) => sum + Number(i.qty || 0), 0);
  }, [mounted, items]);

  const orderItems = useMemo(() => {
    if (!mounted) return [];
    return items.map((i: any) => ({ product_id: i.id, qty: Number(i.qty || 0) }));
  }, [mounted, items]);

  async function placeOrder() {
    if (inFlight.current) return;
    inFlight.current = true;

    setErr(null);
    setMsg(null);

    if (!mounted) {
      inFlight.current = false;
      return setErr("Loading cart… please try again.");
    }

    const name = customerName.trim();
    const ph = phone.trim();
    const em = email.trim();

    if (!name) {
      inFlight.current = false;
      return setErr("Please enter your full name.");
    }
    if (!ph) {
      inFlight.current = false;
      return setErr("Please enter your phone number.");
    }
    if (!em) {
      inFlight.current = false;
      return setErr("Please enter your email (we send confirmation).");
    }
    if (!isEmail(em)) {
      inFlight.current = false;
      return setErr("Please enter a valid email.");
    }
    if (!orderItems.length) {
      inFlight.current = false;
      return setErr("Your cart is empty.");
    }
    if (!scheduledDate) {
      inFlight.current = false;
      return setErr("Please choose a date.");
    }

    const addr = address.trim();
    const unit = apt.trim();
    const c = city.trim();
    const st = state.trim();
    const z = zip.trim();

    if (fulfillment === "delivery") {
      if (!addr) {
        inFlight.current = false;
        return setErr("Please enter your street address.");
      }
      if (!c) {
        inFlight.current = false;
        return setErr("Please enter your city.");
      }
      if (!st) {
        inFlight.current = false;
        return setErr("Please enter your state.");
      }
      if (z.length < 5) {
        inFlight.current = false;
        return setErr("Please enter a valid ZIP (5 digits).");
      }
    }

    setLoading(true);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const res = await fetch("/api/orders", {
        method: "POST",
        headers,
        body: JSON.stringify({
          customer_name: name,
          phone: ph,
          customer_email: em, // ✅ send to backend for Gmail confirmation
          fulfillment_type: fulfillment,
          scheduled_date: scheduledDate,
          time_window: timeWindow,

          address: fulfillment === "delivery" ? addr : STORE_PICKUP_ADDRESS,
          apt: fulfillment === "delivery" ? unit : "",
          city: fulfillment === "delivery" ? c : "Cerritos",
          state: fulfillment === "delivery" ? st : "CA",
          zip: fulfillment === "delivery" ? z : "90703",

          plan,
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
        const missing = Array.isArray(data?.missing) ? ` Missing: ${data.missing.join(", ")}` : "";
        inFlight.current = false;
        return setErr((data?.message ?? data?.error ?? text ?? "Order failed.") + missing);
      }

      const orderId = String(data?.order_id ?? "");
      setMsg("Order placed! Redirecting…");
      clear();
      router.push(`/success?order=${encodeURIComponent(orderId)}`);
    } catch (e: any) {
      inFlight.current = false;
      setErr(e?.message ?? "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) {
    return (
      <Container className="space-y-4 pb-24">
        <Card>
          <CardContent className="p-6 sm:p-8 text-slate-600 font-semibold">Loading checkout…</CardContent>
        </Card>
      </Container>
    );
  }

  const minDate = isoDate(new Date());
  const maxDate = isoDate(addDays(14));

  return (
    <Container className="space-y-4 pb-24">
      {/* Header */}
      <Card>
        <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">Rockview Dairy</div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold">Checkout</div>
            <div className="mt-2 text-slate-600 font-semibold">
              Pickup or Delivery • Choose date + time • Pay at pickup/delivery
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-2">
            <Link href="/cart">
              <Button variant="secondary" className="w-full sm:w-auto">
                Back to cart
              </Button>
            </Link>
            <Link href="/shop">
              <Button variant="ghost" className="w-full sm:w-auto">
                Shop
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Preferences */}
            <div>
              <div className="text-lg font-extrabold">Preferences</div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="mb-2 text-sm font-extrabold text-slate-600">Fulfillment</div>
                  <div className="flex flex-wrap gap-2">
                    <LinkChip active={fulfillment === "pickup"} onClick={() => setFulfillment("pickup")}>
                      Pickup
                    </LinkChip>
                    <LinkChip active={fulfillment === "delivery"} onClick={() => setFulfillment("delivery")}>
                      Delivery
                    </LinkChip>
                  </div>

                  <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs font-bold text-slate-500 uppercase">Pickup location</div>
                    <div className="mt-2 font-extrabold text-slate-900">{STORE_PICKUP_ADDRESS}</div>
                    <div className="mt-1 text-sm text-slate-600">Phone: {STORE_PHONE_DISPLAY}</div>
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-sm font-extrabold text-slate-600">Plan</div>
                  <div className="flex flex-wrap gap-2">
                    <LinkChip active={plan === "one_time"} onClick={() => setPlan("one_time")}>
                      One-time
                    </LinkChip>
                    <LinkChip active={plan === "weekly"} onClick={() => setPlan("weekly")}>
                      Weekly
                    </LinkChip>
                    <LinkChip active={plan === "biweekly"} onClick={() => setPlan("biweekly")}>
                      Biweekly
                    </LinkChip>
                  </div>
                  <div className="mt-2 text-xs font-semibold text-slate-500">
                    One-time for single orders. Weekly/Biweekly for repeat (Phase 3).
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="border-t pt-6">
              <div className="text-lg font-extrabold">Schedule</div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="mb-2 text-sm font-extrabold text-slate-600">Date</div>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-900"
                    type="date"
                    value={scheduledDate}
                    min={minDate}
                    max={maxDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <div className="mb-2 text-sm font-extrabold text-slate-600">Time window</div>
                  <select
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold text-slate-900"
                    value={timeWindow}
                    onChange={(e) => setTimeWindow(e.target.value)}
                    disabled={loading}
                  >
                    {TIME_WINDOWS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Customer */}
            <div className="border-t pt-6">
              <div className="text-lg font-extrabold">Customer details</div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Input disabled={loading} placeholder="Full name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                <Input disabled={loading} placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>

              <div className="mt-3">
                <Input
                  disabled={loading || !!user?.email}
                  placeholder="Email (for confirmation)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {user?.email ? (
                  <div className="mt-1 text-xs font-semibold text-slate-500">Using your signed-in email.</div>
                ) : (
                  <div className="mt-1 text-xs font-semibold text-slate-500">We send confirmation + order details here.</div>
                )}
              </div>

              {fulfillment === "delivery" ? (
                <div className="mt-4 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input disabled={loading} placeholder="Street address" value={address} onChange={(e) => setAddress(e.target.value)} />
                    <Input disabled={loading} placeholder="Apt / Unit (optional)" value={apt} onChange={(e) => setApt(e.target.value)} />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <Input disabled={loading} placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
                    <Input disabled={loading} placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
                    <Input disabled={loading} placeholder="ZIP" value={zip} onChange={(e) => setZip(e.target.value)} />
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-sm font-extrabold text-slate-900">Pickup details</div>
                  <div className="mt-1 text-sm text-slate-600">{STORE_PICKUP_ADDRESS}</div>
                  <div className="mt-1 text-sm text-slate-600">{STORE_PHONE_DISPLAY}</div>
                </div>
              )}

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-900 p-5 text-white">
                <div className="text-xs font-bold text-slate-200 uppercase">Payment</div>
                <div className="mt-2 text-lg font-extrabold">Cash on delivery / pickup (COD)</div>
                <div className="mt-1 text-sm text-slate-200">We confirm by text/call.</div>
              </div>

              {err ? (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 font-bold">{err}</div>
              ) : null}
              {msg ? (
                <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-800 font-bold">{msg}</div>
              ) : null}

              <Button
                className="mt-5 w-full bg-slate-900 text-white hover:bg-slate-800"
                onClick={placeOrder}
                disabled={loading || items.length === 0}
              >
                {loading ? "Placing order..." : "Place order"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Summary */}
        <Card className="h-fit lg:sticky lg:top-6">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-bold text-slate-500">Summary</div>
                <div className="mt-1 text-xs font-semibold text-slate-500">{itemCount} item(s)</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">Fulfillment</div>
                <div className="font-extrabold text-slate-900">{fulfillment}</div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {items.length === 0 ? (
                <div className="text-slate-600 font-semibold">Your cart is empty.</div>
              ) : (
                items.slice(0, 6).map((i: any) => (
                  <div key={i.id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-extrabold text-slate-900 truncate">{i.name}</div>
                      <div className="text-sm text-slate-600 truncate">
                        {i.size} • Qty {i.qty}
                      </div>
                    </div>
                    <div className="font-extrabold text-slate-900">{money(Number(i.price) * Number(i.qty))}</div>
                  </div>
                ))
              )}
              {items.length > 6 ? <div className="text-xs font-semibold text-slate-500">+ {items.length - 6} more item(s)</div> : null}
            </div>

            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <div className="text-lg font-extrabold">Total</div>
              <div className="text-2xl font-extrabold">{money(total)}</div>
            </div>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-xs font-bold text-slate-500 uppercase">Ready?</div>
              <div className="mt-1 font-extrabold text-slate-900">One-tap checkout</div>
              <Button
                className="mt-4 w-full bg-slate-900 text-white hover:bg-slate-800"
                onClick={placeOrder}
                disabled={loading || items.length === 0}
              >
                {loading ? "Placing..." : `Place order • ${money(total)}`}
              </Button>
            </div>

            <div className="mt-3 text-xs text-slate-500 font-semibold">
              Date: {scheduledDate} • {timeWindow}
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
