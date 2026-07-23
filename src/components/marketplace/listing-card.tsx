"use client";

import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Bookmark,
  Eye,
  Flame,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

import type { Listing, Stage } from "./types";
import { formatCompactMoney } from "./types";
import { useMarketplaceStore } from "./use-marketplace-store";
import { saveListing, sendInquiry, unsaveListing } from "./api";
import { cn } from "@/lib/utils";

const STAGE_STYLES: Record<Stage, string> = {
  Startup: "bg-amber-100 text-amber-700",
  Growth: "bg-orange-100 text-orange-700",
  Established: "bg-emerald-100 text-emerald-700",
};

function useDebouncedView(listingId: string, delay = 400) {
  const socket = useMarketplaceStore((s) => s.socket);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const viewing = useRef(false);

  const start = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      socket?.emit("view", listingId);
      viewing.current = true;
    }, delay);
  };
  const stop = () => {
    if (timer.current) clearTimeout(timer.current);
    if (viewing.current) {
      socket?.emit("stop-view", listingId);
      viewing.current = false;
    }
  };

  return { start, stop };
}

export function ListingCard({ listing }: { listing: Listing }) {
  const saved = useMarketplaceStore((s) => s.savedIds.includes(listing.id));
  const toggleSaved = useMarketplaceStore((s) => s.toggleSaved);
  const socket = useMarketplaceStore((s) => s.socket);
  const viewerCount = useMarketplaceStore(
    (s) => s.viewerCounts[listing.id] ?? 0,
  );
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const { start, stop } = useDebouncedView(listing.id);

  const cat = listing.category;

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSaving(true);
    const wasSaved = saved;
    toggleSaved(listing.id); // optimistic
    try {
      if (wasSaved) {
        await unsaveListing(listing.id);
        toast("Removed from saved", {
          description: listing.title,
        });
      } else {
        await saveListing(listing.id);
        toast.success("Saved to your list", {
          description: listing.title,
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["saved"] });
    } catch (e) {
      toggleSaved(listing.id); // rollback
      toast.error("Couldn't update saved list", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleView = async () => {
    if (listing.url) {
      window.open(listing.url, "_blank", "noopener,noreferrer");
    }
    socket?.emit("view", listing.id);
    try {
      await sendInquiry(listing.id);
      toast.success("Inquiry sent to seller", {
        description: `${listing.title} — they'll reach out shortly.`,
      });
      await queryClient.invalidateQueries({ queryKey: ["listings"] });
    } catch {
      /* Inquiry is best-effort; ignore errors */
    }
  };

  return (
    <motion.article
      onMouseEnter={start}
      onMouseLeave={stop}
      onFocus={start}
      onBlur={stop}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_12px_36px_rgba(0,0,0,0.10)] hover:ring-1 hover:ring-[#FF7A00]/20"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={listing.imageUrl}
          alt={listing.title}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Top-left: category pill */}
        {cat && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-[#111827] shadow-sm backdrop-blur">
            <span aria-hidden>{cat.icon}</span>
            {cat.name}
          </span>
        )}

        {/* Top-right: verified badge */}
        {listing.verified && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            <BadgeCheck className="size-3.5" />
            Verified
          </span>
        )}

        {/* Bottom-left: stage badge */}
        {listing.stage && (
          <span
            className={cn(
              "absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm",
              STAGE_STYLES[listing.stage],
            )}
          >
            {listing.stage}
          </span>
        )}

        {/* Live viewers */}
        {viewerCount > 0 && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur">
            <Flame className="size-3 text-[#FF7A00]" />
            {viewerCount} viewing
          </span>
        )}

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          aria-pressed={saved}
          aria-label={saved ? "Remove from saved" : "Save business"}
          className={cn(
            "absolute right-3 top-3 grid size-9 place-items-center rounded-full shadow-sm backdrop-blur transition-all",
            listing.verified ? "top-12" : "top-3",
            saved
              ? "bg-[#FF7A00] text-white"
              : "bg-white/90 text-[#111827] hover:bg-white",
          )}
        >
          <Bookmark
            className="size-4"
            fill={saved ? "currentColor" : "none"}
            strokeWidth={2}
          />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-col gap-0.5">
          <h3 className="line-clamp-1 text-base font-semibold tracking-tight text-[#111827]">
            {listing.title}
          </h3>
          {listing.tagline && (
            <p className="line-clamp-1 text-xs text-[#6B7280]">
              {listing.tagline}
            </p>
          )}
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col gap-0.5 rounded-xl bg-[#FAFAFB] p-2.5">
            <span className="text-[9px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
              Asking
            </span>
            <span className="text-sm font-bold tabular-nums text-[#FF7A00]">
              {formatCompactMoney(listing.askingPrice)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 rounded-xl bg-[#FAFAFB] p-2.5">
            <span className="text-[9px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
              Revenue
            </span>
            <span className="text-sm font-bold tabular-nums text-[#111827]">
              {listing.annualRevenue > 0
                ? `${formatCompactMoney(listing.annualRevenue)}/yr`
                : "—"}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 rounded-xl bg-[#FAFAFB] p-2.5">
            <span className="text-[9px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
              Multiple
            </span>
            <span className="text-sm font-bold tabular-nums text-[#111827]">
              {listing.revenueMultiple > 0
                ? `${listing.revenueMultiple}x rev`
                : "—"}
            </span>
          </div>
        </div>

        {/* Location / age row */}
        <div className="flex items-center gap-2 text-[11px] text-[#6B7280]">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{listing.location || "Remote / Global"}</span>
          {listing.ageYears > 0 && (
            <>
              <span className="text-[#D1D5DB]">·</span>
              <span className="whitespace-nowrap">
                {listing.ageYears} yr old
                {listing.employees > 0 && ` · ${listing.employees} staff`}
              </span>
            </>
          )}
          <span className="ml-auto inline-flex items-center gap-1 text-[#9CA3AF]">
            <Eye className="size-3.5" />
            {listing.viewCount}
          </span>
        </div>

        {/* Footer actions */}
        <div className="mt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={handleView}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#FF7A00] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(255,122,0,0.24)] transition hover:bg-[#FF8C32]"
          >
            View Listing
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
      <div className="aspect-[16/10] w-full animate-pulse bg-[#F3F4F6]" />
      <div className="flex flex-col gap-3 p-5">
        <div className="h-4 w-3/4 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-14 animate-pulse rounded-xl bg-[#F3F4F6]"
            />
          ))}
        </div>
        <div className="h-3 w-2/3 animate-pulse rounded bg-[#F3F4F6]" />
        <div className="h-10 w-full animate-pulse rounded-full bg-[#F3F4F6]" />
      </div>
    </div>
  );
}
