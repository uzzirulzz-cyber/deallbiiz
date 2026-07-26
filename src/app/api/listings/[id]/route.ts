import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionId } from "@/lib/session";
import { attachCategory } from "@/lib/category-helpers";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await db.listing.findUnique({ where: { id } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  db.listing.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => {});
  const sessionId = await getSessionId();
  const saved = await db.savedListing.findUnique({ where: { sessionId_listingId: { sessionId, listingId: id } } });
  const inquired = await db.inquiry.findUnique({ where: { sessionId_listingId: { sessionId, listingId: id } } });
  return NextResponse.json({ listing: listing ? await attachCategory(listing) : null, saved: !!saved, inquired: !!inquired });
}
