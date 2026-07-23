import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/seed — ensure the database has data. Idempotent: only seeds if empty.
export async function GET() {
  const count = await db.listing.count();
  if (count > 0) {
    return NextResponse.json({ seeded: false, count });
  }
  return NextResponse.json({
    seeded: false,
    count: 0,
    message: "Run scripts/seed.ts for full data.",
  });
}
