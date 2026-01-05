"use client";

import Link from "next/link";
import { useCart } from "@/store/cartStore"; // <-- adjust path if neededS
export function Header() {
const count = useCart((s) => s.items.reduce((a, i) => a + i.qty, 0));

  return (
    <header className="sticky top-0 z-30 border-b border-[rgb(var(--border))] bg-white/80 backdrop-blur">
      <div className="container-page h-16 flex items-center gap-3">
        <Link href="/" className="font-extrabold tracking-tight text-lg">
          Dairy<span className="text-[rgb(var(--primary))]">Shop</span>
        </Link>

        <div className="flex-1 hidden md:flex">
          <div className="w-full max-w-xl relative">
            <input
              placeholder="Search milk, yogurt, cheese..."
              className="w-full rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[rgb(var(--primary-soft))]"
            />
          </div>
        </div>

        <nav className="flex items-center gap-3">
          <Link href="/shop" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
            Shop
          </Link>
          <Link href="/subscribe" className="text-sm font-semibold text-slate-700 hover:text-slate-900">
            Subscribe
          </Link>
          <Link
            href="/cart"
            className="relative rounded-xl border border-[rgb(var(--border))] px-3 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            Cart
            {count > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-[rgb(var(--primary))] px-2 py-0.5 text-xs text-white">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
