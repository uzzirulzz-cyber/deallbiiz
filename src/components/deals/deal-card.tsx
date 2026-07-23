"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { Bookmark, BookmarkCheck, ExternalLink, Flame, Star, Zap } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDealsStore } from "./use-deals-store";
import { claimDeal, saveDeal, unsaveDeal } from "./api";
import { Countdown } from "./countdown";
import { formatCurrency, formatClaimed, type Deal } from "./types";
import { cn } from "@/lib/utils";

function Stars({ rating, claimed }: { rating: number; claimed: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      <Star className="size-3 fill-amber-400 text-amber-400" />
      <span className="font-medium text-foreground/90 tabular-nums">
        {rating.toFixed(1)}
      </span>
      <span className="text-muted-foreground/70">
        ({formatClaimed(claimed)} claimed)
      </span>
    </span>
  );
}

export function DealCard({ deal, index = 0 }: { deal: Deal; index?: number }) {
  const socket = useDealsStore((s) => s.socket);
  const isSaved = useDealsStore((s) => s.savedIds.includes(deal.id));
  const toggleSaved = useDealsStore((s) => s.toggleSaved);
  const addClaim = useDealsStore((s) => s.addClaim);
  const viewerCount = useDealsStore((s) => s.viewerCounts[deal.id] ?? 0);
  const queryClient = useQueryClient();

  const [localClaimed, setLocalClaimed] = useState(deal.claimedCount);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep local claimed in sync when the deal prop changes (refetches etc.)
  useEffect(() => {
    setLocalClaimed(deal.claimedCount);
  }, [deal.claimedCount]);

  // Debounced view emit on hover/focus
  const startView = useCallback(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => {
      socket?.emit("view", deal.id);
    }, 350);
  }, [socket, deal.id]);

  const stopView = useCallback(() => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    socket?.emit("stop-view", deal.id);
  }, [socket, deal.id]);

  useEffect(() => () => stopView(), [stopView]);

  const savings = Math.max(0, deal.originalPrice - deal.dealPrice);
  const expired = new Date(deal.expiresAt).getTime() <= Date.now();

  const handleGetDeal = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    window.open(deal.url, "_blank", "noopener,noreferrer");
    try {
      socket?.emit("claim", {
        dealId: deal.id,
        dealTitle: deal.title,
        store: deal.store,
      });
    } catch { /* noop */ }
    try {
      const res = await claimDeal(deal.id);
      setLocalClaimed(res.claimedCount);
    } catch { /* non-blocking */ }
    addClaim({
      id: `local-${Date.now()}`,
      dealTitle: deal.title,
      store: deal.store,
      user: "You",
      at: Date.now(),
    });
    toast.success("Deal claimed! 🎉", {
      description: `${deal.title} — ${formatCurrency(deal.dealPrice)}`,
    });
  };

  const handleSave = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    const wasSaved = isSaved;
    toggleSaved(deal.id);
    try {
      if (wasSaved) {
        await unsaveDeal(deal.id);
        toast.message("Removed from saved", { description: deal.title });
      } else {
        await saveDeal(deal.id);
        toast.success("Saved! 🔖", { description: deal.title });
      }
      // Keep the Saved drawer's React Query cache in sync
      queryClient.invalidateQueries({ queryKey: ["saved"] });
    } catch (e) {
      toggleSaved(deal.id);
      toast.error("Couldn't update saved deals", {
        description: e instanceof Error ? e.message : undefined,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.3), ease: "easeOut" }}
      whileHover={{ y: -4 }}
      onMouseEnter={startView}
      onMouseLeave={stopView}
      onFocus={startView}
      onBlur={stopView}
    >
      <Card
        className={cn(
          "group relative h-full gap-0 overflow-hidden rounded-xl border-border/60 bg-card p-0 py-0 transition-shadow hover:shadow-lg hover:shadow-amber-500/5 hover:ring-1 hover:ring-amber-500/30",
          expired && "opacity-70",
        )}
      >
        {/* Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          <img
            src={deal.imageUrl}
            alt={deal.title}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Discount ribbon */}
          <span className="absolute left-3 top-3 rounded-lg bg-amber-500 px-2 py-1 text-xs font-extrabold text-amber-950 shadow-lg shadow-amber-500/30">
            -{deal.discountPct}%
          </span>

          {/* Flash badge */}
          {deal.flashDeal && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-rose-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-lg">
              <span className="ttd-live-dot size-1.5 rounded-full bg-white" />
              <Zap className="size-3" /> Flash
            </span>
          )}

          {/* Save button */}
          <button
            type="button"
            onClick={handleSave}
            aria-label={isSaved ? "Unsave deal" : "Save deal"}
            aria-pressed={isSaved}
            className="absolute bottom-3 right-3 grid size-9 place-items-center rounded-full border border-border/60 bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/70"
          >
            {isSaved ? (
              <BookmarkCheck className="size-4 text-amber-400" />
            ) : (
              <Bookmark className="size-4" />
            )}
          </button>

          {viewerCount > 0 && (
            <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
              <Flame className="size-3 text-amber-300" />
              <span className="tabular-nums">{viewerCount}</span> viewing
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-col gap-2 p-4">
          {/* Store row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="grid size-6 shrink-0 place-items-center rounded-md border border-border/60 bg-input/40 text-xs">
                {deal.storeLogo || "🏷️"}
              </span>
              <span className="truncate text-xs font-medium text-muted-foreground">
                {deal.store}
              </span>
            </div>
            <Stars rating={deal.rating} claimed={localClaimed} />
          </div>

          {/* Title */}
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug">
            {deal.title}
          </h3>

          {/* Description */}
          {deal.description && (
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {deal.description}
            </p>
          )}

          {/* Price row */}
          <div className="mt-1 flex items-end justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-xl font-bold tabular-nums text-amber-400">
                {formatCurrency(deal.dealPrice, deal.currency)}
              </span>
              <span className="text-xs text-muted-foreground line-through tabular-nums">
                {formatCurrency(deal.originalPrice, deal.currency)}
              </span>
            </div>
            <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-300">
              save {formatCurrency(savings, deal.currency)}
            </span>
          </div>

          {/* Flash countdown */}
          {deal.flashDeal && !expired && (
            <div className="flex items-center justify-between rounded-md border border-rose-500/20 bg-rose-500/5 px-2 py-1 text-xs">
              <span className="text-rose-300/90">Ends in</span>
              <Countdown to={deal.expiresAt} compact className="text-rose-300" />
            </div>
          )}

          {/* CTA */}
          <Button
            onClick={handleGetDeal}
            disabled={expired}
            className="mt-2 w-full bg-amber-500 text-amber-950 hover:bg-amber-400"
            size="sm"
          >
            <ExternalLink className="size-3.5" />
            {expired ? "Deal ended" : "Get Deal"}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

export function DealCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
      <div className="aspect-[4/3] w-full animate-pulse bg-muted" />
      <div className="flex flex-col gap-2 p-4">
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="mt-1 h-6 w-1/3 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-8 w-full animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
