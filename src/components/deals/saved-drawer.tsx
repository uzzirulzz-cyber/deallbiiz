"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, ExternalLink, Loader2, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useDealsStore } from "./use-deals-store";
import { fetchSavedDeals, unsaveDeal } from "./api";
import { formatCurrency, type Deal } from "./types";
import { toast } from "sonner";

export function SavedDrawer() {
  const open = useDealsStore((s) => s.savedOpen);
  const setOpen = useDealsStore((s) => s.setSavedOpen);
  const toggleSaved = useDealsStore((s) => s.toggleSaved);
  const savedIds = useDealsStore((s) => s.savedIds);
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["saved"],
    queryFn: fetchSavedDeals,
    enabled: open,
    staleTime: 30_000,
  });

  const saved: Deal[] = data?.saved ?? [];

  const handleRemove = async (deal: Deal) => {
    toggleSaved(deal.id); // optimistic
    try {
      await unsaveDeal(deal.id);
      await queryClient.invalidateQueries({ queryKey: ["saved"] });
      toast.message("Removed from saved", { description: deal.title });
    } catch (e) {
      toggleSaved(deal.id); // rollback
      toast.error("Couldn't remove", {
        description: e instanceof Error ? e.message : undefined,
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border/60 bg-gradient-to-br from-amber-500/15 to-transparent px-5 py-4">
          <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-amber-950 shadow-lg shadow-amber-500/20">
            <Bookmark className="size-5" />
          </span>
          <SheetHeader className="p-0">
            <SheetTitle className="flex items-center gap-2 text-base font-bold">
              Saved Deals
              {savedIds.length > 0 && (
                <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-amber-500 px-1 text-[11px] font-bold text-amber-950">
                  {savedIds.length}
                </span>
              )}
            </SheetTitle>
            <SheetDescription className="text-xs">
              Your bookmarked deals — pick up where you left off.
            </SheetDescription>
          </SheetHeader>
        </div>

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-2 p-4">
            {isLoading && (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3 rounded-xl border border-border/60 bg-card/40 p-3">
                  <Skeleton className="size-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            )}

            {!isLoading && saved.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <span className="grid size-12 place-items-center rounded-full bg-amber-500/10 text-amber-400">
                  <Bookmark className="size-6" />
                </span>
                <h3 className="text-base font-semibold">No saved deals yet</h3>
                <p className="max-w-[16rem] text-sm text-muted-foreground">
                  Bookmark deals you love by tapping the{" "}
                  <Bookmark className="inline size-3.5 align-text-bottom" />{" "}
                  icon — they&apos;ll show up here.
                </p>
              </div>
            )}

            {!isLoading &&
              saved.length > 0 &&
              saved.map((d) => (
                <SavedRow key={d.id} deal={d} onRemove={() => handleRemove(d)} />
              ))}
          </div>
        </ScrollArea>

        {isFetching && !isLoading && (
          <div className="flex items-center justify-center gap-2 border-t border-border/40 py-2 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" /> Syncing…
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function SavedRow({ deal, onRemove }: { deal: Deal; onRemove: () => void }) {
  return (
    <div className="flex gap-3 rounded-xl border border-border/60 bg-card/40 p-3 transition-colors hover:border-amber-500/30">
      <a
        href={deal.url}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0"
        aria-label={`Open ${deal.title}`}
      >
        <img
          src={deal.imageUrl}
          alt={deal.title}
          loading="lazy"
          className="size-16 rounded-lg object-cover"
        />
      </a>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{deal.storeLogo || "🏷️"}</span>
          <span className="truncate">{deal.store}</span>
        </div>
        <h4 className="line-clamp-2 text-sm font-medium leading-snug">{deal.title}</h4>
        <div className="mt-0.5 flex items-baseline gap-2">
          <span className="text-base font-bold tabular-nums text-amber-400">
            {formatCurrency(deal.dealPrice, deal.currency)}
          </span>
          <span className="text-xs text-muted-foreground line-through tabular-nums">
            {formatCurrency(deal.originalPrice, deal.currency)}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="h-8 rounded-full text-xs">
            <a
              href={deal.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="size-3" />
              Open
            </a>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onRemove}
            className="h-8 rounded-full text-xs text-muted-foreground hover:text-rose-400"
            aria-label="Remove from saved"
          >
            <Trash2 className="size-3" />
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
