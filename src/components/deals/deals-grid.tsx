"use client";

import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDealsStore } from "./use-deals-store";
import { fetchDeals } from "./api";
import { DealCard, DealCardSkeleton } from "./deal-card";

export function DealsGrid() {
  const category = useDealsStore((s) => s.category);
  const sort = useDealsStore((s) => s.sort);
  const query = useDealsStore((s) => s.query);
  const flashOnly = useDealsStore((s) => s.flashOnly);
  const setAiOpen = useDealsStore((s) => s.setAiOpen);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["deals", { category, sort, query, flashOnly }],
    queryFn: () =>
      fetchDeals({
        category,
        sort,
        q: query,
        flash: flashOnly,
        limit: 48,
      }),
    staleTime: 30_000,
  });

  const deals = data?.deals ?? [];
  const count = data?.count ?? 0;

  if (isError) {
    return (
      <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-8 text-center">
        <p className="text-sm text-destructive">
          Couldn&apos;t load deals{error instanceof Error ? `: ${error.message}` : ""}.
        </p>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-3">
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div id="deals-grid" className="flex flex-col gap-4 scroll-mt-32">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <DealCardSkeleton key={i} />)
          : deals.map((d, i) => <DealCard key={d.id} deal={d} index={i} />)}
      </div>

      {!isLoading && deals.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-card/40 px-6 py-16 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-amber-500/10 text-amber-400">
            <Sparkles className="size-6" />
          </span>
          <h3 className="text-lg font-semibold">No deals match your filters</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Try adjusting the search or category — or let the AI Finder hunt
            down exactly what you need.
          </p>
          <Button
            onClick={() => setAiOpen(true)}
            className="mt-2 bg-amber-500 text-amber-950 hover:bg-amber-400"
          >
            <Sparkles className="size-4" />
            Try the AI Finder
          </Button>
        </div>
      )}
    </div>
  );
}
