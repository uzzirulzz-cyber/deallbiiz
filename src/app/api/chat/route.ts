import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionId } from "@/lib/session";
import ZAI from "z-ai-web-dev-sdk";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are "Dealio", the AI valuation & deal advisor for Make This Deal (makethisdeal.biz) — the global enterprise marketplace where people buy, sell, and invest in businesses (SaaS, E-commerce, Real Estate, Startups, AI Solutions, FinTech, and more). Tagline: "Together We Grow Strong."

Your job: help buyers, sellers, and investors value businesses, compare listings, and decide whether a deal is worth pursuing.

Rules:
- Be professional, concise, and deal-savvy. Max 4-5 sentences per reply. 1-2 emojis max.
- When referencing listings from the provided context, mention the business name, category, asking price, revenue, and revenue multiple.
- For valuations, use standard M&A heuristics: SaaS 3-8x ARR (higher for >$1M ARR + high retention), E-commerce 0.3-0.8x revenue or 2-4x profit, content sites 30-40x monthly profit, agencies 1-3x profit. State the multiple you'd apply and the implied value.
- If asked about a listing we don't have, say so and suggest the closest matches from context, or point them to "Snap a Listing" (upload financials) or "Web Search".
- Never invent financials that aren't in context. If estimating, say "roughly" and show your math.
- End every reply with one concrete next step (e.g. "Want me to compare this against the top 3 SaaS listings under $1M?").
- The user may be a buyer, seller, or investor — tailor advice accordingly.`;

interface ListingRow {
  id: string;
  title: string;
  categorySlug: string;
  askingPrice: number;
  annualRevenue: number;
  annualProfit: number;
  revenueMultiple: number;
  stage: string;
  location: string;
  metrics: string;
}

function buildContext(listings: ListingRow[]): string {
  if (!listings.length) return "(No live listings available right now.)";
  const lines = listings.map(
    (l) =>
      `• [${l.categorySlug}] ${l.title} — asking $${l.askingPrice.toLocaleString()}, revenue $${l.annualRevenue.toLocaleString()}/yr, profit $${l.annualProfit.toLocaleString()}/yr, ${l.revenueMultiple}x revenue, ${l.stage} stage, ${l.location}. Metrics: ${l.metrics}`,
  );
  return "Live listings on the marketplace right now:\n" + lines.join("\n");
}

// POST /api/chat { message, history?: [{role,content}] }
export async function POST(req: NextRequest) {
  try {
    const sessionId = await getSessionId();
    const body = await req.json();
    const message: string = String(body?.message || "").slice(0, 1500);
    const history: Array<{ role: string; content: string }> = Array.isArray(body?.history)
      ? body.history.slice(-8)
      : [];

    if (!message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const liveListings = await db.listing.findMany({
      where: { verified: true },
      orderBy: [{ inquiryCount: "desc" }, { viewCount: "desc" }],
      take: 24,
      select: {
        id: true,
        title: true,
        categorySlug: true,
        askingPrice: true,
        annualRevenue: true,
        annualProfit: true,
        revenueMultiple: true,
        stage: true,
        location: true,
        metrics: true,
      },
    });
    const context = buildContext(liveListings);

    await db.chatMessage.create({
      data: { sessionId, role: "user", content: message },
    });

    const zai = await ZAI.create();
    const messages: any[] = [
      { role: "assistant", content: SYSTEM_PROMPT },
      { role: "assistant", content: `Marketplace context:\n${context}` },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: "disabled" },
    });

    const reply = completion.choices?.[0]?.message?.content || "I couldn't generate a reply. Try rephrasing?";

    await db.chatMessage.create({
      data: { sessionId, role: "assistant", content: reply },
    });

    return NextResponse.json({ reply });
  } catch (e: any) {
    console.error("[/api/chat] error", e);
    return NextResponse.json(
      { error: e?.message || "Chat failed", reply: "Sorry, I hit a snag. Try again in a moment?" },
      { status: 500 },
    );
  }
}
