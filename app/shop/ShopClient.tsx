"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/store/cartStore";
import { Container, Card, CardContent, Button, LinkChip } from "@/components/ui/ui";

type Product = { id: string; category: string; name: string; size: string; price: number };

export default function ShopClient() {
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") ?? "").toLowerCase();

  const add = useCart((s) => s.add);
  const inc = useCart((s) => s.inc);
  const dec = useCart((s) => s.dec);
  const items = useCart((s) => s.items);

  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState("All");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => (d.error ? setError(d.error) : setProducts(d.products ?? [])))
      .catch(() => setError("Failed to load products"));
  }, []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const okCat = category === "All" || p.category === category;
      const okText = !q || `${p.name} ${p.size} ${p.category}`.toLowerCase().includes(q);
      return okCat && okText;
    });
  }, [products, category, q]);

  const qtyInCart = (id: string) => items.find((i) => i.id === id)?.qty ?? 0;

  return (
    <Container className="space-y-6">
      <Card>
        <CardContent className="p-10">
          <div className="text-4xl font-extrabold tracking-tight">Shop Fresh Dairy</div>
          <div className="mt-3 text-lg text-slate-600">Pickup or delivery (ZIP-based). Pay with COD.</div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/cart"><Button>Go to cart</Button></Link>
            <Link href="/subscribe"><Button variant="secondary">Weekly Subscription</Button></Link>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <LinkChip key={c} active={c === category} onClick={() => setCategory(c)}>
            {c}
          </LinkChip>
        ))}
      </div>

      {error && <div className="text-red-600 font-semibold">{error}</div>}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => {
          const qty = mounted ? qtyInCart(p.id) : 0;
          return (
            <Card key={p.id}>
              <CardContent className="p-6">
                <div className="text-xs font-semibold text-slate-500">{p.category}</div>
                <div className="mt-2 text-lg font-bold">{p.name}</div>
                <div className="text-sm text-slate-600">{p.size}</div>

                <div className="mt-5 flex items-center justify-between">
                  <div className="text-xl font-extrabold">${Number(p.price).toFixed(2)}</div>

                  {qty === 0 ? (
                    <Button onClick={() => add(p)}>Add</Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        className="h-10 w-10 rounded-2xl border border-slate-200 hover:bg-slate-50 font-bold"
                        onClick={() => dec(p.id)}
                      >
                        −
                      </button>
                      <div className="min-w-10 text-center font-bold">{qty}</div>
                      <button
                        className="h-10 w-10 rounded-2xl border border-slate-200 hover:bg-slate-50 font-bold"
                        onClick={() => inc(p.id)}
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
    </Container>
  );
}
