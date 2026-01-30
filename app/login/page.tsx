"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button, Card, CardContent, Container, Input } from "@/components/ui/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function onLogin() {
    setErr(null);
    setMsg(null);

    const e = email.trim();
    if (!e) return setErr("Enter email.");
    if (!password) return setErr("Enter password.");

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: e, password });
    setLoading(false);

    if (error) return setErr(error.message);

    setMsg("Signed in!");
    router.push("/shop");
  }

  return (
    <Container className="pb-24">
      <Card className="max-w-xl mx-auto">
        <CardContent className="p-8 space-y-4">
          <div className="text-3xl font-extrabold">Sign in</div>
          <div className="text-slate-600 font-semibold">Sign in to view your orders and profile.</div>

          <div className="space-y-3">
            <Input disabled={loading} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input
              disabled={loading}
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {err ? <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-red-700 font-bold">{err}</div> : null}
          {msg ? <div className="rounded-2xl border border-green-200 bg-green-50 p-3 text-green-800 font-bold">{msg}</div> : null}

          <Button className="w-full" onClick={onLogin} disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>

          <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
            <Link className="underline" href="/reset-password">Forgot password?</Link>
            <Link className="underline" href="/signup">Create account</Link>
          </div>

          <div className="text-xs text-slate-500 font-semibold">
            Guest users can still order without signing in.
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
