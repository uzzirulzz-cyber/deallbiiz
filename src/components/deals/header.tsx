"use client";

import { useEffect, useState } from "react";
import { BadgePercent, Bookmark, Camera, Globe, Menu, Search, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useDealsStore } from "./use-deals-store";

function LiveBadge() {
  const online = useDealsStore((s) => s.online);
  const connected = useDealsStore((s) => s.socketConnected);
  return (
    <span
      className="hidden items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300 sm:inline-flex"
      aria-label={`${online} shoppers online`}
    >
      <span className="relative flex size-1.5">
        {connected && (
          <span className="ttd-live-dot absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
        )}
        <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
      </span>
      {online > 0 ? `${online} online` : "Live"}
    </span>
  );
}

function Logo() {
  return (
    <a
      href="/"
      className="group flex items-center gap-2.5"
      aria-label="akethisdeal.biz home"
    >
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-amber-950 shadow-lg shadow-amber-500/20 transition-transform group-hover:scale-105">
        <BadgePercent className="size-5" strokeWidth={2.5} />
      </span>
      <span className="text-base font-bold tracking-tight sm:text-lg">
        akethisdeal
        <span className="text-muted-foreground/70">.biz</span>
      </span>
    </a>
  );
}

function SearchInput() {
  const setQuery = useDealsStore((s) => s.setQuery);
  const query = useDealsStore((s) => s.query);
  const [local, setLocal] = useState(query);

  // Debounce 250ms
  useEffect(() => {
    const t = setTimeout(() => {
      if (local !== query) setQuery(local);
    }, 250);
    return () => clearTimeout(t);
  }, [local, setQuery, query]);

  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder="Search deals, stores, brands…"
        aria-label="Search deals"
        className="h-10 w-full rounded-full border-border/60 bg-input/40 pl-9 pr-9 placeholder:text-muted-foreground/70 focus-visible:ring-amber-500/40"
      />
      {local && (
        <button
          type="button"
          onClick={() => {
            setLocal("");
            setQuery("");
          }}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

export function Header() {
  const setAiOpen = useDealsStore((s) => s.setAiOpen);
  const setSnapOpen = useDealsStore((s) => s.setSnapOpen);
  const setWebOpen = useDealsStore((s) => s.setWebOpen);
  const setSavedOpen = useDealsStore((s) => s.setSavedOpen);
  const savedCount = useDealsStore((s) => s.savedIds.length);
  const mobileMenuOpen = useDealsStore((s) => s.mobileMenuOpen);
  const setMobileMenuOpen = useDealsStore((s) => s.setMobileMenuOpen);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6">
        <Logo />
        <LiveBadge />

        {/* Desktop search */}
        <div className="mx-auto hidden w-full max-w-md flex-1 md:block">
          <SearchInput />
        </div>

        {/* Desktop actions */}
        <nav className="ml-auto hidden items-center gap-2 md:flex" aria-label="Primary">
          <Button
            onClick={() => setAiOpen(true)}
            className="bg-amber-500 text-amber-950 hover:bg-amber-400"
            size="sm"
          >
            <Sparkles className="size-4" />
            AI Finder
          </Button>
          <Button onClick={() => setSnapOpen(true)} variant="outline" size="sm">
            <Camera className="size-4" />
            Snap a Deal
          </Button>
          <Button onClick={() => setWebOpen(true)} variant="outline" size="sm">
            <Globe className="size-4" />
            Web Deals
          </Button>
          <Button
            onClick={() => setSavedOpen(true)}
            variant="outline"
            size="sm"
            className="relative"
            aria-label={`Saved deals (${savedCount})`}
          >
            <Bookmark className="size-4" />
            Saved
            {savedCount > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-amber-500 px-1 text-[11px] font-bold text-amber-950">
                {savedCount}
              </span>
            )}
          </Button>
        </nav>

        {/* Mobile actions */}
        <div className="ml-auto flex items-center gap-1.5 md:hidden">
          <Button
            onClick={() => setAiOpen(true)}
            size="icon"
            className="bg-amber-500 text-amber-950 hover:bg-amber-400"
            aria-label="AI Deal Finder"
          >
            <Sparkles className="size-5" />
          </Button>
          <Button
            onClick={() => setMobileMenuOpen(true)}
            variant="outline"
            size="icon"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </div>

      {/* Mobile search row */}
      <div className="border-t border-border/40 px-4 py-2 md:hidden">
        <SearchInput />
      </div>

      {/* Mobile sheet menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-80">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-amber-950">
                <BadgePercent className="size-4" strokeWidth={2.5} />
              </span>
              Menu
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-2 p-4">
            <Button
              onClick={() => {
                setMobileMenuOpen(false);
                setAiOpen(true);
              }}
              className="justify-start bg-amber-500 text-amber-950 hover:bg-amber-400"
              size="lg"
            >
              <Sparkles className="size-4" />
              AI Deal Finder
            </Button>
            <Button
              onClick={() => {
                setMobileMenuOpen(false);
                setSnapOpen(true);
              }}
              variant="outline"
              size="lg"
              className="justify-start"
            >
              <Camera className="size-4" />
              Snap a Deal
            </Button>
            <Button
              onClick={() => {
                setMobileMenuOpen(false);
                setWebOpen(true);
              }}
              variant="outline"
              size="lg"
              className="justify-start"
            >
              <Globe className="size-4" />
              Web Deals
            </Button>
            <Button
              onClick={() => {
                setMobileMenuOpen(false);
                setSavedOpen(true);
              }}
              variant="outline"
              size="lg"
              className="justify-start"
            >
              <Bookmark className="size-4" />
              Saved Deals
              {savedCount > 0 && (
                <span className="ml-auto inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-amber-500 px-1 text-[11px] font-bold text-amber-950">
                  {savedCount}
                </span>
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
