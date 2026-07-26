import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const categories = await db.category.findMany({ orderBy: { name: "asc" } });
    const allListings = await db.listing.findMany({ select: { categorySlug: true } });
    const counts = new Map<string, number>();
    for (const l of allListings) {
      counts.set(l.categorySlug, (counts.get(l.categorySlug) || 0) + 1);
    }
    const withCounts = categories.map((c) => ({
      ...c,
      _count: { listings: counts.get(c.slug) || 0 },
    }));
    return NextResponse.json({ categories: withCounts });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
