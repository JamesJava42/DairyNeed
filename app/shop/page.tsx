import { Suspense } from "react";
import ShopClient from "./ShopClient";

function ShopFallback() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-slate-600">
        Loading shop…
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopFallback />}>
      <ShopClient />
    </Suspense>
  );
}
