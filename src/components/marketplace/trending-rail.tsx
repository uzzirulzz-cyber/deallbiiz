"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Flame, MapPin, TrendingUp } from "lucide-react";

import type { Listing } from "./types";
import { formatCompactMoney } from "./types";
import { fetchTrendingListings } from "./api";
import { useMarketplaceStore } from "./use-marketplace-store";

function TrendingCard({ listing }: { listing: Listing }) {
  const socket = useMarketplaceStore((s) => s.socket);
  const cat = listing.category;

  const onView = () => {
    if (listing.url) window.open(listing.url, "_blank", "noopener,noreferrer");
    socket?.emit("view", listing.id);
  };

  return (
    <article className="flex w-72 shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(0,0,0,0.10)]">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={listing.imageUrl}
          alt={listing.title}
          loading="lazy"
          className="size-full object-cover"
        />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#FF5757] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          <Flame className="size-3" />
          Trending
        </span>
        {cat && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-[#111827] backdrop-blur">
            <span aria-hidden>{cat.icon}</span>
            {cat.name}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 text-sm font-semibold text-[#111827]">
          {listing.title}
        </h3>
        {listing.tagline && (
          <p className="line-clamp-1 text-[11px] text-[#6B7280]">
            {listing.tagline}
          </p>
        )}
        <div className="mt-1 flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
              Asking
            </span>
            <span className="text-lg font-bold tabular-nums text-[#FF7A00]">
              {formatCompactMoney(listing.askingPrice)}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
              Revenue
            </span>
            <span className="text-sm font-bold tabular-nums text-[#111827]">
              {listing.annualRevenue > 0
                ? `${formatCompactMoney(listing.annualRevenue)}/yr`
                : "—"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[#6B7280]">
          <MapPin className="size-3" />
          <span className="truncate">{listing.location || "Remote"}</span>
        </div>
        <button
          type="button"
          onClick={onView}
          className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-full bg-[#FF7A00] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#FF8C32]"
        >
          View
          <ArrowRight className="size-3.5" />
        </button>
      </div>
    </article>
  );
}

function TrendingSkeleton() {
  return (
    <div className="flex w-72 shrink-0 flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
      <div className="aspect-[16/10] w-full animate-pulse bg-[#F3F4F6]" />
      <div className="flex flex-col gap-2 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="mt-2 h-8 w-full animate-pulse rounded bg-[#F3F4F6]" />
        <div className="h-8 w-full animate-pulse rounded-full bg-[#F3F4F6]" />
      </div>
    </div>
  );
}

export function TrendingRail() {
  const { data, isLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: fetchTrendingListings,
    staleTime: 60_000,
  });
  const listings = data?.listings ?? [];

  if (!isLoading && listings.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#FF7A00]">
            🔥 Trending Now
          </span>
          <h2 className="text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">
            Featured Opportunities
          </h2>
        </div>
        <button
          type="button"
          onClick={() =>
            document
              .getElementById("listings")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-[#FF7A00] transition hover:bg-[#FFF4EB]"
        >
          View all
          <ArrowRight className="size-3.5" />
        </button>
      </div>

      <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <TrendingSkeleton key={i} />
            ))
          : listings.map((l) => <TrendingCard key={l.id} listing={l} />)}
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-[#9CA3AF]">
        <TrendingUp className="size-3.5" />
        <span>Updated live · sorted by recent investor activity</span>
      </div>
    </section>
  );
}
