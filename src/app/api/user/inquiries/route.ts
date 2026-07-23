import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionId } from "@/lib/session";

export const dynamic = "force-dynamic";

// POST /api/user/inquiries { listingId, message? } — record a contact/inquiry + bump count
export async function POST(req: NextRequest) {
  const sessionId = await getSessionId();
  const body = await req.json();
  const listingId = body?.listingId;
  if (!listingId) return NextResponse.json({ error: "listingId required" }, { status: 400 });

  const listing = await db.listing.findUnique({ where: { id: listingId } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const existing = await db.inquiry.findUnique({
    where: { sessionId_listingId: { sessionId, listingId } },
  });
  if (!existing) {
    await db.inquiry.create({
      data: { sessionId, listingId, message: String(body?.message || "").slice(0, 1000) },
    });
    await db.listing.update({
      where: { id: listingId },
      data: { inquiryCount: { increment: 1 } },
    });
  }
  return NextResponse.json({ ok: true, inquiryCount: listing.inquiryCount + (existing ? 0 : 1) });
}
