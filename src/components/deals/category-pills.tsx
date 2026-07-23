"use client";

import { useQuery } from "@tanstack/react-query";
import { useDealsStore } from "./use-deals-store";
import { fetchCategories } from "./api";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function CategoryPills() {
  const category = useDealsStore((s) => s.category);
  const setCategory = useDealsStore((s) => s.setCategory);

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60_000,
  });

  const cats = data?.categories ?? [];

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
    );
  }

  return (
    <div
      className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
      role="tablist"
      aria-label="Filter by category"
    >
      <Pill active={category === "all"} onClick={() => setCategory("all")}>
        <span className="mr-1">🛍️</span> All
      </Pill>
      {cats.map((c) => (
        <Pill
          key={c.slug}
          active={category === c.slug}
          onClick={() => setCategory(c.slug)}
        >
          <span className="mr-1">{c.icon}</span>
          {c.name}
          {typeof c._count?.deals === "number" && (
            <span
              className={cn(
                "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                category === c.slug
                  ? "bg-amber-950/30 text-amber-950"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {c._count.deals}
            </span>
          )}
        </Pill>
      ))}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
        active
          ? "border-amber-500 bg-amber-500 text-amber-950 shadow-md shadow-amber-500/20"
          : "border-border/60 bg-card/60 text-muted-foreground hover:border-amber-500/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
