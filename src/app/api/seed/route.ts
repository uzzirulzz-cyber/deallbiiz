import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/seed  — ensure the database has data. Idempotent: only seeds if empty.
export async function GET() {
  const count = await db.deal.count();
  if (count > 0) {
    return NextResponse.json({ seeded: false, count });
  }

  const categories = [
    { name: "Tech & Gadgets", slug: "tech", icon: "💻", color: "amber" },
    { name: "Fashion", slug: "fashion", icon: "👟", color: "rose" },
    { name: "Home & Living", slug: "home", icon: "🛋️", color: "emerald" },
    { name: "Gaming", slug: "gaming", icon: "🎮", color: "violet" },
    { name: "Beauty", slug: "beauty", icon: "💄", color: "pink" },
    { name: "Travel", slug: "travel", icon: "✈️", color: "sky" },
    { name: "Fitness", slug: "fitness", icon: "💪", color: "lime" },
    { name: "Food & Drink", slug: "food", icon: "🍜", color: "orange" },
  ];
  for (const c of categories) {
    await db.category.upsert({ where: { slug: c.slug }, update: c, create: c });
  }

  return NextResponse.json({ seeded: true, count: 0, message: "Categories ensured. Run scripts/seed.ts for full deal data." });
}
