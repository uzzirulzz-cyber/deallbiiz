import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/deals/trending  — top trending deals for the live sidebar
export async function GET() {
  const deals = await db.deal.findMany({
    where: { trending: true, expiresAt: { gt: new Date() } },
    orderBy: [{ claimedCount: "desc" }, { viewCount: "desc" }],
    take: 8,
    include: { category: true },
  });
  return NextResponse.json({ deals });
}
