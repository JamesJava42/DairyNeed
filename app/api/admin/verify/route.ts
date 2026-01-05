
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const key = req.headers.get("x-admin-key");

  if (!key || key !== process.env.ADMIN_KEY) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
