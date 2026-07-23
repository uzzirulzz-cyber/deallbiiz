import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionId } from "@/lib/session";
import ZAI from "z-ai-web-dev-sdk";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are "Dealio", the witty, concise AI deal-hunting assistant for Take This Deal (akethisdeal.biz).
Your job: help the visitor find the best deal for their need, or decide whether a deal is worth it.

Rules:
- Be friendly, energetic and SHORT. Max 4-5 sentences per reply. Use emojis sparingly (1-2 per reply max).
- When you reference deals from the provided context, mention the deal title, store, deal price and the % off.
- If the visitor asks for something we don't have, say so honestly and suggest 1-2 closest matches from context, OR tell them to try the "Snap a Deal" or "Search the Web" feature.
- Never invent prices, stores or discounts that aren't in the provided context. If you must estimate, say "around".
- End every reply with one concrete next step (e.g. "Want me to pull up the top 3 under $50?").`;

interface DealRow {
  id: string;
  title: string;
  store: string;
  dealPrice: number;
  originalPrice: number;
  discountPct: number;
  categorySlug: string;
  tags: string;
  expiresAt: Date;
}

function buildContext(deals: DealRow[]): string {
  if (!deals.length) return "(No live deals available right now.)";
  const lines = deals.map(
    (d) =>
      `• [${d.categorySlug}] ${d.title} — ${d.store}, $${d.dealPrice} (was $${d.originalPrice}, -${d.discountPct}%), tags: ${d.tags}, expires ${d.expiresAt.toISOString()}`,
  );
  return "Live deals in our catalogue right now:\n" + lines.join("\n");
}

// POST /api/chat  { message, history?: [{role,content}] }
export async function POST(req: NextRequest) {
  try {
    const sessionId = await getSessionId();
    const body = await req.json();
    const message: string = String(body?.message || "").slice(0, 1000);
    const history: Array<{ role: string; content: string }> = Array.isArray(body?.history)
      ? body.history.slice(-8)
      : [];

    if (!message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Pull live deals for context
    const liveDeals = await db.deal.findMany({
      where: { expiresAt: { gt: new Date() } },
      orderBy: { claimedCount: "desc" },
      take: 24,
      select: {
        id: true,
        title: true,
        store: true,
        dealPrice: true,
        originalPrice: true,
        discountPct: true,
        categorySlug: true,
        tags: true,
        expiresAt: true,
      },
    });
    const context = buildContext(liveDeals);

    // Persist the user message
    await db.chatMessage.create({
      data: { sessionId, role: "user", content: message },
    });

    const zai = await ZAI.create();
    const messages: any[] = [
      { role: "assistant", content: SYSTEM_PROMPT },
      { role: "assistant", content: `Catalogue context:\n${context}` },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: "disabled" },
    });

    const reply = completion.choices?.[0]?.message?.content || "Hmm, I couldn't generate a reply. Try rephrasing?";

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
