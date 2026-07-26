import { db } from "@/lib/db";

export async function attachCategory<T extends { categorySlug: string }>(
  listing: T,
): Promise<T & { category: { id: string; name: string; slug: string; icon: string; color: string; blurb: string } | null }> {
  const cat = await db.category.findUnique({ where: { slug: listing.categorySlug } });
  return { ...listing, category: cat };
}

export async function attachCategories<T extends { categorySlug: string }>(
  listings: T[],
): Promise<Array<T & { category: { id: string; name: string; slug: string; icon: string; color: string; blurb: string } | null }>> {
  if (listings.length === 0) return [];
  const slugs = [...new Set(listings.map((l) => l.categorySlug))];
  const cats = await db.category.findMany({ where: { slug: { in: slugs } } });
  const map = new Map(cats.map((c) => [c.slug, c]));
  return listings.map((l) => ({ ...l, category: map.get(l.categorySlug) || null }));
}
