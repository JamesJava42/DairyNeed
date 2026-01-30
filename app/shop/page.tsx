// app/shop/page.tsx
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import ShopClient from "./ShopClient";

export const metadata: Metadata = {
  title: "Shop | DairyNeed",
  description: "Browse products and add to cart.",
};

export const viewport: Viewport = {
  themeColor: "#059669",
};

function ShopLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="rounded-3xl border border-slate-200/70 bg-white/60 p-4 shadow-sm"
          >
            <div className="h-14 w-14 rounded-2xl bg-slate-100" />
            <div className="mt-3 h-4 w-2/3 rounded bg-slate-100" />
            <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
            <div className="mt-3 h-9 rounded-2xl bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopLoading />}>
      <ShopClient />
    </Suspense>
  );
}
