"use client";

import { useQuery } from "@tanstack/react-query";
import { Flame } from "lucide-react";
import { fetchTrendingDeals } from "./api";
import { formatCurrency, formatClaimed } from "./types";
import { Skeleton } from "@/components/ui/skeleton";

function TrendingCard({
  title,
  store,
  storeLogo,
  imageUrl,
  dealPrice,
  discountPct,
  claimedCount,
  url,
  onClick,
}: {
  title: string;
  store: string;
  storeLogo: string | null;
  imageUrl: string;
  dealPrice: number;
  discountPct: number;
  claimedCount: number;
  url: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex w-64 shrink-0 flex-col gap-2 rounded-xl border border-border/60 bg-card p-2 text-left transition-all hover:ring-1 hover:ring-amber-500/30"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-muted">
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-2 top-2 rounded-md bg-amber-500 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-950">
          -{discountPct}%
        </span>
      </div>
      <div className="flex flex-col gap-1 px-1 pb-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{storeLogo || "🏷️"}</span>
          <span className="truncate">{store}</span>
        </div>
        <h4 className="line-clamp-1 text-sm font-medium">{title}</h4>
        <div className="flex items-baseline justify-between">
          <span className="text-base font-bold tabular-nums text-amber-400">
            {formatCurrency(dealPrice)}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <Flame className="size-3 text-amber-400" />
            {formatClaimed(claimedCount)} claimed
          </span>
        </div>
      </div>
    </button>
  );
}

export function TrendingRail() {
  const { data, isLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: fetchTrendingDeals,
    staleTime: 60_000,
  });

  const deals = data?.deals ?? [];

  const handleOpen = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section aria-label="Trending deals" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
            🔥 Hot right now
          </span>
          <h2 className="text-2xl font-bold tracking-tight">Trending Now</h2>
        </div>
      </div>

      {isLoading ? (
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-64 shrink-0 rounded-xl" />
          ))}
        </div>
      ) : deals.length === 0 ? null : (
        <div className="no-scrollbar flex snap-x gap-3 overflow-x-auto pb-2">
          {deals.map((d) => (
            <div key={d.id} className="snap-start">
              <TrendingCard
                title={d.title}
                store={d.store}
                storeLogo={d.storeLogo}
                imageUrl={d.imageUrl}
                dealPrice={d.dealPrice}
                discountPct={d.discountPct}
                claimedCount={d.claimedCount}
                url={d.url}
                onClick={() => handleOpen(d.url)}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
