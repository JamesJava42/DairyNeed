// app/shop/ShopClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { Container, Card, CardContent } from "@/components/ui/ui";

type Product = {
  id: string;
  category: string;
  name: string;
  size: string;
  price: number;
  image_url?: string | null;
};

export default function ShopClient() {
  const searchParams = useSearchParams();
  const cat = searchParams.get("cat") ?? "All";
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();

  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/products", { cache: "no-store" });
        const data = await res.json();

        if (!alive) return;

        if (data?.error) {
          setError(String(data.error));
          setProducts([]);
        } else {
          setProducts((data?.products ?? []) as Product[]);
        }
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "Failed to load products");
        setProducts([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    let list = products;

    if (cat !== "All") list = list.filter((p) => p.category === cat);

    if (q) {
      list = list.filter((p) => {
        const hay = `${p.name} ${p.size} ${p.category}`.toLowerCase();
        return hay.includes(q);
      });
    }

    return list;
  }, [products, cat, q]);

  return (
    <Container className="pb-24">
      {error ? (
        <Card className="mb-4">
          <CardContent className="p-5 text-red-700 font-semibold">{error}</CardContent>
        </Card>
      ) : null}

      {/* 2 cols on mobile = compact app look */}
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 10 }).map((_, idx) => (
              <div key={idx} className="rounded-3xl border border-slate-200/70 bg-white/60 p-4 shadow-sm">
                <div className="h-14 w-14 rounded-2xl bg-slate-100" />
                <div className="mt-3 h-4 w-2/3 rounded bg-slate-100" />
                <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
                <div className="mt-3 h-9 rounded-2xl bg-slate-100" />
              </div>
            ))
          : filtered.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>

      {!loading && filtered.length === 0 ? (
        <Card className="mt-4">
          <CardContent className="p-6 text-slate-600 font-semibold">
            No products found. Try another category or search.
          </CardContent>
        </Card>
      ) : null}
    </Container>
  );
}
