import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { attachCategories } from "@/lib/category-helpers";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET() {
  const listings = await db.listing.findMany({ where: { trending: true, verified: true }, orderBy: [{ inquiryCount: "desc" }, { viewCount: "desc" }], take: 8 });
  return NextResponse.json({ listings: await attachCategories(listings) });
}
