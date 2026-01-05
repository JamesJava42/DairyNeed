"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/store/cartStore";
import { Container, Card, CardContent, Button } from "@/components/ui/ui";

export default function CartPage() {
  const items = useCart((s) => s.items);
  const inc = useCart((s) => s.inc);
  const dec = useCart((s) => s.dec);
  const remove = useCart((s) => s.remove);
  const total = useCart((s) => s.total());

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <Container><Card><CardContent className="p-10 text-slate-600">Loading…</CardContent></Card></Container>;
  }

  return (
    <Container className="space-y-6">
      <Card>
        <CardContent className="p-10 flex items-center justify-between">
          <div>
            <div className="text-3xl font-extrabold">Cart</div>
            <div className="mt-2 text-slate-600">Review items before checkout</div>
          </div>
          <Link href="/shop"><Button variant="secondary">Continue shopping</Button></Link>
        </CardContent>
      </Card>

      {items.length === 0 ? (
        <Card><CardContent className="p-10 text-slate-600">Your cart is empty.</CardContent></Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {items.map((i) => (
              <Card key={i.id}>
                <CardContent className="p-6 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-extrabold">{i.name}</div>
                    <div className="text-sm text-slate-600">{i.size}</div>
                    <div className="mt-1 text-sm text-slate-600">
                      ${i.price.toFixed(2)} each • <span className="font-bold">${(i.price * i.qty).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="h-10 w-10 rounded-2xl border border-slate-200 hover:bg-slate-50 font-bold" onClick={() => dec(i.id)}>−</button>
                    <div className="min-w-10 text-center font-bold">{i.qty}</div>
                    <button className="h-10 w-10 rounded-2xl border border-slate-200 hover:bg-slate-50 font-bold" onClick={() => inc(i.id)}>+</button>
                    <button className="ml-2 text-sm font-semibold text-slate-500 hover:text-slate-900" onClick={() => remove(i.id)}>Remove</button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="h-fit">
            <CardContent className="p-8">
              <div className="text-sm font-semibold text-slate-500">Summary</div>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-lg font-bold">Total</div>
                <div className="text-2xl font-extrabold">${total.toFixed(2)}</div>
              </div>

              <Link href="/checkout" className="block mt-6">
                <Button className="w-full">Checkout</Button>
              </Link>

              <div className="mt-3 text-xs text-slate-500">Payment: COD</div>
            </CardContent>
          </Card>
        </div>
      )}
    </Container>
  );
}
