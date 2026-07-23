import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/listings/trending — top trending listings for the live rail
export async function GET() {
  const listings = await db.listing.findMany({
    where: { trending: true, verified: true },
    orderBy: [{ inquiryCount: "desc" }, { viewCount: "desc" }],
    take: 8,
    include: { category: true },
  });
  return NextResponse.json({ listings });
}
