import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import ZAI from "z-ai-web-dev-sdk";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const PROMPT = `You are a deal-extraction engine. The user uploaded a screenshot of a product/deal listing.
Extract structured deal information from the image. Respond with ONLY a valid JSON object (no markdown, no prose) with these fields:

{
  "title": "product title (max 120 chars)",
  "store": "store or brand name (max 60 chars)",
  "storeLogo": "a single emoji that best represents the store/product",
  "description": "1-2 sentence summary of the product and the deal (max 200 chars)",
  "originalPrice": number (the original/list price, 0 if unknown),
  "dealPrice": number (the sale price, 0 if unknown),
  "currency": "USD" (or detected currency code),
  "url": "" (leave empty if not visible),
  "categorySlug": one of "tech","fashion","home","gaming","beauty","travel","fitness","food",
  "tags": "comma,separated,keywords",
  "confidence": number between 0 and 1
}

If you cannot confidently read a field, use a sensible default (0 for prices, "" for text). Always pick the closest categorySlug even if imperfect.`;

// POST /api/deals/analyze  { image: "data:image/...;base64,...." }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const image: string = body?.image;
    if (!image || !image.startsWith("data:image/")) {
      return NextResponse.json({ error: "A base64 data: image is required" }, { status: 400 });
    }
    if (image.length > 6_000_000) {
      return NextResponse.json({ error: "Image too large (max 6MB)" }, { status: 413 });
    }

    const zai = await ZAI.create();
    const response = await zai.chat.completions.createVision({
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: PROMPT },
            { type: "image_url", image_url: { url: image } },
          ],
        },
      ],
      thinking: { type: "disabled" },
    });

    const raw = response.choices?.[0]?.message?.content || "";
    let parsed: any = null;
    // The model may wrap JSON in ```json fences — strip them.
    const cleaned = raw
      .trim()
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // try to extract the first {...} block
      const m = cleaned.match(/\{[\s\S]*\}/);
      if (m) {
        try {
          parsed = JSON.parse(m[0]);
        } catch {
          parsed = null;
        }
      }
    }

    if (!parsed) {
      return NextResponse.json(
        { error: "Could not parse deal from image", raw },
        { status: 422 },
      );
    }

    // Validate category slug against the DB
    const validSlugs = (await db.category.findMany({ select: { slug: true } })).map((c) => c.slug);
    if (!validSlugs.includes(parsed.categorySlug)) {
      parsed.categorySlug = "tech";
    }
    parsed.originalPrice = Number(parsed.originalPrice) || 0;
    parsed.dealPrice = Number(parsed.dealPrice) || 0;
    parsed.currency = String(parsed.currency || "USD").toUpperCase().slice(0, 3);

    return NextResponse.json({ deal: parsed });
  } catch (e: any) {
    console.error("[/api/deals/analyze] error", e);
    return NextResponse.json({ error: e?.message || "Analysis failed" }, { status: 500 });
  }
}
