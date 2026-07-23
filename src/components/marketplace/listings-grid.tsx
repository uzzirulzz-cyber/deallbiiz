"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { useMarketplaceStore } from "./use-marketplace-store";
import { fetchListings } from "./api";
import {
  ListingCard,
  ListingCardSkeleton,
} from "./listing-card";

export function ListingsGrid() {
  const category = useMarketplaceStore((s) => s.category);
  const stage = useMarketplaceStore((s) => s.stage);
  const sort = useMarketplaceStore((s) => s.sort);
  const query = useMarketplaceStore((s) => s.query);
  const setAiOpen = useMarketplaceStore((s) => s.setAiOpen);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["listings", { category, stage, sort, query }],
    queryFn: () =>
      fetchListings({ category, stage, sort, q: query, limit: 48 }),
    staleTime: 30_000,
  });

  const listings = data?.listings ?? [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-[#E5E7EB] bg-white p-10 text-center">
        <p className="text-sm text-[#6B7280]">
          Couldn't load listings. Check your connection and try again.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-full bg-[#FF7A00] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#FF8C32]"
        >
          Retry
        </button>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-[#E5E7EB] bg-white p-12 text-center"
      >
        <span className="grid size-14 place-items-center rounded-2xl bg-[#FFF4EB] text-[#FF7A00]">
          <Sparkles className="size-6" />
        </span>
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold text-[#111827]">
            No businesses match your filters
          </h3>
          <p className="text-sm text-[#6B7280]">
            Try AI Valuation to find or value a business ✨
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAiOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-[#FF7A00] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(255,122,0,0.24)] transition hover:bg-[#FF8C32]"
        >
          <Sparkles className="size-4" />
          Open AI Valuation
        </button>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((l) => (
        <ListingCard key={l.id} listing={l} />
      ))}
    </div>
  );
}
