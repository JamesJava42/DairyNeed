// components/Header.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/store/cartStore";

export function Header() {
  const pathname = usePathname();
  const count = useCart((s) => s.items.reduce((a, i) => a + i.qty, 0));

  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMenuOpen(false), [pathname]);

  const active = (href: string) => pathname === href || pathname?.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-40 border-b border-[rgb(var(--border))] bg-white/80 backdrop-blur">
      <div className="container-page py-3">
        {/* top row */}
        <div className="flex items-center gap-3">
          <Link href="/" className="font-extrabold tracking-tight text-lg">
            Dairy<span className="text-[rgb(var(--primary))]">Shop</span>
          </Link>

          {/* desktop nav */}
          <nav className="ml-auto hidden sm:flex items-center gap-3">
            <Link
              href="/shop"
              className={`text-sm font-semibold ${active("/shop") ? "text-slate-900" : "text-slate-700 hover:text-slate-900"}`}
            >
              Shop
            </Link>
            <Link
              href="/subscribe"
              className={`text-sm font-semibold ${
                active("/subscribe") ? "text-slate-900" : "text-slate-700 hover:text-slate-900"
              }`}
            >
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

          {/* mobile actions */}
          <div className="ml-auto flex items-center gap-2 sm:hidden">
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

            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-xl border border-[rgb(var(--border))] p-2 hover:bg-slate-50"
            >
              <div className="grid gap-1">
                <span className="block h-0.5 w-5 bg-slate-700" />
                <span className="block h-0.5 w-5 bg-slate-700" />
                <span className="block h-0.5 w-5 bg-slate-700" />
              </div>
            </button>
          </div>
        </div>

        {/* mobile menu */}
        {menuOpen && (
          <div className="mt-3 sm:hidden rounded-2xl border border-[rgb(var(--border))] bg-white p-2">
            <div className="grid gap-1 text-sm font-semibold">
              <Link
                href="/shop"
                className={`rounded-xl px-3 py-2 ${active("/shop") ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"}`}
              >
                Shop
              </Link>
              <Link
                href="/subscribe"
                className={`rounded-xl px-3 py-2 ${
                  active("/subscribe") ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                Subscribe
              </Link>
              <Link
                href="/admin/orders"
                className={`rounded-xl px-3 py-2 ${active("/admin") ? "bg-slate-100 text-slate-900" : "text-slate-700 hover:bg-slate-50"}`}
              >
                Admin
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
