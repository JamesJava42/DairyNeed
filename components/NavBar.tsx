"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/store/cartStore";
import { Button } from "@/components/ui/ui";
import { useAuth } from "@/components/auth/AuthProvider";

function money(n: number) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "$0.00";
  return `$${x.toFixed(2)}`;
}

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { user, displayName, signOut, loading: authLoading } = useAuth();

  const isAdmin = pathname.startsWith("/admin");
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/reset-password" ||
    pathname === "/update-password";

  const showSearch = pathname === "/shop" && !isAuthPage;

  const items = useCart((s) => s.items);
  const total = useCart((s) => s.total());

  const count = useMemo(() => items.reduce((sum, i) => sum + Number(i.qty || 0), 0), [items]);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [q, setQ] = useState("");

  useEffect(() => {
    if (!showSearch) return;
    const next = (searchParams.get("q") ?? "").trim();
    setQ((prev) => (prev === next ? prev : next));
  }, [showSearch, searchParams]);

  useEffect(() => {
    if (!showSearch) return;
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const next = q.trim();
      if (next) params.set("q", next);
      else params.delete("q");
      router.replace(`/shop?${params.toString()}`);
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, showSearch]);

  async function onSignOut() {
    await signOut();
    router.push("/shop");
  }

  // Admin header
  if (isAdmin) {
    return (
      <div className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="font-extrabold">Admin • Rockview Dairy</div>
          <div className="flex gap-2">
            <Link href="/admin/orders">
              <Button variant="secondary">Orders</Button>
            </Link>
            <Link href="/">
              <Button variant="ghost">Customer site</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Minimal header for auth pages (no cart display)
  if (isAuthPage) {
    return (
      <div className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
          <Link href="/" className="font-extrabold">
            Rockview Dairy
          </Link>
          <Link href="/shop">
            <Button variant="secondary">Back to shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/" className="font-extrabold">
          Rockview Dairy
        </Link>

        {showSearch ? (
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search dairy..."
            className="flex-1 max-w-md rounded-2xl border border-slate-200 bg-white px-4 py-2 font-semibold"
          />
        ) : (
          <div className="flex gap-2">
            <Link href="/shop">
              <Button variant="ghost">Shop</Button>
            </Link>
          </div>
        )}

        <div className="flex items-center gap-2">
          {!authLoading && !user ? (
            <>
              <Link href="/login">
                <Button variant="ghost">Sign in</Button>
              </Link>
              <Link href="/signup">
                <Button variant="secondary">Sign up</Button>
              </Link>

              {/* ✅ NEW: Admin login next to sign in/up */}
              <Link href="/admin/login">
                <Button variant="ghost">Admin</Button>
              </Link>
            </>
          ) : null}

          {!authLoading && user ? (
            <>
              <Link href="/orders">
                <Button variant="ghost">My orders</Button>
              </Link>
              <Button variant="secondary" onClick={onSignOut}>
                Sign out ({displayName})
              </Button>
            </>
          ) : null}

          <Link href="/cart">
            <Button variant="secondary">
              Cart{mounted && count > 0 ? ` • ${count} • ${money(total)}` : ""}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
