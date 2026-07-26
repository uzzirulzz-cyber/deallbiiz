import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { attachCategories, attachCategory } from "@/lib/category-helpers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const sort = searchParams.get("sort") || "trending";
    const q = searchParams.get("q")?.trim() || undefined;
    const featured = searchParams.get("featured") === "1";
    const trending = searchParams.get("trending") === "1";
    const stage = searchParams.get("stage") || undefined;
    const verified = searchParams.get("verified") === "1";
    const limit = Math.min(parseInt(searchParams.get("limit") || "48", 10) || 48, 100);

    const where: any = {};
    if (category && category !== "all") where.categorySlug = category;
    if (featured) where.featured = true;
    if (trending) where.trending = true;
    if (stage && stage !== "all") where.stage = stage;
    if (verified) where.verified = true;
    if (q) {
      where.OR = [
        { title: { contains: q } }, { tagline: { contains: q } },
        { description: { contains: q } }, { location: { contains: q } },
        { tags: { contains: q } }, { metrics: { contains: q } },
      ];
    }

    let orderBy: any = { trending: "desc" };
    if (sort === "asking") orderBy = [{ askingPrice: "asc" }, { trending: "desc" }];
    else if (sort === "asking-desc") orderBy = [{ askingPrice: "desc" }, { trending: "desc" }];
    else if (sort === "revenue") orderBy = [{ annualRevenue: "desc" }, { trending: "desc" }];
    else if (sort === "multiple") orderBy = [{ revenueMultiple: "asc" }, { trending: "desc" }];
    else if (sort === "newest") orderBy = { createdAt: "desc" };
    else if (sort === "popular") orderBy = [{ viewCount: "desc" }, { inquiryCount: "desc" }];
    else if (sort === "rating") orderBy = { rating: "desc" };

    const listings = await db.listing.findMany({ where, orderBy, take: limit });
    const withCats = await attachCategories(listings);
    return NextResponse.json({ listings: withCats, count: withCats.length });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const required = ["title", "categorySlug", "askingPrice", "imageUrl"];
    for (const k of required) {
      if (body[k] === undefined || body[k] === null || body[k] === "") {
        return NextResponse.json({ error: `Missing field: ${k}` }, { status: 400 });
      }
    }
    const askingPrice = Number(body.askingPrice);
    if (!isFinite(askingPrice) || askingPrice < 0) {
      return NextResponse.json({ error: "Invalid asking price" }, { status: 400 });
    }
    const annualRevenue = Number(body.annualRevenue) || 0;
    const annualProfit = Number(body.annualProfit) || 0;
    const revenueMultiple = annualRevenue > 0 ? Math.round((askingPrice / annualRevenue) * 100) / 100 : 0;
    const profitMultiple = annualProfit > 0 ? Math.round((askingPrice / annualProfit) * 100) / 100 : 0;

    const listing = await db.listing.create({
      data: {
        title: String(body.title).slice(0, 200),
        tagline: String(body.tagline || "").slice(0, 160),
        description: String(body.description || "").slice(0, 2000),
        categorySlug: String(body.categorySlug),
        askingPrice,
        valuation: Number(body.valuation) || askingPrice,
        currency: String(body.currency || "USD"),
        annualRevenue, annualProfit, revenueMultiple, profitMultiple,
        stage: String(body.stage || "Growth").slice(0, 32),
        location: String(body.location || "Global / makethisdeal.biz").slice(0, 100),
        ageYears: Number(body.ageYears) || 0,
        employees: Number(body.employees) || 0,
        verified: body.verified !== undefined ? Boolean(body.verified) : true,
        featured: Boolean(body.featured),
        trending: Boolean(body.trending),
        imageUrl: String(body.imageUrl).slice(0, 500),
        metrics: String(body.metrics || "").slice(0, 200),
        tags: String(body.tags || "").slice(0, 200),
        url: String(body.url || "").slice(0, 500),
        rating: Number(body.rating) || 4.5,
      },
    });
    const withCat = await attachCategory(listing);
    return NextResponse.json({ listing: withCat }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to create listing" }, { status: 500 });
  }
}
