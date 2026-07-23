"use client";

import { ArrowUpDown, Zap } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useDealsStore } from "./use-deals-store";
import type { SortKey } from "./types";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "discount", label: "Highest discount %" },
  { value: "price", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "expires", label: "Ending soon" },
  { value: "trending", label: "Most viewed" },
  { value: "rating", label: "Top rated" },
  { value: "claimed", label: "Most claimed" },
];

export function FilterBar({ count }: { count: number }) {
  const sort = useDealsStore((s) => s.sort);
  const setSort = useDealsStore((s) => s.setSort);
  const flashOnly = useDealsStore((s) => s.flashOnly);
  const setFlashOnly = useDealsStore((s) => s.setFlashOnly);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Showing{" "}
        <span className="font-semibold text-foreground tabular-nums">{count}</span>{" "}
        {count === 1 ? "deal" : "deals"}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div
          className="flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1.5"
        >
          <Zap
            className={`size-3.5 ${flashOnly ? "text-rose-400" : "text-muted-foreground"}`}
          />
          <Label
            htmlFor="flash-toggle"
            className="cursor-pointer text-xs font-medium"
          >
            Flash deals only
          </Label>
          <Switch
            id="flash-toggle"
            checked={flashOnly}
            onCheckedChange={setFlashOnly}
            aria-label="Toggle flash deals only"
          />
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="size-4 text-muted-foreground" />
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger
              className="w-[180px] rounded-full bg-card/60"
              aria-label="Sort deals"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
