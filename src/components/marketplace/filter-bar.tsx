"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { useMarketplaceStore } from "./use-marketplace-store";
import type { SortKey, Stage } from "./types";

const STAGES: Array<{ key: "all" | Stage; label: string; dot?: string }> = [
  { key: "all", label: "All" },
  { key: "Startup", label: "Startup", dot: "bg-amber-400" },
  { key: "Growth", label: "Growth", dot: "bg-[#FF7A00]" },
  { key: "Established", label: "Established", dot: "bg-emerald-500" },
];

const SORTS: Array<{ value: SortKey; label: string }> = [
  { value: "trending", label: "Trending" },
  { value: "asking", label: "Price: low to high" },
  { value: "asking-desc", label: "Price: high to low" },
  { value: "revenue", label: "Revenue: high to low" },
  { value: "multiple", label: "Best multiple" },
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most viewed" },
  { value: "rating", label: "Top rated" },
];

export function FilterBar({ count }: { count: number }) {
  const stage = useMarketplaceStore((s) => s.stage);
  const setStage = useMarketplaceStore((s) => s.setStage);
  const sort = useMarketplaceStore((s) => s.sort);
  const setSort = useMarketplaceStore((s) => s.setSort);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm text-[#6B7280]">
          <span className="font-semibold text-[#111827]">{count}</span>{" "}
          {count === 1 ? "business" : "businesses"}
        </span>
        <span className="mx-1 hidden h-5 w-px bg-[#E5E7EB] sm:block" />
        {STAGES.map((s) => {
          const active = stage === s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setStage(s.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                active
                  ? "bg-[#111827] text-white"
                  : "border border-[#E5E7EB] bg-white text-[#374151] hover:border-[#111827]/30",
              )}
            >
              {s.dot && (
                <span className={cn("size-1.5 rounded-full", s.dot)} />
              )}
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-[#9CA3AF]">
          Sort
        </span>
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="h-9 w-44 rounded-full border-[#E5E7EB] bg-white text-sm font-medium text-[#111827] hover:border-[#FF7A00]/40 focus:ring-[#FF7A00]/15">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-[#E5E7EB]">
            {SORTS.map((s) => (
              <SelectItem
                key={s.value}
                value={s.value}
                className="rounded-lg text-sm"
              >
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
