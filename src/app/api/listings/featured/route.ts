import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { attachCategory } from "@/lib/category-helpers";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET() {
  const listing = (await db.listing.findFirst({ where: { featured: true, verified: true }, orderBy: [{ annualRevenue: "desc" }, { askingPrice: "desc" }] })) ||
    (await db.listing.findFirst({ where: { verified: true }, orderBy: [{ annualRevenue: "desc" }] }));
  if (!listing) return NextResponse.json({ listing: null });
  return NextResponse.json({ listing: await attachCategory(listing) });
}
