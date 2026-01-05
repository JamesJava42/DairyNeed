import { Suspense } from "react";
import SubscribeClient from "./SubscribeClient";

function SubscribeFallback() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-slate-600">
        Loading subscription…
      </div>
    </div>
  );
}

export default function SubscribePage() {
  return (
    <Suspense fallback={<SubscribeFallback />}>
      <SubscribeClient />
    </Suspense>
  );
}
