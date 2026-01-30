// app/api/admin/verify/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const key = String(body?.key ?? "").trim();

    const expected = String(process.env.ADMIN_KEY ?? "").trim();
    if (!expected) {
      return NextResponse.json({ error: "Missing ADMIN_KEY in .env.local" }, { status: 500 });
    }

    if (!key) {
      return NextResponse.json({ error: "Missing key" }, { status: 400 });
    }

    if (key !== expected) {
      return NextResponse.json({ error: "Invalid admin key" }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}

// (Optional) allow GET to avoid confusion if you open the URL in browser
export async function GET() {
  return NextResponse.json({ ok: true, message: "Use POST with { key }" });
}
