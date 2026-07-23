import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/listings/featured — the single hero "Featured Opportunity"
export async function GET() {
  const listing =
    (await db.listing.findFirst({
      where: { featured: true, verified: true },
      orderBy: [{ annualRevenue: "desc" }, { askingPrice: "desc" }],
      include: { category: true },
    })) ||
    (await db.listing.findFirst({
      where: { verified: true },
      orderBy: [{ annualRevenue: "desc" }],
      include: { category: true },
    }));

  if (!listing) return NextResponse.json({ listing: null });
  return NextResponse.json({ listing });
}
