"use client";

import { Button } from "@/components/ui/Button";
import { useCart } from "@/store/cartStore";

type Product = {
  id: string;
  name: string;
  price_cents: number;
  image_url?: string | null;
  category?: string | null;
  size?: string | null; // optional if you have it
};

function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export function ProductCard({ p }: { p: Product }) {
  const add = useCart((s) => s.add);

  return (
    <div className="card overflow-hidden">
      <div className="aspect-[4/3] bg-[rgb(var(--primary-soft))] flex items-center justify-center">
        <span className="text-slate-600 text-sm">Image</span>
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold leading-tight">{p.name}</p>
            {p.category && <p className="text-xs text-slate-500 mt-1">{p.category}</p>}
          </div>
          <p className="font-extrabold text-base">{money(p.price_cents)}</p>
        </div>

        <Button
          className="w-full"
          onClick={() =>
            add({
              id: p.id,
              category: p.category ?? "General",
              name: p.name,
              size: p.size ?? "Standard",
              price: p.price_cents / 100, // your store uses `price` as number
            })
          }
        >
          Add to cart
        </Button>
      </div>
    </div>
  );
}
