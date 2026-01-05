"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardContent, Input } from "@/components/ui/ui";

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [adminKey, setAdminKey] = useState("");
  const [ok, setOk] = useState(false);
  const [checking, setChecking] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function verify(key: string) {
    const res = await fetch("/api/admin/verify", { headers: { "x-admin-key": key } });
    return res.ok;
  }

  useEffect(() => {
    const saved = localStorage.getItem("ADMIN_KEY");
    (async () => {
      if (!saved) {
        setChecking(false);
        return;
      }
      const valid = await verify(saved);
      setOk(valid);
      setErr(valid ? null : "Admin key invalid. Please login again.");
      setChecking(false);
    })();
  }, []);

  async function login() {
    setErr(null);
    setChecking(true);
    const valid = await verify(adminKey);
    if (!valid) {
      setErr("Invalid admin key.");
      setChecking(false);
      return;
    }
    localStorage.setItem("ADMIN_KEY", adminKey);
    setOk(true);
    setChecking(false);
  }

  function logout() {
    localStorage.removeItem("ADMIN_KEY");
    setOk(false);
    setAdminKey("");
  }

  if (checking && !ok) {
    return (
      <Card>
        <CardContent className="p-10 text-slate-600">Checking admin access…</CardContent>
      </Card>
    );
  }

  if (!ok) {
    return (
      <Card>
        <CardContent className="p-10 space-y-4 max-w-xl">
          <div className="text-3xl font-extrabold">Admin Login</div>
          <div className="text-slate-600">Enter admin key to manage orders and subscriptions.</div>

          <Input
            placeholder="Admin Key"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
          />

          {err && <div className="text-red-600 font-semibold">{err}</div>}

          <Button onClick={login}>Login</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button className="text-sm font-semibold text-slate-600 hover:text-slate-900" onClick={logout}>
          Logout
        </button>
      </div>
      {children}
    </div>
  );
}
