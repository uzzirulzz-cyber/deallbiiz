"use client";

import { useQuery } from "@tanstack/react-query";

import { useMarketplaceStore } from "./use-marketplace-store";
import { fetchCategories } from "./api";
import { cn } from "@/lib/utils";

export function CategoryPills() {
  const category = useMarketplaceStore((s) => s.category);
  const setCategory = useMarketplaceStore((s) => s.setCategory);

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
  });

  const categories = data?.categories ?? [];

  return (
    <div className="no-scrollbar -mx-4 flex snap-x gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      <button
        type="button"
        onClick={() => setCategory("all")}
        className={cn(
          "flex shrink-0 snap-start items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all",
          category === "all"
            ? "bg-[#FF7A00] text-white shadow-[0_4px_14px_rgba(255,122,0,0.28)]"
            : "border border-[#E5E7EB] bg-white text-[#374151] hover:border-[#FF7A00]/40 hover:text-[#111827]",
        )}
      >
        <span aria-hidden>🌐</span>
        All
      </button>

      {isLoading
        ? Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-28 shrink-0 animate-pulse rounded-full bg-[#F3F4F6]"
            />
          ))
        : categories.map((c) => {
            const active = category === c.slug;
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => setCategory(c.slug)}
                className={cn(
                  "flex shrink-0 snap-start items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all",
                  active
                    ? "bg-[#FF7A00] text-white shadow-[0_4px_14px_rgba(255,122,0,0.28)]"
                    : "border border-[#E5E7EB] bg-white text-[#374151] hover:border-[#FF7A00]/40 hover:text-[#111827]",
                )}
              >
                <span aria-hidden>{c.icon}</span>
                {c.name}
                <span
                  className={cn(
                    "ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                    active ? "bg-white/20" : "bg-[#F5F5F7] text-[#6B7280]",
                  )}
                >
                  {c._count?.listings ?? 0}
                </span>
              </button>
            );
          })}
    </div>
  );
}
