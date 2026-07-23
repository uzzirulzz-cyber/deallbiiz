"use client";

import { useEffect, useState } from "react";
import {
  Bookmark,
  Globe,
  Handshake,
  Menu,
  Plus,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import { useMarketplaceStore } from "./use-marketplace-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

function useScrolled(threshold = 12) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function useDebounced<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function Logo() {
  return (
    <a href="#top" className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-[#1A1D2E] to-[#2C2E3E] text-white shadow-[0_4px_12px_rgba(26,29,46,0.25)]">
        <Handshake className="size-5" strokeWidth={2.2} />
      </span>
      <span className="flex flex-col leading-none">
        <span className="flex items-baseline gap-1">
          <span className="text-[15px] font-bold tracking-tight text-[#111827]">
            Make This Deal
          </span>
          <span className="text-[10px] font-semibold text-[#FF7A00]">.biz</span>
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#6B7280]">
          Together We Grow Strong
        </span>
      </span>
    </a>
  );
}

function LiveBadge() {
  const online = useMarketplaceStore((s) => s.online);
  return (
    <div className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 md:flex">
      <span className="mtd-live-dot size-1.5 rounded-full bg-emerald-500" />
      {online > 0 ? `${online} online` : "LIVE"}
    </div>
  );
}

export function Header() {
  const setQuery = useMarketplaceStore((s) => s.setQuery);
  const query = useMarketplaceStore((s) => s.query);
  const setAiOpen = useMarketplaceStore((s) => s.setAiOpen);
  const setSnapOpen = useMarketplaceStore((s) => s.setSnapOpen);
  const setWebOpen = useMarketplaceStore((s) => s.setWebOpen);
  const setSavedOpen = useMarketplaceStore((s) => s.setSavedOpen);
  const mobileMenuOpen = useMarketplaceStore((s) => s.mobileMenuOpen);
  const setMobileMenuOpen = useMarketplaceStore((s) => s.setMobileMenuOpen);
  const savedCount = useMarketplaceStore((s) => s.savedIds.length);

  const scrolled = useScrolled(12);
  const [localQuery, setLocalQuery] = useState(query);
  const debounced = useDebounced(localQuery, 250);

  useEffect(() => {
    setQuery(debounced);
  }, [debounced, setQuery]);

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  const scrollToGrid = () => {
    document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full border-b transition-colors",
          scrolled
            ? "border-[#E5E7EB] bg-white/85 shadow-[0_4px_20px_rgba(0,0,0,0.04)] backdrop-blur-xl"
            : "border-transparent bg-white/0",
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:gap-4">
          <Logo />
          <LiveBadge />

          {/* Center search — desktop */}
          <div className="mx-auto hidden w-full max-w-md md:block">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="search"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="Search businesses, categories, locations…"
                className="h-10 w-full rounded-full border border-[#E5E7EB] bg-[#F5F5F7] pl-10 pr-4 text-sm text-[#111827] placeholder:text-[#9CA3AF] transition-colors focus:border-[#FF7A00] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF7A00]/10"
              />
            </div>
          </div>

          {/* Right actions — desktop */}
          <div className="ml-auto hidden items-center gap-2 md:flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setWebOpen(true)}
              className="rounded-full px-3 text-[#374151] hover:bg-[#F5F5F7] hover:text-[#111827]"
            >
              <Globe className="size-4" />
              <span className="text-sm font-medium">Web Search</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSavedOpen(true)}
              className="relative rounded-full px-3 text-[#374151] hover:bg-[#F5F5F7] hover:text-[#111827]"
            >
              <Bookmark className="size-4" />
              <span className="text-sm font-medium">Saved</span>
              {savedCount > 0 && (
                <span className="ml-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#FF7A00] px-1.5 text-[10px] font-bold text-white">
                  {savedCount}
                </span>
              )}
            </Button>

            <Button
              size="sm"
              onClick={() => setAiOpen(true)}
              className="h-9 rounded-full bg-[#FF7A00] px-4 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(255,122,0,0.28)] hover:bg-[#FF8C32]"
            >
              <Sparkles className="size-4" />
              AI Valuation
            </Button>

            <Button
              size="sm"
              onClick={() => setSnapOpen(true)}
              className="h-9 rounded-full bg-gradient-to-br from-[#1A1D2E] to-[#2C2E3E] px-4 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(26,29,46,0.25)] hover:opacity-95"
            >
              <Plus className="size-4" />
              List a Business
            </Button>
          </div>

          {/* Mobile actions */}
          <div className="ml-auto flex items-center gap-1.5 md:hidden">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setAiOpen(true)}
              className="size-10 rounded-full bg-[#FF7A00]/10 text-[#FF7A00] hover:bg-[#FF7A00]/15"
              aria-label="Open AI Valuation"
            >
              <Sparkles className="size-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setMobileMenuOpen(true)}
              className="size-10 rounded-full text-[#111827] hover:bg-[#F5F5F7]"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent
          side="right"
          className="w-full border-[#E5E7EB] p-0 sm:max-w-sm"
        >
          <SheetHeader className="flex flex-row items-center justify-between gap-2 border-b border-[#E5E7EB] px-5 py-4">
            <SheetTitle className="text-base font-bold text-[#111827]">
              Menu
            </SheetTitle>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="grid size-8 place-items-center rounded-full text-[#6B7280] hover:bg-[#F5F5F7]"
              aria-label="Close menu"
            >
              <X className="size-4" />
            </button>
          </SheetHeader>
          <SheetDescription className="sr-only">
            Browse Make This Deal navigation options
          </SheetDescription>

          <div className="flex flex-col gap-3 p-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="search"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder="Search businesses…"
                className="h-11 w-full rounded-full border border-[#E5E7EB] bg-[#F5F5F7] pl-10 pr-4 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#FF7A00] focus:bg-white focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                scrollToGrid();
              }}
              className="flex w-full items-center justify-between rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3.5 text-left shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition hover:border-[#FF7A00]/30"
            >
              <span className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-[#FFF4EB] text-[#FF7A00]">
                  <Search className="size-4" />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold text-[#111827]">
                    Browse Projects
                  </span>
                  <span className="text-xs text-[#6B7280]">
                    All listings on the marketplace
                  </span>
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setAiOpen(true);
              }}
              className="flex w-full items-center justify-between rounded-2xl bg-[#FF7A00] px-4 py-3.5 text-left text-white shadow-[0_6px_18px_rgba(255,122,0,0.25)] transition hover:bg-[#FF8C32]"
            >
              <span className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-white/15">
                  <Sparkles className="size-4" />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold">AI Valuation</span>
                  <span className="text-xs text-white/80">
                    Value any business with Dealio
                  </span>
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setSnapOpen(true);
              }}
              className="flex w-full items-center justify-between rounded-2xl bg-gradient-to-br from-[#1A1D2E] to-[#2C2E3E] px-4 py-3.5 text-left text-white shadow-[0_6px_18px_rgba(26,29,46,0.22)] transition hover:opacity-95"
            >
              <span className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-white/10">
                  <Plus className="size-4" />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold">List a Business</span>
                  <span className="text-xs text-white/70">
                    Snap a screenshot — AI fills the form
                  </span>
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setWebOpen(true);
              }}
              className="flex w-full items-center justify-between rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3.5 text-left shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition hover:border-[#FF7A00]/30"
            >
              <span className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-[#F5F5F7] text-[#111827]">
                  <Globe className="size-4" />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold text-[#111827]">
                    Web Search
                  </span>
                  <span className="text-xs text-[#6B7280]">
                    Find businesses for sale across the web
                  </span>
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setSavedOpen(true);
              }}
              className="flex w-full items-center justify-between rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3.5 text-left shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition hover:border-[#FF7A00]/30"
            >
              <span className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-full bg-[#FFF4EB] text-[#FF7A00]">
                  <Bookmark className="size-4" />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold text-[#111827]">
                    Saved
                  </span>
                  <span className="text-xs text-[#6B7280]">
                    {savedCount} bookmarked businesses
                  </span>
                </span>
              </span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
