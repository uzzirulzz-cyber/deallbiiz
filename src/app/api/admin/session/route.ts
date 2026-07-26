import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET() {
  return NextResponse.json({ authenticated: await isAdmin() });
}
