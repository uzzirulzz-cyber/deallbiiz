"use client";

import { useEffect, useRef, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import { Sparkles } from "lucide-react";

import { useMarketplaceStore } from "@/components/marketplace/use-marketplace-store";
import { fetchFeaturedListing, fetchListings } from "@/components/marketplace/api";
import type {
  LiveClose,
  WSStats,
  WSWelcome,
} from "@/components/marketplace/types";
import { Header } from "@/components/marketplace/header";
import { Hero } from "@/components/marketplace/hero";
import { StatsBar } from "@/components/marketplace/stats-bar";
import { LiveTicker } from "@/components/marketplace/live-ticker";
import { TrendingRail } from "@/components/marketplace/trending-rail";
import { CategoryPills } from "@/components/marketplace/category-pills";
import { FilterBar } from "@/components/marketplace/filter-bar";
import { ListingsGrid } from "@/components/marketplace/listings-grid";
import { HowItWorks } from "@/components/marketplace/how-it-works";
import { CtaBand } from "@/components/marketplace/cta-band";
import { Footer } from "@/components/marketplace/footer";
import { AiValuation } from "@/components/marketplace/ai-valuation";
import { SnapAListing } from "@/components/marketplace/snap-a-listing";
import { WebSearch } from "@/components/marketplace/web-search";
import { SavedDrawer } from "@/components/marketplace/saved-drawer";

function useFeaturedListing() {
  return useQuery({
    queryKey: ["featured"],
    queryFn: fetchFeaturedListing,
    staleTime: 60_000,
  });
}

function useListingsCount() {
  const category = useMarketplaceStore((s) => s.category);
  const stage = useMarketplaceStore((s) => s.stage);
  const sort = useMarketplaceStore((s) => s.sort);
  const query = useMarketplaceStore((s) => s.query);
  return useQuery({
    queryKey: ["listings", { category, stage, sort, query, count: true }],
    queryFn: () =>
      fetchListings({ category, stage, sort, q: query, limit: 48 }),
    staleTime: 30_000,
  });
}

function PageContent() {
  const setSocket = useMarketplaceStore((s) => s.setSocket);
  const setSocketConnected = useMarketplaceStore((s) => s.setSocketConnected);
  const setOnline = useMarketplaceStore((s) => s.setOnline);
  const setRecentCloses = useMarketplaceStore((s) => s.setRecentCloses);
  const addClose = useMarketplaceStore((s) => s.addClose);
  const setViewerCount = useMarketplaceStore((s) => s.setViewerCount);
  const setDealsClosed24h = useMarketplaceStore((s) => s.setDealsClosed24h);
  const setAiOpen = useMarketplaceStore((s) => s.setAiOpen);

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
      emit: (ev: string, data?: unknown) => socket.emit(ev, data as never),
      disconnect: () => socket.disconnect(),
    });

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);
    const onWelcome = (w: WSWelcome) => {
      if (typeof w?.online === "number") setOnline(w.online);
      if (Array.isArray(w?.recentCloses)) setRecentCloses(w.recentCloses);
    };
    const onStats = (s: WSStats) => {
      if (typeof s?.online === "number") setOnline(s.online);
      if (typeof s?.dealsClosed24h === "number")
        setDealsClosed24h(s.dealsClosed24h);
      if (Array.isArray(s?.viewers)) {
        for (const v of s.viewers) {
          if (v?.listingId && typeof v.count === "number") {
            setViewerCount(v.listingId, v.count);
          }
        }
      }
    };
    const onClose = (c: LiveClose) => {
      if (c?.id) addClose(c);
    };
    const onViewAck = (payload: { listingId: string; count: number }) => {
      if (payload?.listingId && typeof payload.count === "number") {
        setViewerCount(payload.listingId, payload.count);
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("welcome", onWelcome);
    socket.on("stats", onStats);
    socket.on("close", onClose);
    socket.on("view-ack", onViewAck);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("welcome", onWelcome);
      socket.off("stats", onStats);
      socket.off("close", onClose);
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
    setRecentCloses,
    addClose,
    setViewerCount,
    setDealsClosed24h,
  ]);

  const { data: featuredData, isLoading: featuredLoading } =
    useFeaturedListing();
  const featured = featuredData?.listing ?? null;

  const countQuery = useListingsCount();
  const count = countQuery.data?.count ?? 0;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1">
        {/* Hero — showpiece dark navy banner */}
        <Hero listing={featured} loading={featuredLoading} />

        {/* Stats bar — overlaps hero */}
        <StatsBar />

        {/* Live ticker */}
        <LiveTicker />

        {/* Trending rail */}
        <TrendingRail />

        {/* Browse by category */}
        <section
          id="categories"
          aria-label="Browse by category"
          className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10"
        >
          <div className="mb-4 flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#FF7A00]">
              Browse
            </span>
            <h2 className="text-xl font-bold tracking-tight text-[#111827] sm:text-2xl">
              Browse by Category
            </h2>
          </div>
          <CategoryPills />
        </section>

        {/* How it works */}
        <div id="how-it-works">
          <HowItWorks />
        </div>

        {/* Filter + listings grid */}
        <section
          id="listings"
          aria-label="All business listings"
          className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-12 sm:px-6 sm:py-16"
        >
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-[#FF7A00]">
              The marketplace
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-[#111827] sm:text-3xl">
              All Business Listings
            </h2>
            <p className="text-sm text-[#6B7280]">
              Verified businesses for sale worldwide — filter by category,
              stage, or sort by price, revenue, and multiple.
            </p>
          </div>
          <FilterBar count={count} />
          <ListingsGrid />
        </section>

        {/* Mid-page CTA band */}
        <CtaBand />
      </main>

      <Footer />

      {/* Floating action button — mobile AI Valuation shortcut */}
      <button
        onClick={() => setAiOpen(true)}
        aria-label="Open AI Valuation"
        className="fixed bottom-5 right-5 z-30 grid size-14 place-items-center rounded-full bg-[#FF7A00] text-white shadow-[0_8px_24px_rgba(255,122,0,0.4)] transition-transform hover:scale-105 active:scale-95 md:hidden"
      >
        <Sparkles className="size-6" strokeWidth={2.2} />
      </button>

      {/* Dialogs / sheets */}
      <AiValuation />
      <SnapAListing />
      <WebSearch />
      <SavedDrawer />
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
