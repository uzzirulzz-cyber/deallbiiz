import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import ZAI from "z-ai-web-dev-sdk";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const PROMPT = `You are a business-listing extraction engine for Make This Deal, an enterprise M&A marketplace. The user uploaded a screenshot that may contain a business listing, financial dashboard, revenue report, or a screenshot of a business for sale.

Extract structured listing information. Respond with ONLY a valid JSON object (no markdown, no prose) with these fields:

{
  "title": "business name + short descriptor (max 120 chars, e.g. 'CloudInbox — Email Automation SaaS')",
  "tagline": "one-line pitch with key metric (max 140 chars, e.g. '$480K ARR · 92% margins · 4 years old')",
  "description": "2-3 sentence summary of the business and the opportunity (max 400 chars)",
  "categorySlug": one of "saas","ai","ecommerce","realestate","mobileapps","startups","fintech","healthtech","edtech","cybersecurity","crmerp","retail","wholesale","investments","domains","digitalproducts","manufacturing","websites",
  "askingPrice": number (the asking/listing price, 0 if unknown),
  "valuation": number (an independent valuation estimate if shown, else 0),
  "annualRevenue": number (annual/TTM revenue, 0 if unknown),
  "annualProfit": number (annual profit / SDE / cash flow, 0 if unknown),
  "stage": one of "Startup","Growth","Established",
  "location": "City, Country" or "Remote / Global",
  "ageYears": number (years in business, 0 if unknown),
  "employees": number (team size, 0 if unknown),
  "metrics": "comma-separated headline metrics visible (e.g. '1,200 customers, 96% retention')",
  "tags": "comma,separated,keywords",
  "confidence": number between 0 and 1
}

Rules:
- If a number isn't clearly visible, use 0 (not a guess).
- Pick the closest categorySlug even if imperfect.
- For stage: pre-revenue or <2yr = "Startup"; 2-5yr & growing = "Growth"; 5yr+ & profitable = "Established".
- Always return valid JSON only.`;

// POST /api/listings/analyze { image: "data:image/...;base64,..." }
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
    const cleaned = raw
      .trim()
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();
    try {
      parsed = JSON.parse(cleaned);
    } catch {
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
      return NextResponse.json({ error: "Could not parse listing from image", raw }, { status: 422 });
    }

    const validSlugs = (await db.category.findMany({ select: { slug: true } })).map((c) => c.slug);
    if (!validSlugs.includes(parsed.categorySlug)) parsed.categorySlug = "saas";
    const validStages = ["Startup", "Growth", "Established"];
    if (!validStages.includes(parsed.stage)) parsed.stage = "Growth";
    parsed.askingPrice = Number(parsed.askingPrice) || 0;
    parsed.valuation = Number(parsed.valuation) || 0;
    parsed.annualRevenue = Number(parsed.annualRevenue) || 0;
    parsed.annualProfit = Number(parsed.annualProfit) || 0;
    parsed.ageYears = Number(parsed.ageYears) || 0;
    parsed.employees = Number(parsed.employees) || 0;
    parsed.currency = "USD";

    return NextResponse.json({ listing: parsed });
  } catch (e: any) {
    console.error("[/api/listings/analyze] error", e);
    return NextResponse.json({ error: e?.message || "Analysis failed" }, { status: 500 });
  }
}
