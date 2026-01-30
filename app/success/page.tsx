// app/success/page.tsx
import { Suspense } from "react";
import SuccessClient from "./SuccessClient";

function SuccessLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24">
      <div className="rounded-[28px] border border-slate-200/70 bg-white/70 p-8 shadow-sm">
        <div className="h-6 w-32 rounded bg-slate-100" />
        <div className="mt-4 h-10 w-64 rounded bg-slate-100" />
        <div className="mt-3 h-4 w-80 rounded bg-slate-100" />
        <div className="mt-6 h-24 rounded-3xl bg-slate-100" />
        <div className="mt-4 h-11 w-40 rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<SuccessLoading />}>
      <SuccessClient />
    </Suspense>
  );
}
