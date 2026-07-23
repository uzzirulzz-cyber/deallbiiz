import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface SearchResult {
  url: string;
  name: string;
  snippet: string;
  host_name: string;
  rank: number;
  date?: string;
  favicon?: string;
}

// GET /api/deals/search-web?q=headphones+deal&num=8
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const num = Math.min(parseInt(searchParams.get("num") || "8", 10) || 8, 15);
  if (!q) return NextResponse.json({ error: "Query (q) is required" }, { status: 400 });

  try {
    const zai = await ZAI.create();
    const results = (await zai.functions.invoke("web_search", {
      query: `${q} deal discount coupon sale price`,
      num,
    })) as SearchResult[];

    const deals = (Array.isArray(results) ? results : []).map((r) => ({
      title: r.name,
      store: r.host_name.replace(/^www\./, ""),
      storeLogo: "🔗",
      description: r.snippet,
      url: r.url,
      host: r.host_name,
      date: r.date,
      favicon: r.favicon,
    }));

    return NextResponse.json({ query: q, deals });
  } catch (e: any) {
    console.error("[/api/deals/search-web] error", e);
    return NextResponse.json({ error: e?.message || "Web search failed" }, { status: 500 });
  }
}
