"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Globe2,
  MapPin,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import type { Listing } from "./types";
import { formatCompactMoney } from "./types";
import { useMarketplaceStore } from "./use-marketplace-store";

function MetricBlock({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
        {label}
      </span>
      <span
        className={
          accent
            ? "text-base font-bold tabular-nums text-[#FF7A00]"
            : "text-base font-bold tabular-nums text-[#111827]"
        }
      >
        {value}
      </span>
    </div>
  );
}

function FeaturedCard({ listing }: { listing: Listing }) {
  const setSnapOpen = useMarketplaceStore((s) => s.setSnapOpen);
  const emitView = useMarketplaceStore((s) => s.socket?.emit);

  const onView = () => {
    if (listing.url) window.open(listing.url, "_blank", "noopener,noreferrer");
    emitView?.("view", listing.id);
  };

  const cat = listing.category;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: -1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mtd-float w-full max-w-md"
    >
      <div className="overflow-hidden rounded-3xl border border-white/40 bg-white p-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
        {/* Top: category pill + verified */}
        <div className="mb-4 flex items-center justify-between">
          {cat ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF4EB] px-3 py-1 text-xs font-semibold text-[#9A4A00]">
              <span aria-hidden>{cat.icon}</span>
              {cat.name}
            </span>
          ) : (
            <span className="rounded-full bg-[#F5F5F7] px-3 py-1 text-xs font-semibold text-[#6B7280]">
              Featured
            </span>
          )}
          {listing.verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              <BadgeCheck className="size-3.5" />
              Verified
            </span>
          )}
        </div>

        {/* Title + tagline */}
        <h3 className="line-clamp-1 text-lg font-bold tracking-tight text-[#111827]">
          {listing.title}
        </h3>
        {listing.tagline && (
          <p className="mt-1 line-clamp-1 text-sm text-[#6B7280]">
            {listing.tagline}
          </p>
        )}

        {/* Asking price — hero */}
        <div className="mt-5 flex items-end justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
              Asking Price
            </span>
            <span className="text-4xl font-bold tabular-nums leading-none text-[#FF7A00]">
              {formatCompactMoney(listing.askingPrice)}
            </span>
          </div>
          {listing.stage && (
            <span className="rounded-full bg-orange-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-orange-700">
              {listing.stage}
            </span>
          )}
        </div>

        {/* Mini metrics */}
        <div className="mt-5 grid grid-cols-3 divide-x divide-[#F3F4F6] rounded-2xl bg-[#FAFAFB] py-3.5">
          <div className="px-3">
            <MetricBlock
              label="Revenue"
              value={
                listing.annualRevenue > 0
                  ? `${formatCompactMoney(listing.annualRevenue)}/yr`
                  : "—"
              }
            />
          </div>
          <div className="px-3">
            <MetricBlock
              label="Profit"
              value={
                listing.annualProfit > 0
                  ? `${formatCompactMoney(listing.annualProfit)}/yr`
                  : "—"
              }
            />
          </div>
          <div className="px-3">
            <MetricBlock
              label="Multiple"
              value={
                listing.revenueMultiple > 0
                  ? `${listing.revenueMultiple}x rev`
                  : "—"
              }
              accent
            />
          </div>
        </div>

        {/* Location */}
        <div className="mt-4 flex items-center gap-1.5 text-xs text-[#6B7280]">
          <MapPin className="size-3.5" />
          <span>{listing.location || "Remote / Global"}</span>
          {listing.ageYears > 0 && (
            <>
              <span className="text-[#D1D5DB]">·</span>
              <span>
                {listing.ageYears} yr old
                {listing.employees > 0 && ` · ${listing.employees} staff`}
              </span>
            </>
          )}
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={onView}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#FF7A00] px-5 py-3 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(255,122,0,0.28)] transition hover:bg-[#FF8C32]"
        >
          View Listing
          <ArrowRight className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => setSnapOpen(true)}
          className="mt-2 w-full rounded-full px-5 py-2.5 text-xs font-medium text-[#6B7280] transition hover:text-[#111827]"
        >
          Or list your own business →
        </button>
      </div>
    </motion.div>
  );
}

function FallbackCard() {
  const setSnapOpen = useMarketplaceStore((s) => s.setSnapOpen);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: -1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="mtd-float w-full max-w-md"
    >
      <div className="overflow-hidden rounded-3xl border border-white/40 bg-white p-7 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
        <span className="grid size-12 place-items-center rounded-2xl bg-[#FFF4EB] text-[#FF7A00]">
          <Building2 className="size-6" />
        </span>
        <h3 className="mt-5 text-xl font-bold tracking-tight text-[#111827]">
          Looking for a deal?
        </h3>
        <p className="mt-2 text-sm text-[#6B7280]">
          Browse 12+ verified business listings across 18 categories — or list
          your own and let the marketplace come to you.
        </p>
        <button
          type="button"
          onClick={() =>
            document
              .getElementById("listings")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#FF7A00] px-5 py-3 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(255,122,0,0.28)] transition hover:bg-[#FF8C32]"
        >
          Browse All Projects
          <ArrowRight className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => setSnapOpen(true)}
          className="mt-2 w-full rounded-full px-5 py-2.5 text-xs font-medium text-[#6B7280] transition hover:text-[#111827]"
        >
          List your business →
        </button>
      </div>
    </motion.div>
  );
}

export function Hero({
  listing,
  loading,
}: {
  listing: Listing | null;
  loading: boolean;
}) {
  const setSnapOpen = useMarketplaceStore((s) => s.setSnapOpen);
  const setAiOpen = useMarketplaceStore((s) => s.setAiOpen);

  const scrollToGrid = () =>
    document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-gradient-to-br from-[#1A1D2E] to-[#2C2E3E]"
    >
      {/* Radial orange glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 size-[520px] rounded-full bg-[#FF7A00]/25 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-24 size-[420px] rounded-full bg-[#FF5757]/10 blur-[120px]"
      />

      <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-10 lg:py-24">
        {/* Left column */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="flex flex-col gap-6"
        >
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#FF7A00]/30 bg-[#FF7A00]/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#FF8C32]">
            <Sparkles className="size-3.5" />
            Global Enterprise Marketplace
          </span>

          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
            Buy, Sell &amp; Invest in{" "}
            <span className="bg-gradient-to-r from-[#FF7A00] to-[#FFB775] bg-clip-text text-transparent">
              Businesses
            </span>{" "}
            Worldwide
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
            The marketplace for SaaS, Real Estate, Startups, E-commerce, AI
            Solutions, and 50+ business categories. Discover verified
            opportunities, run instant AI valuations, and close the deal.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={scrollToGrid}
              className="inline-flex items-center gap-2 rounded-full bg-[#FF7A00] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(255,122,0,0.32)] transition hover:bg-[#FF8C32]"
            >
              Explore Projects
              <ArrowRight className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setSnapOpen(true)}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              <Plus className="size-4" />
              List Your Business
            </button>
            <button
              type="button"
              onClick={() => setAiOpen(true)}
              className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-white/80 transition hover:text-white"
            >
              <Sparkles className="size-4 text-[#FF8C32]" />
              AI Valuation
            </button>
          </div>

          {/* Mini stats */}
          <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-6">
            <div className="flex flex-col">
              <span className="text-xl font-bold tabular-nums text-[#FF8C32]">
                $12.30M
              </span>
              <span className="text-[11px] uppercase tracking-wider text-white/55">
                Portfolio Value
              </span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex flex-col">
              <span className="text-xl font-bold tabular-nums text-white">
                12
              </span>
              <span className="text-[11px] uppercase tracking-wider text-white/55">
                Listings
              </span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex flex-col">
              <span className="text-xl font-bold tabular-nums text-white">
                120+
              </span>
              <span className="text-[11px] uppercase tracking-wider text-white/55">
                Countries
              </span>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-white/65">
              <Globe2 className="size-4 text-[#FF8C32]" />
              <span className="text-xs">
                Trusted by businesses in 120+ countries
              </span>
            </div>
          </div>
        </motion.div>

        {/* Right column — featured card */}
        <div className="flex justify-center lg:justify-end">
          {loading ? (
            <div className="h-[480px] w-full max-w-md animate-pulse rounded-3xl bg-white/10" />
          ) : listing ? (
            <FeaturedCard listing={listing} />
          ) : (
            <FallbackCard />
          )}
        </div>
      </div>

      {/* Bottom hint strip */}
      <div className="border-t border-white/10 bg-black/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-1.5 px-4 py-3 text-center text-[11px] font-medium uppercase tracking-wider text-white/55 sm:px-6">
          <span className="inline-flex items-center gap-1.5">
            <TrendingUp className="size-3.5 text-[#FF8C32]" /> SaaS
          </span>
          <span className="inline-flex items-center gap-1.5">
            <TrendingUp className="size-3.5 text-[#FF8C32]" /> AI Solutions
          </span>
          <span className="inline-flex items-center gap-1.5">
            <TrendingUp className="size-3.5 text-[#FF8C32]" /> E-commerce
          </span>
          <span className="inline-flex items-center gap-1.5">
            <TrendingUp className="size-3.5 text-[#FF8C32]" /> Real Estate
          </span>
          <span className="inline-flex items-center gap-1.5">
            <TrendingUp className="size-3.5 text-[#FF8C32]" /> FinTech
          </span>
          <span className="inline-flex items-center gap-1.5">
            <TrendingUp className="size-3.5 text-[#FF8C32]" /> Startups
          </span>
        </div>
      </div>
    </section>
  );
}
