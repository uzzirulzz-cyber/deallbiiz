import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionId } from "@/lib/session";

export const dynamic = "force-dynamic";

// GET /api/user/saved  — list this visitor's saved deals
export async function GET() {
  const sessionId = await getSessionId();
  const saved = await db.savedDeal.findMany({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
    include: { deal: { include: { category: true } } },
  });
  return NextResponse.json({ saved: saved.map((s) => s.deal) });
}

// POST /api/user/saved  { dealId }  — save a deal
export async function POST(req: NextRequest) {
  const sessionId = await getSessionId();
  const { dealId } = await req.json();
  if (!dealId) return NextResponse.json({ error: "dealId required" }, { status: 400 });

  try {
    await db.savedDeal.upsert({
      where: { sessionId_dealId: { sessionId, dealId } },
      update: {},
      create: { sessionId, dealId },
    });
  } catch {
    return NextResponse.json({ error: "Could not save deal" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

// DELETE /api/user/saved?dealId=xxx  — unsave a deal
export async function DELETE(req: NextRequest) {
  const sessionId = await getSessionId();
  const { searchParams } = new URL(req.url);
  const dealId = searchParams.get("dealId");
  if (!dealId) return NextResponse.json({ error: "dealId required" }, { status: 400 });

  await db.savedDeal.deleteMany({ where: { sessionId, dealId } });
  return NextResponse.json({ ok: true });
}
