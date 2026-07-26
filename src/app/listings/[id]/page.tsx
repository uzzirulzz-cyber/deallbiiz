import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { attachCategory } from "@/lib/category-helpers";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, ExternalLink, MapPin, TrendingUp, Users, Calendar, Star } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function getListing(id: string) {
  const listing = await db.listing.findUnique({ where: { id } });
  if (!listing) return null;
  return attachCategory(listing);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) return { title: "Listing not found — Make This Deal" };
  const title = `${listing.title} — Make This Deal`;
  const description = listing.tagline || listing.description.slice(0, 160);
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: listing.imageUrl, alt: listing.title }], type: "website", url: `https://makethisdeal.biz/listings/${id}` },
    twitter: { card: "summary_large_image", title, description, images: [listing.imageUrl] },
    alternates: { canonical: `https://makethisdeal.biz/listings/${id}` },
  };
}

function formatMoney(n: number, compact = false) {
  if (compact) {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n >= 10_000_000 ? 1 : 2)}M`;
    if (n >= 1_000) return `$${(n / 1_000).toFixed(n >= 100_000 ? 0 : 1)}K`;
    return `$${n.toFixed(0)}`;
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

const STAGE_COLOR: Record<string, string> = {
  Startup: "bg-amber-100 text-amber-700",
  Growth: "bg-blue-100 text-blue-700",
  Established: "bg-emerald-100 text-emerald-700",
};

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  const jsonLd = {
    "@context": "https://schema.org", "@type": "Product",
    name: listing.title, description: listing.description, image: listing.imageUrl,
    offers: { "@type": "Offer", price: listing.askingPrice, priceCurrency: listing.currency, availability: "https://schema.org/InStock", url: listing.url || `https://makethisdeal.biz/listings/${id}` },
    brand: { "@type": "Brand", name: "Make This Deal" },
    aggregateRating: listing.rating ? { "@type": "AggregateRating", ratingValue: listing.rating, reviewCount: listing.inquiryCount } : undefined,
  };

  return (
    <div className="min-h-screen bg-[#050510] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="sticky top-0 z-20 border-b border-white/8 bg-[#0a0a1a]/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/storefront" className="flex items-center gap-2 text-sm font-semibold text-[#9ca3af] hover:text-white">
            <ArrowLeft className="size-4" /> Back to marketplace
          </Link>
          <Link href="/storefront" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] text-white"><span className="text-xs font-bold">M</span></span>
            <span className="hidden text-sm font-bold sm:inline">Make This Deal</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-3xl bg-[#111128] shadow-2xl">
            <img src={listing.imageUrl} alt={listing.title} className="aspect-[4/3] w-full object-cover" />
            {listing.verified && <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white"><BadgeCheck className="size-3.5" /> Verified</span>}
            <span className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${STAGE_COLOR[listing.stage] || STAGE_COLOR.Growth}`}>{listing.stage}</span>
          </div>
          <div className="flex flex-col gap-5">
            {listing.category && <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#3b82f6]/15 px-3 py-1 text-xs font-semibold text-[#3b82f6]"><span>{listing.category.icon}</span>{listing.category.name}</span>}
            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{listing.title}</h1>
            <p className="text-lg text-[#9ca3af]">{listing.tagline}</p>
            <div className="rounded-2xl bg-[#111128] p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#6b7280]">Asking Price</p>
              <p className="mt-1 text-4xl font-bold tabular-nums text-[#3b82f6]">{formatMoney(listing.askingPrice)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Metric icon={<TrendingUp className="size-4" />} label="Annual Revenue" value={listing.annualRevenue > 0 ? formatMoney(listing.annualRevenue, true) + "/yr" : "—"} />
              <Metric icon={<TrendingUp className="size-4" />} label="Annual Profit" value={listing.annualProfit > 0 ? formatMoney(listing.annualProfit, true) + "/yr" : "—"} />
              <Metric icon={<Users className="size-4" />} label="Team Size" value={listing.employees > 0 ? `${listing.employees} people` : "—"} />
              <Metric icon={<Calendar className="size-4" />} label="Years" value={listing.ageYears > 0 ? `${listing.ageYears} years` : "—"} />
              <Metric icon={<MapPin className="size-4" />} label="Location" value={listing.location} />
              <Metric icon={<Star className="size-4" />} label="Rating" value={`${listing.rating.toFixed(1)} ★`} />
            </div>
            {listing.url && <a href={listing.url} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90"><ExternalLink className="size-4" /> View Live Site</a>}
          </div>
        </div>
        <section className="mt-12 rounded-3xl bg-[#111128] p-6 sm:p-8">
          <h2 className="text-xl font-bold tracking-tight">About this business</h2>
          <p className="mt-3 whitespace-pre-wrap leading-relaxed text-[#e5e7eb]">{listing.description}</p>
          {listing.metrics && <div className="mt-5 rounded-xl bg-[#0a0a1a] p-4"><p className="text-xs font-semibold uppercase tracking-widest text-[#6b7280]">Headline metrics</p><p className="mt-1 text-sm font-medium text-[#e5e7eb]">{listing.metrics}</p></div>}
          {listing.tags && <div className="mt-5 flex flex-wrap gap-2">{listing.tags.split(",").filter(Boolean).map((tag) => <span key={tag} className="rounded-full bg-[#3b82f6]/15 px-3 py-1 text-xs font-medium text-[#3b82f6]">#{tag.trim()}</span>)}</div>}
        </section>
        <section className="mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a0a1a] to-[#1a1a2e] p-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight">Ready to make a deal?</h2>
          <Link href="/storefront" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#3b82f6] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#8b5cf6]">Browse all listings <ArrowLeft className="size-4 rotate-180" /></Link>
        </section>
      </main>
      <footer className="border-t border-white/8 bg-[#0a0a1a] py-6 text-center text-xs text-white/40">© 2026 MakeThisDeal · makethisdeal.biz · Together We Grow Strong</footer>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#111128] p-3">
      <div className="flex items-center gap-1.5 text-[#6b7280]"><span className="text-[#3b82f6]">{icon}</span><span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span></div>
      <p className="mt-1 text-sm font-bold tabular-nums text-white">{value}</p>
    </div>
  );
}
