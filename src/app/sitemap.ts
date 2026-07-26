import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://makethisdeal.biz";
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/storefront`, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/admin`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];
  const listings = await db.listing.findMany({ where: { verified: true }, select: { id: true, updatedAt: true } });
  const listingPages: MetadataRoute.Sitemap = listings.map((l) => ({ url: `${base}/listings/${l.id}`, lastModified: l.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 }));
  return [...staticPages, ...listingPages];
}
