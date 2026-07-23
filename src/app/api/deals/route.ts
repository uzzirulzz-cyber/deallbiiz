import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/deals?category=tech&sort=discount|price|expires|trending&q=...&flash=1&limit=24
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || undefined;
  const sort = searchParams.get("sort") || "discount";
  const q = searchParams.get("q")?.trim() || undefined;
  const flash = searchParams.get("flash") === "1";
  const trending = searchParams.get("trending") === "1";
  const featured = searchParams.get("featured") === "1";
  const limit = Math.min(parseInt(searchParams.get("limit") || "48", 10) || 48, 100);

  const where: any = { expiresAt: { gt: new Date() } };
  if (category && category !== "all") where.categorySlug = category;
  if (flash) where.flashDeal = true;
  if (trending) where.trending = true;
  if (featured) where.featured = true;
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { store: { contains: q } },
      { tags: { contains: q } },
    ];
  }

  let orderBy: any = { discountPct: "desc" };
  if (sort === "price") orderBy = { dealPrice: "asc" };
  else if (sort === "price-desc") orderBy = { dealPrice: "desc" };
  else if (sort === "expires") orderBy = { expiresAt: "asc" };
  else if (sort === "trending") orderBy = { viewCount: "desc" };
  else if (sort === "rating") orderBy = { rating: "desc" };
  else if (sort === "claimed") orderBy = { claimedCount: "desc" };

  const deals = await db.deal.findMany({
    where,
    orderBy,
    take: limit,
    include: { category: true },
  });

  return NextResponse.json({ deals, count: deals.length });
}

// POST /api/deals  — create a new deal (used by "Snap a Deal" + manual submit)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const required = ["title", "store", "imageUrl", "originalPrice", "dealPrice", "url", "categorySlug", "expiresAt"];
    for (const k of required) {
      if (body[k] === undefined || body[k] === null || body[k] === "") {
        return NextResponse.json({ error: `Missing field: ${k}` }, { status: 400 });
      }
    }
    const originalPrice = Number(body.originalPrice);
    const dealPrice = Number(body.dealPrice);
    if (!isFinite(originalPrice) || !isFinite(dealPrice) || originalPrice <= 0 || dealPrice <= 0) {
      return NextResponse.json({ error: "Invalid prices" }, { status: 400 });
    }
    const discountPct = Math.round(((originalPrice - dealPrice) / originalPrice) * 100);

    const deal = await db.deal.create({
      data: {
        title: String(body.title).slice(0, 200),
        description: String(body.description || "").slice(0, 1000),
        store: String(body.store).slice(0, 100),
        storeLogo: body.storeLogo ? String(body.storeLogo).slice(0, 16) : "🏷️",
        imageUrl: String(body.imageUrl).slice(0, 500),
        originalPrice,
        dealPrice,
        currency: String(body.currency || "USD"),
        discountPct,
        url: String(body.url).slice(0, 500),
        categorySlug: String(body.categorySlug),
        featured: false,
        trending: true, // user-submitted deals show up in the trending feed
        flashDeal: Boolean(body.flashDeal),
        expiresAt: new Date(body.expiresAt),
        rating: 4.5,
        tags: String(body.tags || ""),
      },
      include: { category: true },
    });

    return NextResponse.json({ deal }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to create deal" }, { status: 500 });
  }
}
