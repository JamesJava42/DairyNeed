"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button, Card, CardContent, Container, Input } from "@/components/ui/ui";

export default function SignupPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSignup() {
    setErr(null);
    setMsg(null);

    const e = email.trim();
    const u = username.trim();

    if (!e) return setErr("Enter email.");
    if (!pw) return setErr("Enter password.");
    if (pw !== pw2) return setErr("Passwords do not match.");

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: e,
      password: pw,
      options: {
        data: { username: u || undefined },
      },
    });
    setLoading(false);

    if (error) return setErr(error.message);

    setMsg("Account created. You can sign in now.");
    router.push("/login");
  }

  return (
    <Container className="pb-24">
      <Card className="max-w-xl mx-auto">
        <CardContent className="p-8 space-y-4">
          <div className="text-3xl font-extrabold">Create account</div>
          <div className="text-slate-600 font-semibold">Use email + password. Guest checkout still works.</div>

          <div className="space-y-3">
            <Input disabled={loading} placeholder="Username (optional)" value={username} onChange={(e) => setUsername(e.target.value)} />
            <Input disabled={loading} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input disabled={loading} placeholder="Password" type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
            <Input disabled={loading} placeholder="Re-enter password" type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
          </div>

          {err ? <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-red-700 font-bold">{err}</div> : null}
          {msg ? <div className="rounded-2xl border border-green-200 bg-green-50 p-3 text-green-800 font-bold">{msg}</div> : null}

          <Button className="w-full" onClick={onSignup} disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </Button>

          <div className="text-sm font-semibold text-slate-600">
            Already have an account? <Link className="underline" href="/login">Sign in</Link>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
