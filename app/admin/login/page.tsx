"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, CardContent, Container, Input } from "@/components/ui/ui";

export default function AdminLoginPage() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function login() {
    setErr(null);
    const k = key.trim();
    if (!k) return setErr("Enter admin key.");

    setLoading(true);
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: k }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setLoading(false);
        return setErr(data?.error ?? "Invalid key.");
      }

      // store key for AdminGate
      localStorage.setItem("ADMIN_KEY", k);
      localStorage.setItem("admin_key", k); // compatibility
      router.push("/admin/orders");
    } catch (e: any) {
      setErr(e?.message ?? "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container className="pb-24">
      <Card className="max-w-xl mx-auto">
        <CardContent className="p-8 space-y-4">
          <div className="text-3xl font-extrabold">Admin Login</div>
          <div className="text-slate-600 font-semibold">Enter admin access key to view orders.</div>

          <Input
            disabled={loading}
            placeholder="Admin key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />

          {err ? <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-red-700 font-bold">{err}</div> : null}

          <Button className="w-full" onClick={login} disabled={loading}>
            {loading ? "Checking..." : "Login"}
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}
