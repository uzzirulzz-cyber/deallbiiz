"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Bookmark, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

import { useMarketplaceStore } from "./use-marketplace-store";
import { fetchSavedListings, unsaveListing } from "./api";
import { formatCompactMoney } from "./types";

function SavedRow({
  listing,
  onRemove,
  removing,
}: {
  listing: {
    id: string;
    title: string;
    tagline?: string;
    imageUrl: string;
    askingPrice: number;
    annualRevenue: number;
    url: string;
    category?: { icon?: string; name?: string } | null;
  };
  onRemove: () => void;
  removing: boolean;
}) {
  const onView = () => {
    if (listing.url) {
      window.open(listing.url, "_blank", "noopener,noreferrer");
    }
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition hover:border-[#FF7A00]/30">
      <img
        src={listing.imageUrl}
        alt={listing.title}
        loading="lazy"
        className="size-14 shrink-0 rounded-xl object-cover"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h4 className="line-clamp-1 text-sm font-semibold text-[#111827]">
          {listing.title}
        </h4>
        {listing.tagline && (
          <p className="line-clamp-1 text-[11px] text-[#6B7280]">
            {listing.tagline}
          </p>
        )}
        <div className="mt-0.5 flex items-center gap-2 text-[11px]">
          <span className="font-bold tabular-nums text-[#FF7A00]">
            {formatCompactMoney(listing.askingPrice)}
          </span>
          {listing.annualRevenue > 0 && (
            <span className="text-[#6B7280]">
              · {formatCompactMoney(listing.annualRevenue)}/yr
            </span>
          )}
          {listing.category?.name && (
            <span className="rounded-full bg-[#F5F5F7] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#6B7280]">
              {listing.category.icon} {listing.category.name}
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onView}
        aria-label="Open listing"
        className="grid size-9 shrink-0 place-items-center rounded-full bg-[#FF7A00]/10 text-[#FF7A00] transition hover:bg-[#FF7A00] hover:text-white"
      >
        <ArrowRight className="size-4" />
      </button>
      <button
        type="button"
        onClick={onRemove}
        disabled={removing}
        aria-label="Remove from saved"
        className="grid size-9 shrink-0 place-items-center rounded-full text-[#6B7280] transition hover:bg-red-50 hover:text-red-500"
      >
        {removing ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Trash2 className="size-4" />
        )}
      </button>
    </div>
  );
}

export function SavedDrawer() {
  const open = useMarketplaceStore((s) => s.savedOpen);
  const setOpen = useMarketplaceStore((s) => s.setSavedOpen);
  const toggleSaved = useMarketplaceStore((s) => s.toggleSaved);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["saved"],
    queryFn: fetchSavedListings,
    enabled: open,
    staleTime: 30_000,
  });

  const saved = data?.saved ?? [];

  const handleRemove = async (id: string) => {
    toggleSaved(id); // optimistic
    try {
      await unsaveListing(id);
      await queryClient.invalidateQueries({ queryKey: ["saved"] });
      toast("Removed from saved");
    } catch (e) {
      toggleSaved(id); // rollback
      toast.error("Couldn't remove", {
        description: e instanceof Error ? e.message : undefined,
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-[#E5E7EB] p-0 sm:max-w-md"
      >
        <SheetHeader className="flex flex-row items-center justify-between gap-2 border-b border-[#E5E7EB] bg-gradient-to-r from-[#FF7A00]/10 to-transparent px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-[#FF7A00]/10 text-[#FF7A00]">
              <Bookmark className="size-5" />
            </span>
            <div className="flex flex-col gap-0.5">
              <SheetTitle className="text-base font-bold text-[#111827]">
                Saved Businesses
              </SheetTitle>
              <SheetDescription className="text-xs">
                {saved.length > 0
                  ? `${saved.length} bookmarked`
                  : "Your shortlist"}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto bg-[#FAFAFB] p-5">
          {isLoading && (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-2xl bg-[#F3F4F6]"
                />
              ))}
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-sm text-[#6B7280]">
                Couldn&apos;t load your saved list.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="rounded-full bg-[#FF7A00] px-4 py-2 text-sm font-semibold text-white hover:bg-[#FF8C32]"
              >
                Retry
              </button>
            </div>
          )}

          {!isLoading && !isError && saved.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-[#FFF4EB] text-[#FF7A00]">
                <Bookmark className="size-6" />
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-semibold text-[#111827]">
                  Nothing saved yet
                </h3>
                <p className="max-w-xs text-xs text-[#6B7280]">
                  Tap the bookmark icon on any business to add it to your
                  shortlist.
                </p>
              </div>
            </div>
          )}

          {!isLoading && saved.length > 0 && (
            <div className="flex flex-col gap-3">
              {saved.map((l) => (
                <SavedRow
                  key={l.id}
                  listing={l}
                  onRemove={() => handleRemove(l.id)}
                  removing={false}
                />
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
