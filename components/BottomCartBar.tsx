// components/BottomCartBar.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/store/cartStore";
import { Button, cn } from "@/components/ui/ui";

function money(n: number) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "$0.00";
  return `$${x.toFixed(2)}`;
}

export type BottomCartBarProps = {
  href?: string;
  label?: string;
  className?: string;
};

/**
 * ✅ Backward compatible:
 * - Supports BOTH: <BottomCartBar /> (shows View cart + Checkout)
 * - And: <BottomCartBar href="/checkout" label="Checkout" /> (single CTA)
 * - Exports BOTH named + default.
 */
export function BottomCartBar({ href, label, className }: BottomCartBarProps) {
  const items = useCart((s) => s.items);

  // prevent SSR/CSR mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { count, total } = useMemo(() => {
    const c = (items ?? []).reduce((sum, i) => sum + Number(i.qty || 0), 0);
    const t = (items ?? []).reduce((sum, i) => sum + Number(i.price || 0) * Number(i.qty || 0), 0);
    return { count: c, total: t };
  }, [items]);

  if (!mounted) return null;
  if (!count) return null;

  const singleCta = href && label;

  return (
    <div className={cn("fixed bottom-4 left-0 right-0 z-40 px-4", className)}>
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-xl px-4 py-3 sm:px-6">
          {/* ✅ Mobile stack to avoid overflow */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="min-w-0">
              <div className="text-xs font-extrabold text-slate-500">Cart</div>
              <div className="font-extrabold text-slate-900">
                {count} item(s) • {money(total)}
              </div>
            </div>

            {singleCta ? (
              <Link href={href} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto">{label}</Button>
              </Link>
            ) : (
              <div className="w-full flex flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <Link href="/cart" className="w-full sm:w-auto">
                  <Button variant="secondary" className="w-full sm:w-auto">
                    View cart
                  </Button>
                </Link>
                <Link href="/checkout" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto">Checkout</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BottomCartBar;
