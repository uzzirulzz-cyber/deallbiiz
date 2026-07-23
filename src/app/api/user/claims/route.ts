import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionId } from "@/lib/session";

export const dynamic = "force-dynamic";

// POST /api/user/claims  { dealId }  — record a claim (used "Get Deal") + bump count
export async function POST(req: NextRequest) {
  const sessionId = await getSessionId();
  const { dealId } = await req.json();
  if (!dealId) return NextResponse.json({ error: "dealId required" }, { status: 400 });

  const deal = await db.deal.findUnique({ where: { id: dealId } });
  if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

  const existing = await db.claim.findUnique({
    where: { sessionId_dealId: { sessionId, dealId } },
  });
  if (!existing) {
    await db.claim.create({ data: { sessionId, dealId } });
    await db.deal.update({
      where: { id: dealId },
      data: { claimedCount: { increment: 1 } },
    });
  }
  return NextResponse.json({ ok: true, claimedCount: deal.claimedCount + (existing ? 0 : 1) });
}
