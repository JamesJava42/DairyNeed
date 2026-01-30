// app/success/SuccessClient.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button, Card, CardContent, Container } from "@/components/ui/ui";

export default function SuccessClient() {
  const sp = useSearchParams();
  const order = sp.get("order") ?? "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(order);
    } catch {}
  };

  return (
    <Container className="pb-24">
      <Card>
        <CardContent className="p-6 sm:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
            ✅ Order placed
          </div>

          <div className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
            Thank you!
          </div>

          <div className="mt-2 text-slate-600 font-semibold">
            We received your order and will confirm by call/text.
          </div>

          <div className="mt-6 rounded-3xl border border-slate-200 bg-white/70 p-5">
            <div className="text-xs font-black text-slate-500 uppercase tracking-wide">
              Confirmation number
            </div>

            <div className="mt-2 text-2xl font-black text-slate-900 break-all">
              {order || "—"}
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button variant="secondary" className="w-full sm:w-auto" onClick={copy} disabled={!order}>
                Copy number
              </Button>
              <Link href="/shop" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto">Continue shopping</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
