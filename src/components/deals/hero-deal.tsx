"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { Bookmark, BookmarkCheck, ExternalLink, Eye, Flame, Star, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDealsStore } from "./use-deals-store";
import { claimDeal, saveDeal, unsaveDeal } from "./api";
import { Countdown } from "./countdown";
import { formatCurrency, formatClaimed, type Deal } from "./types";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      <Star className="size-3.5 fill-amber-400 text-amber-400" />
      <span className="text-xs font-medium text-foreground/90">{rating.toFixed(1)}</span>
    </span>
  );
}

export function HeroDeal({ deal }: { deal: Deal }) {
  const socket = useDealsStore((s) => s.socket);
  const isSaved = useDealsStore((s) => s.savedIds.includes(deal.id));
  const toggleSaved = useDealsStore((s) => s.toggleSaved);
  const queryClient = useQueryClient();
  const viewerCount = useDealsStore((s) => s.viewerCounts[deal.id] ?? 0);
  const addClaim = useDealsStore((s) => s.addClaim);

  // Emit view for this hero deal on mount, stop-view on unmount
  useEffect(() => {
    if (!socket) return;
    socket.emit("view", deal.id);
    return () => {
      try {
        socket.emit("stop-view", deal.id);
      } catch {
        /* noop */
      }
    };
  }, [socket, deal.id]);

  const savings = Math.max(0, deal.originalPrice - deal.dealPrice);

  const handleGetDeal = async () => {
    // Open the deal in a new tab immediately for snappy UX
    window.open(deal.url, "_blank", "noopener,noreferrer");
    // Emit WS claim so the live ticker updates instantly
    try {
      socket?.emit("claim", {
        dealId: deal.id,
        dealTitle: deal.title,
        store: deal.store,
      });
    } catch {
      /* noop */
    }
    // Record claim server-side
    try {
      await claimDeal(deal.id);
    } catch {
      /* non-blocking — the WS broadcast already makes the ticker move */
    }
    // Optimistically show in the ticker
    addClaim({
      id: `local-${Date.now()}`,
      dealTitle: deal.title,
      store: deal.store,
      user: "You",
      at: Date.now(),
    });
    toast.success("Deal claimed! 🎉", {
      description: `${deal.title} — ${formatCurrency(deal.dealPrice)} from ${deal.store}`,
    });
  };

  const handleSave = async () => {
    const wasSaved = isSaved;
    toggleSaved(deal.id); // optimistic
    try {
      if (wasSaved) {
        await unsaveDeal(deal.id);
        toast.message("Removed from saved", { description: deal.title });
      } else {
        await saveDeal(deal.id);
        toast.success("Saved! 🔖", { description: `${deal.title} added to your saved deals` });
      }
      // Keep the Saved drawer's React Query cache in sync
      queryClient.invalidateQueries({ queryKey: ["saved"] });
    } catch (e) {
      toggleSaved(deal.id); // rollback
      toast.error("Couldn't update saved deals", {
        description: e instanceof Error ? e.message : undefined,
      });
    }
  };

  const expiresSoon = useMemo(
    () => new Date(deal.expiresAt).getTime() - Date.now() < 3600_000,
    [deal.expiresAt],
  );

  return (
    <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-amber-500/[0.07] via-background to-background">
      <div className="pointer-events-none absolute -left-32 top-0 size-96 rounded-full bg-amber-500/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -right-32 top-20 size-96 rounded-full bg-emerald-500/5 blur-3xl" aria-hidden />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-6 flex flex-col gap-2"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
            ✨ Deal of the Day
          </span>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Today&apos;s <span className="text-amber-400">hand-picked</span> deal.
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.08 }}
          className="grid items-stretch gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10"
        >
          {/* Image column */}
          <div className="relative">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl shadow-amber-500/10 ring-1 ring-amber-500/10 sm:aspect-[16/11]">
              <img
                src={deal.imageUrl}
                alt={deal.title}
                className="size-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              {/* Discount mega-badge */}
              <div className="absolute left-4 top-4 flex flex-col items-start gap-2">
                <span className="rounded-xl bg-amber-500 px-3 py-1.5 text-lg font-extrabold text-amber-950 shadow-lg shadow-amber-500/30">
                  -{deal.discountPct}%
                </span>
                {deal.flashDeal && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/90 px-2.5 py-1 text-xs font-semibold text-white shadow-lg">
                    <span className="ttd-live-dot size-1.5 rounded-full bg-white" />
                    <Zap className="size-3" /> FLASH DEAL
                  </span>
                )}
              </div>

              {/* Live viewers pill */}
              {viewerCount > 0 && (
                <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                  <Eye className="size-3.5 text-amber-300" />
                  <span className="tabular-nums">{viewerCount}</span>
                  <span className="text-white/80">viewing now</span>
                </div>
              )}
            </div>
          </div>

          {/* Content column */}
          <div className="flex flex-col gap-4 lg:py-2">
            <div className="flex flex-wrap items-center gap-2">
              {deal.category && (
                <Badge
                  variant="secondary"
                  className="rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-300"
                >
                  <span className="mr-1">{deal.category.icon}</span>
                  {deal.category.name}
                </Badge>
              )}
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Flame className="size-3.5 text-amber-400" />
                {formatClaimed(deal.claimedCount)} claimed
              </span>
              <Stars rating={deal.rating} />
            </div>

            <h2 className="text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
              {deal.title}
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              {deal.description}
            </p>

            {/* Store row */}
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-lg border border-border/60 bg-input/40 text-base">
                {deal.storeLogo || "🏷️"}
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{deal.store}</span>
                <Stars rating={deal.rating} />
              </div>
            </div>

            {/* Price row */}
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl border border-border/50 bg-card/60 p-4">
              <span className="text-3xl font-bold tabular-nums text-amber-400 sm:text-4xl">
                {formatCurrency(deal.dealPrice, deal.currency)}
              </span>
              <span className="text-base text-muted-foreground line-through tabular-nums">
                {formatCurrency(deal.originalPrice, deal.currency)}
              </span>
              <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-sm font-semibold text-emerald-300">
                You save {formatCurrency(savings, deal.currency)} ({deal.discountPct}%)
              </span>
            </div>

            {/* Countdown */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Deal ends in</span>
                <Countdown
                  to={deal.expiresAt}
                  className={expiresSoon ? "text-rose-400" : ""}
                />
              </div>
              <span className="text-xs text-muted-foreground/70">
                Added {new Date(deal.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* CTAs */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Button
                onClick={handleGetDeal}
                size="lg"
                className="bg-amber-500 text-amber-950 hover:bg-amber-400"
              >
                <ExternalLink className="size-4" />
                Get Deal
              </Button>
              <Button onClick={handleSave} variant="outline" size="lg">
                {isSaved ? (
                  <>
                    <BookmarkCheck className="size-4 text-amber-400" />
                    Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="size-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
