import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const DEFAULT_CONTENT = {
  hero: { eyebrow: "GLOBAL ENTERPRISE MARKETPLACE", title: "Buy, Sell & Invest in", titleAccent: "Businesses Worldwide", subtitle: "The marketplace for SaaS, Real Estate, Startups, E-commerce, AI Solutions, and 50+ business categories.", ctaPrimary: "Explore Projects", ctaPrimaryHref: "#listings", ctaSecondary: "List Your Business" },
  stats: [{ icon: "TrendingUp", value: "$22.4K", label: "Portfolio Value", accent: true }, { icon: "Briefcase", value: "13", label: "Live Listings", accent: false }, { icon: "LayoutGrid", value: "18", label: "Categories", accent: false }, { icon: "Globe2", value: "120+", label: "Countries", accent: false }],
  howItWorks: [{ icon: "UserPlus", title: "Create Your Account", description: "Register and verify your identity to start exploring business opportunities worldwide." }, { icon: "Search", title: "List or Browse", description: "Publish your projects for sale or explore thousands of verified business listings." }, { icon: "MessageSquare", title: "Connect & Negotiate", description: "Chat directly with buyers and sellers, ask questions, and make competitive offers." }, { icon: "Handshake", title: "Close the Deal", description: "Sign contracts, process secure payments, and transfer assets with full support." }],
  sections: { hero: true, statsBar: true, liveTicker: true, trendingRail: true, categoryPills: true, howItWorks: true, ctaBand: true },
  themeColor: "#3B82F6", accentColor: "#8B5CF6", brandName: "Make This Deal", tagline: "Together We Grow Strong", footerNote: "Global Enterprise Marketplace",
};

function parse(raw: string | null, fallback: any) { if (!raw) return fallback; try { return JSON.parse(raw); } catch { return fallback; } }

async function getContent() {
  const row = await db.siteContent.findUnique({ where: { id: "singleton" } });
  if (!row) return DEFAULT_CONTENT;
  return {
    hero: { ...DEFAULT_CONTENT.hero, ...parse(row.hero, DEFAULT_CONTENT.hero) },
    stats: parse(row.stats, DEFAULT_CONTENT.stats),
    howItWorks: parse(row.howItWorks, DEFAULT_CONTENT.howItWorks),
    sections: { ...DEFAULT_CONTENT.sections, ...parse(row.sections, DEFAULT_CONTENT.sections) },
    themeColor: row.themeColor || "#3B82F6", accentColor: row.accentColor || "#8B5CF6",
    brandName: row.brandName || "Make This Deal", tagline: row.tagline || "Together We Grow Strong",
    footerNote: row.footerNote || "Global Enterprise Marketplace",
  };
}

export async function GET() {
  return NextResponse.json({ content: await getContent() });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const content = body?.content || body;
  const data = {
    hero: JSON.stringify(content.hero || DEFAULT_CONTENT.hero),
    stats: JSON.stringify(content.stats || DEFAULT_CONTENT.stats),
    howItWorks: JSON.stringify(content.howItWorks || DEFAULT_CONTENT.howItWorks),
    sections: JSON.stringify(content.sections || DEFAULT_CONTENT.sections),
    themeColor: String(content.themeColor || "#3B82F6"),
    accentColor: String(content.accentColor || "#8B5CF6"),
    brandName: String(content.brandName || "Make This Deal"),
    tagline: String(content.tagline || "Together We Grow Strong"),
    footerNote: String(content.footerNote || "Global Enterprise Marketplace"),
  };
  await db.siteContent.upsert({ where: { id: "singleton" }, update: data, create: { id: "singleton", ...data } });
  return NextResponse.json({ ok: true, content: await getContent() });
}
