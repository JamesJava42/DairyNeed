"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button, Card, CardContent, Container, Input } from "@/components/ui/ui";

export default function UpdatePasswordPage() {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [ready, setReady] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    // Supabase may send ?code=... for recovery flows (PKCE)
    const sp = new URLSearchParams(window.location.search);
    const code = sp.get("code");
    if (!code) {
      setReady(true);
      return;
    }

    (async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      setReady(true);
      if (error) setErr(error.message);
    })();
  }, []);

  async function update() {
    setErr(null);
    setMsg(null);
    if (!pw) return setErr("Enter new password.");
    if (pw !== pw2) return setErr("Passwords do not match.");

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setLoading(false);

    if (error) return setErr(error.message);
    setMsg("Password updated. You can sign in now.");
  }

  return (
    <Container className="pb-24">
      <Card className="max-w-xl mx-auto">
        <CardContent className="p-8 space-y-4">
          <div className="text-3xl font-extrabold">Set new password</div>
          <div className="text-slate-600 font-semibold">Enter your new password.</div>

          {!ready ? (
            <div className="text-slate-600 font-semibold">Preparing…</div>
          ) : (
            <>
              <Input disabled={loading} placeholder="New password" type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
              <Input disabled={loading} placeholder="Re-enter new password" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} />

              {err ? <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-red-700 font-bold">{err}</div> : null}
              {msg ? <div className="rounded-2xl border border-green-200 bg-green-50 p-3 text-green-800 font-bold">{msg}</div> : null}

              <Button className="w-full" onClick={update} disabled={loading}>
                {loading ? "Updating..." : "Update password"}
              </Button>

              <div className="text-sm font-semibold text-slate-600">
                <Link className="underline" href="/login">Go to sign in</Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
