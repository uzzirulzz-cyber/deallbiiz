import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionId } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deal = await db.deal.findUnique({
    where: { id },
    include: { category: true, reviews: true },
  });
  if (!deal) return NextResponse.json({ error: "Deal not found" }, { status: 404 });

  // Increment view count (fire and forget)
  db.deal.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  const sessionId = await getSessionId();
  const saved = await db.savedDeal.findUnique({
    where: { sessionId_dealId: { sessionId, dealId: id } },
  });
  const claimed = await db.claim.findUnique({
    where: { sessionId_dealId: { sessionId, dealId: id } },
  });

  return NextResponse.json({ deal, saved: !!saved, claimed: !!claimed });
}
