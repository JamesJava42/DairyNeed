// app/cart/CartPageClient.tsx
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useCart } from "@/store/cartStore";
import { BottomCartBar } from "@/components/BottomCartBar";
import { Button, Card, CardContent, Container } from "@/components/ui/ui";

function money(n: number) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "$0.00";
  return `$${x.toFixed(2)}`;
}

export default function CartPageClient() {
  const items = useCart((s) => s.items);
  const inc = useCart((s) => s.inc);
  const dec = useCart((s) => s.dec);

  const total = useMemo(
    () => items.reduce((sum, i) => sum + Number(i.price || 0) * Number(i.qty || 0), 0),
    [items]
  );

  const itemCount = useMemo(() => items.reduce((sum, i) => sum + Number(i.qty || 0), 0), [items]);

  return (
    <Container className="space-y-6 pb-24">
      <Card>
        <CardContent className="p-6 sm:p-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-3xl font-extrabold">Your cart</div>
            <div className="mt-2 text-slate-600">
              {itemCount} item(s) • Total {money(total)}
            </div>
          </div>

          <div className="mt-2 sm:mt-0 flex flex-col gap-2 sm:flex-row">
            <Link href="/shop" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full sm:w-auto">
                Continue shopping
              </Button>
            </Link>
            <Link href="/checkout" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto" disabled={items.length === 0}>
                Checkout
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-slate-600">
            Your cart is empty.{" "}
            <Link className="underline" href="/shop">
              Shop now
            </Link>
            .
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((i) => (
            <Card key={i.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:p-6">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100 self-start">
                    {i.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={i.image_url} alt={i.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-extrabold truncate">{i.name}</div>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                        {i.category}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-slate-600">{i.size}</div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full border border-slate-200 px-2 py-1 font-semibold text-slate-600">
                        Fresh
                      </span>
                      <span className="rounded-full border border-slate-200 px-2 py-1 font-semibold text-slate-600">
                        Rockview
                      </span>
                      <span className="rounded-full border border-slate-200 px-2 py-1 font-semibold text-slate-600">
                        Great for breakfast
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-row items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-between">
                    <div className="font-extrabold whitespace-nowrap">
                      {money(Number(i.price) * Number(i.qty))}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        className="h-9 w-10 px-0 sm:h-10 sm:w-12"
                        onClick={() => dec(i.id)}
                        aria-label="Decrease"
                      >
                        −
                      </Button>
                      <div className="min-w-[28px] text-center font-extrabold">{i.qty}</div>
                      <Button
                        className="h-9 w-10 px-0 sm:h-10 sm:w-12"
                        onClick={() => inc(i.id)}
                        aria-label="Increase"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <BottomCartBar href="/checkout" label="Checkout" />
    </Container>
  );
}
