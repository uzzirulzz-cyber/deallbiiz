"use client";

import { Handshake } from "lucide-react";

import { useMarketplaceStore } from "./use-marketplace-store";
import { formatCompactMoney } from "./types";

export function LiveTicker() {
  const online = useMarketplaceStore((s) => s.online);
  const recentCloses = useMarketplaceStore((s) => s.recentCloses);
  const dealsClosed = useMarketplaceStore((s) => s.dealsClosed24h);

  const items =
    recentCloses.length > 0
      ? recentCloses
      : [
          {
            id: "seed-1",
            listingTitle: "CloudInbox — Email Automation SaaS",
            categorySlug: "saas",
            amount: 1_200_000,
            party: "An investor in Karachi",
            at: Date.now() - 60_000,
          },
          {
            id: "seed-2",
            listingTitle: "PayBridge — B2B Cross-Border Payments",
            categorySlug: "fintech",
            amount: 2_400_000,
            party: "A fund in London",
            at: Date.now() - 120_000,
          },
          {
            id: "seed-3",
            listingTitle: "RecipeHub.com — Food Blog",
            categorySlug: "websites",
            amount: 220_000,
            party: "A buyer in NYC",
            at: Date.now() - 180_000,
          },
        ];

  return (
    <section
      aria-label="Live deal closes"
      className="border-y border-orange-100 bg-[#FFF8F2]"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2.5 sm:px-6">
        {/* Online indicator */}
        <div className="flex shrink-0 items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
          <span className="mtd-live-dot size-2 rounded-full bg-emerald-500" />
          {online > 0 ? `${online} investors online` : "LIVE"}
        </div>

        {dealsClosed > 0 && (
          <div className="hidden shrink-0 items-center gap-1.5 text-xs font-medium text-[#9A4A00] sm:flex">
            <Handshake className="size-3.5" />
            {dealsClosed} deals closed · 24h
          </div>
        )}

        {/* Marquee */}
        <div className="relative flex-1 overflow-hidden">
          <div className="animate-marquee flex w-max items-center gap-6 whitespace-nowrap">
            {[...items, ...items].map((c, i) => (
              <span
                key={`${c.id}-${i}`}
                className="inline-flex items-center gap-2 text-xs text-[#374151]"
              >
                <Handshake className="size-3.5 text-[#FF7A00]" />
                <span className="font-medium text-[#111827]">{c.party}</span>
                <span className="text-[#9CA3AF]">closed</span>
                <span className="font-semibold text-[#111827]">
                  {c.listingTitle}
                </span>
                <span className="font-bold tabular-nums text-[#FF7A00]">
                  {formatCompactMoney(c.amount)}
                </span>
                <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                  {c.categorySlug}
                </span>
                <span className="text-[#D1D5DB]">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
