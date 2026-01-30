// components/ProductCard.tsx
"use client";

import { useMemo } from "react";
import { useCart } from "@/store/cartStore";

type Product = {
  id: string;
  category: string;
  name: string;
  size: string;
  price: number;
  image_url?: string | null;
};

function money(n: number) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "$0.00";
  return `$${x.toFixed(2)}`;
}

export default function ProductCard({ p }: { p: Product }) {
  const items = useCart((s) => s.items);
  const add = useCart((s) => s.add);
  const inc = useCart((s) => s.inc);
  const dec = useCart((s) => s.dec);

  const qty = useMemo(() => items.find((x) => x.id === p.id)?.qty ?? 0, [items, p.id]);

  return (
    <article className="rounded-3xl border border-slate-200/70 bg-white/70 backdrop-blur shadow-sm">
      <div className="p-3.5">
        <div className="flex items-start gap-3">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.image_url ?? "/milk.png"} alt={p.name} className="h-full w-full object-cover" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-[15px] font-black text-slate-900 leading-tight">{p.name}</div>
                <div className="mt-1 truncate text-xs font-semibold text-slate-500">{p.size}</div>
              </div>

              <div className="shrink-0 text-[15px] font-black text-slate-900 whitespace-nowrap">{money(p.price)}</div>
            </div>

            <div className="mt-2">
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/70 px-2.5 py-1 text-[11px] font-extrabold text-slate-600">
                {p.category}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="text-[11px] font-semibold text-slate-500">{qty > 0 ? "In cart" : "Add quickly"}</div>

              {qty <= 0 ? (
                <button
                  className="h-9 rounded-2xl bg-emerald-600 px-4 text-xs font-black text-white shadow-[0_10px_18px_rgba(5,150,105,0.18)] hover:bg-emerald-700 active:scale-[0.99]"
                  onClick={() =>
                    add({
                      id: p.id,
                      category: p.category,
                      name: p.name,
                      size: p.size,
                      price: Number(p.price),
                      image_url: p.image_url ?? undefined,
                    })
                  }
                >
                  Add
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    className="h-9 w-9 rounded-2xl border border-slate-200 bg-white/80 text-slate-900 font-black hover:bg-white active:scale-[0.99]"
                    onClick={() => dec(p.id)}
                    aria-label="Decrease"
                  >
                    −
                  </button>
                  <div className="min-w-[22px] text-center text-sm font-black text-slate-900">{qty}</div>
                  <button
                    className="h-9 w-9 rounded-2xl bg-emerald-600 text-white font-black hover:bg-emerald-700 active:scale-[0.99]"
                    onClick={() => inc(p.id)}
                    aria-label="Increase"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
