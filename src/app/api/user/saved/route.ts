import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionId } from "@/lib/session";

export const dynamic = "force-dynamic";

// GET /api/user/saved — list this visitor's saved listings
export async function GET() {
  const sessionId = await getSessionId();
  const saved = await db.savedListing.findMany({
    where: { sessionId },
    orderBy: { createdAt: "desc" },
    include: { listing: { include: { category: true } } },
  });
  return NextResponse.json({ saved: saved.map((s) => s.listing) });
}

// POST /api/user/saved { listingId }
export async function POST(req: NextRequest) {
  const sessionId = await getSessionId();
  const { listingId } = await req.json();
  if (!listingId) return NextResponse.json({ error: "listingId required" }, { status: 400 });

  try {
    await db.savedListing.upsert({
      where: { sessionId_listingId: { sessionId, listingId } },
      update: {},
      create: { sessionId, listingId },
    });
  } catch {
    return NextResponse.json({ error: "Could not save listing" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}

// DELETE /api/user/saved?listingId=xxx
export async function DELETE(req: NextRequest) {
  const sessionId = await getSessionId();
  const { searchParams } = new URL(req.url);
  const listingId = searchParams.get("listingId");
  if (!listingId) return NextResponse.json({ error: "listingId required" }, { status: 400 });

  await db.savedListing.deleteMany({ where: { sessionId, listingId } });
  return NextResponse.json({ ok: true });
}
