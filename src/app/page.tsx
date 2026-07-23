"use client";

import { useEffect, useRef, useState } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import { Sparkles } from "lucide-react";

import { useDealsStore } from "@/components/deals/use-deals-store";
import { fetchDeals, fetchFeaturedDeal } from "@/components/deals/api";
import type { LiveClaim, WSStats, WSWelcome } from "@/components/deals/types";
import { Header } from "@/components/deals/header";
import { HeroDeal } from "@/components/deals/hero-deal";
import { LiveTicker } from "@/components/deals/live-ticker";
import { TrendingRail } from "@/components/deals/trending-rail";
import { CategoryPills } from "@/components/deals/category-pills";
import { FilterBar } from "@/components/deals/filter-bar";
import { DealsGrid } from "@/components/deals/deals-grid";
import { Footer } from "@/components/deals/footer";
import { AiFinder } from "@/components/deals/ai-finder";
import { SnapADeal } from "@/components/deals/snap-a-deal";
import { WebSearchDeals } from "@/components/deals/web-search-deals";
import { SavedDrawer } from "@/components/deals/saved-drawer";

function useFeaturedDeal() {
  return useQuery({
    queryKey: ["featured"],
    queryFn: fetchFeaturedDeal,
    staleTime: 60_000,
  });
}

function useDealsCount() {
  const category = useDealsStore((s) => s.category);
  const sort = useDealsStore((s) => s.sort);
  const query = useDealsStore((s) => s.query);
  const flashOnly = useDealsStore((s) => s.flashOnly);
  return useQuery({
    queryKey: ["deals", { category, sort, query, flashOnly }],
    queryFn: () =>
      fetchDeals({ category, sort, q: query, flash: flashOnly, limit: 48 }),
    staleTime: 30_000,
  });
}

function PageContent() {
  const setSocket = useDealsStore((s) => s.setSocket);
  const setSocketConnected = useDealsStore((s) => s.setSocketConnected);
  const setOnline = useDealsStore((s) => s.setOnline);
  const setRecentClaims = useDealsStore((s) => s.setRecentClaims);
  const addClaim = useDealsStore((s) => s.addClaim);
  const setViewerCount = useDealsStore((s) => s.setViewerCount);
  const setClaimsLastHour = useDealsStore((s) => s.setClaimsLastHour);
  const setAiOpen = useDealsStore((s) => s.setAiOpen);

  const socketRef = useRef<Socket | null>(null);

  // Set up the WebSocket connection ONCE
  useEffect(() => {
    const socket = io("/?XTransformPort=3003", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1500,
      timeout: 12000,
    });
    socketRef.current = socket;

    // Expose only the methods we use to the store (keeps the type simple)
    setSocket({
      emit: (ev: string, data?: unknown) => socket.emit(ev, data as any),
      disconnect: () => socket.disconnect(),
    });

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);
    const onWelcome = (w: WSWelcome) => {
      if (typeof w?.online === "number") setOnline(w.online);
      if (Array.isArray(w?.recentClaims)) setRecentClaims(w.recentClaims);
    };
    const onStats = (s: WSStats) => {
      if (typeof s?.online === "number") setOnline(s.online);
      if (typeof s?.claimsLastHour === "number") setClaimsLastHour(s.claimsLastHour);
      if (Array.isArray(s?.viewers)) {
        for (const v of s.viewers) {
          if (v?.dealId && typeof v.count === "number") {
            setViewerCount(v.dealId, v.count);
          }
        }
      }
    };
    const onClaim = (c: LiveClaim) => {
      if (c?.id) addClaim(c);
    };
    const onViewAck = (payload: { dealId: string; count: number }) => {
      if (payload?.dealId && typeof payload.count === "number") {
        setViewerCount(payload.dealId, payload.count);
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("welcome", onWelcome);
    socket.on("stats", onStats);
    socket.on("claim", onClaim);
    socket.on("view-ack", onViewAck);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("welcome", onWelcome);
      socket.off("stats", onStats);
      socket.off("claim", onClaim);
      socket.off("view-ack", onViewAck);
      socket.disconnect();
      socketRef.current = null;
      setSocket(null);
      setSocketConnected(false);
    };
  }, [
    setSocket,
    setSocketConnected,
    setOnline,
    setRecentClaims,
    addClaim,
    setViewerCount,
    setClaimsLastHour,
  ]);

  const { data: featuredData, isLoading: featuredLoading } = useFeaturedDeal();
  const featured = featuredData?.deal ?? null;

  const countQuery = useDealsCount();
  const count = countQuery.data?.count ?? 0;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        {featuredLoading ? (
          <HeroSkeleton />
        ) : featured ? (
          <HeroDeal deal={featured} />
        ) : null}

        <LiveTicker />

        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10">
          {/* Trending rail */}
          <TrendingRail />

          {/* Categories */}
          <section aria-label="Categories" className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              Browse
            </span>
            <CategoryPills />
          </section>

          {/* Filter + grid */}
          <section aria-label="All deals" className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-widest text-amber-400">
                  The feed
                </span>
                <h2 className="text-2xl font-bold tracking-tight">All deals</h2>
              </div>
              <FilterBar count={count} />
            </div>
            <DealsGrid />
          </section>
        </div>
      </main>

      <Footer />

      {/* Floating action button — mobile AI Finder shortcut */}
      <button
        onClick={() => setAiOpen(true)}
        aria-label="Open AI Deal Finder"
        className="fixed bottom-5 right-5 z-30 grid size-14 place-items-center rounded-full bg-amber-500 text-amber-950 shadow-xl shadow-amber-500/30 transition-transform hover:scale-105 active:scale-95 md:hidden"
      >
        <Sparkles className="size-6" strokeWidth={2.4} />
      </button>

      {/* Dialogs / sheets */}
      <AiFinder />
      <SnapADeal />
      <WebSearchDeals />
      <SavedDrawer />
    </div>
  );
}

function HeroSkeleton() {
  return (
    <div className="border-b border-border/40 bg-gradient-to-b from-amber-500/[0.05] via-background to-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-6 h-8 w-40 animate-pulse rounded bg-muted" />
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
          <div className="aspect-[16/11] w-full animate-pulse rounded-2xl bg-muted" />
          <div className="flex flex-col gap-4">
            <div className="h-6 w-32 animate-pulse rounded bg-muted" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
            <div className="h-16 w-full animate-pulse rounded-xl bg-muted" />
            <div className="h-10 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <PageContent />
    </QueryClientProvider>
  );
}
