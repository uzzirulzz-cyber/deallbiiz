import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/deals/featured  — the single hero "Deal of the Day"
export async function GET() {
  // Prefer a featured flash deal, else any featured deal, else the highest-discount flash deal
  const deal =
    (await db.deal.findFirst({
      where: { featured: true, flashDeal: true, expiresAt: { gt: new Date() } },
      orderBy: { discountPct: "desc" },
      include: { category: true },
    })) ||
    (await db.deal.findFirst({
      where: { featured: true, expiresAt: { gt: new Date() } },
      orderBy: { discountPct: "desc" },
      include: { category: true },
    })) ||
    (await db.deal.findFirst({
      where: { flashDeal: true, expiresAt: { gt: new Date() } },
      orderBy: { discountPct: "desc" },
      include: { category: true },
    }));

  if (!deal) return NextResponse.json({ deal: null });
  return NextResponse.json({ deal });
}
