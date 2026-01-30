"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button, Card, CardContent, Container, Input } from "@/components/ui/ui";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function send() {
    setErr(null);
    setMsg(null);

    const e = email.trim();
    if (!e) return setErr("Enter your email.");

    setLoading(true);
    const redirectTo = `${window.location.origin}/update-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(e, { redirectTo });
    setLoading(false);

    if (error) return setErr(error.message);
    setMsg("Password reset email sent. Check your inbox.");
  }

  return (
    <Container className="pb-24">
      <Card className="max-w-xl mx-auto">
        <CardContent className="p-8 space-y-4">
          <div className="text-3xl font-extrabold">Reset password</div>
          <div className="text-slate-600 font-semibold">We’ll email you a link to set a new password.</div>

          <Input disabled={loading} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

          {err ? <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-red-700 font-bold">{err}</div> : null}
          {msg ? <div className="rounded-2xl border border-green-200 bg-green-50 p-3 text-green-800 font-bold">{msg}</div> : null}

          <Button className="w-full" onClick={send} disabled={loading}>
            {loading ? "Sending..." : "Send reset email"}
          </Button>

          <div className="text-sm font-semibold text-slate-600">
            <Link className="underline" href="/login">Back to sign in</Link>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
