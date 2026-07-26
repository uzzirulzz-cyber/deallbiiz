import { NextRequest, NextResponse } from "next/server";
import { loginAdmin } from "@/lib/admin";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const password = String(body?.password || "");
  if (!password) return NextResponse.json({ error: "Password required" }, { status: 400 });
  const ok = await loginAdmin(password);
  if (!ok) return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  return NextResponse.json({ ok: true });
}
