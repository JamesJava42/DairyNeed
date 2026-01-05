"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/store/cartStore";
import { Container, Input, cn } from "@/components/ui/ui";

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState(false);
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  const count = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const cartLabel = useMemo(() => (mounted ? `Cart (${count})` : "Cart"), [mounted, count]);

  useEffect(() => setMounted(true), []);

  // Only show search input on shop page
  const showSearch = pathname?.startsWith("/shop");

  // Keep local state in sync when URL changes
  useEffect(() => {
    setQ(searchParams.get("q") ?? "");
  }, [searchParams]);

  // Debounced URL update for search on /shop
  useEffect(() => {
    if (!showSearch) return;
    const t = setTimeout(() => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      if (q.trim()) params.set("q", q.trim());
      else params.delete("q");
      router.replace(`/shop?${params.toString()}`);
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, showSearch]);

  const active = (href: string) => pathname === href || pathname?.startsWith(href + "/");

  return (
    <header className="border-b border-slate-200 bg-white">
      <Container className="py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1 font-extrabold text-xl">
            <span className="text-slate-900">Dairy</span>
            <span className="text-sky-600">Shop</span>
          </Link>

          {showSearch && (
            <div className="flex-1">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search milk, yogurt, cheese…"
              />
            </div>
          )}

          <nav className="ml-auto flex items-center gap-6 text-sm font-semibold">
            <Link className={cn(active("/shop") ? "text-slate-900" : "text-slate-600 hover:text-slate-900")} href="/shop">
              Shop
            </Link>
            <Link
              className={cn(active("/subscribe") ? "text-slate-900" : "text-slate-600 hover:text-slate-900")}
              href="/subscribe"
            >
              Subscribe
            </Link>
            <Link
              className={cn(
                "rounded-2xl border border-slate-200 px-4 py-2 hover:bg-slate-50",
                active("/cart") && "border-slate-300"
              )}
              href="/cart"
            >
              {cartLabel}
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  );
}
