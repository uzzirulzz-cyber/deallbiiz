"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  ChatMessage,
  LiveClose,
  SortKey,
  Stage,
} from "./types";

type StageFilter = "all" | Stage;

interface MarketplaceState {
  // Filters
  category: string; // "all" or slug
  stage: StageFilter;
  sort: SortKey;
  query: string;

  // Saved listings (localStorage)
  savedIds: string[];

  // UI panels
  savedOpen: boolean;
  aiOpen: boolean;
  snapOpen: boolean;
  webOpen: boolean;
  mobileMenuOpen: boolean;

  // Live feed (websocket)
  online: number;
  recentCloses: LiveClose[];
  viewerCounts: Record<string, number>;
  dealsClosed24h: number;
  socketConnected: boolean;

  // AI chat history (persisted)
  chatHistory: ChatMessage[];
  chatTyping: boolean;

  // Ref to the live socket (not persisted — set from the page effect)
  socket: {
    emit: (ev: string, data?: unknown) => void;
    disconnect: () => void;
  } | null;

  // Actions
  setCategory: (c: string) => void;
  setStage: (s: StageFilter) => void;
  setSort: (s: SortKey) => void;
  setQuery: (q: string) => void;

  toggleSaved: (id: string) => void;
  isSaved: (id: string) => boolean;
  setSavedIds: (ids: string[]) => void;

  setSavedOpen: (b: boolean) => void;
  setAiOpen: (b: boolean) => void;
  setSnapOpen: (b: boolean) => void;
  setWebOpen: (b: boolean) => void;
  setMobileMenuOpen: (b: boolean) => void;

  setOnline: (n: number) => void;
  setRecentCloses: (c: LiveClose[]) => void;
  addClose: (c: LiveClose) => void;
  setViewerCount: (listingId: string, count: number) => void;
  setDealsClosed24h: (n: number) => void;
  setSocketConnected: (b: boolean) => void;
  setSocket: (s: MarketplaceState["socket"]) => void;

  addChatMessage: (m: ChatMessage) => void;
  setChatTyping: (b: boolean) => void;
  clearChat: () => void;
}

export const useMarketplaceStore = create<MarketplaceState>()(
  persist(
    (set, get) => ({
      category: "all",
      stage: "all",
      sort: "trending",
      query: "",

      savedIds: [],

      savedOpen: false,
      aiOpen: false,
      snapOpen: false,
      webOpen: false,
      mobileMenuOpen: false,

      online: 0,
      recentCloses: [],
      viewerCounts: {},
      dealsClosed24h: 0,
      socketConnected: false,

      chatHistory: [],
      chatTyping: false,

      socket: null,

      setCategory: (c) => set({ category: c }),
      setStage: (s) => set({ stage: s }),
      setSort: (s) => set({ sort: s }),
      setQuery: (q) => set({ query: q }),

      toggleSaved: (id) =>
        set((s) => ({
          savedIds: s.savedIds.includes(id)
            ? s.savedIds.filter((x) => x !== id)
            : [...s.savedIds, id],
        })),
      isSaved: (id) => get().savedIds.includes(id),
      setSavedIds: (ids) => set({ savedIds: ids }),

      setSavedOpen: (b) => set({ savedOpen: b }),
      setAiOpen: (b) => set({ aiOpen: b }),
      setSnapOpen: (b) => set({ snapOpen: b }),
      setWebOpen: (b) => set({ webOpen: b }),
      setMobileMenuOpen: (b) => set({ mobileMenuOpen: b }),

      setOnline: (n) => set({ online: n }),
      setRecentCloses: (c) => set({ recentCloses: c }),
      addClose: (c) =>
        set((s) => ({
          recentCloses: [c, ...s.recentCloses].slice(0, 30),
        })),
      setViewerCount: (listingId, count) =>
        set((s) => ({
          viewerCounts: { ...s.viewerCounts, [listingId]: count },
        })),
      setDealsClosed24h: (n) => set({ dealsClosed24h: n }),
      setSocketConnected: (b) => set({ socketConnected: b }),
      setSocket: (s) => set({ socket: s }),

      addChatMessage: (m) =>
        set((s) => ({ chatHistory: [...s.chatHistory, m] })),
      setChatTyping: (b) => set({ chatTyping: b }),
      clearChat: () => set({ chatHistory: [] }),
    }),
    {
      name: "mtd-marketplace",
      storage: createJSONStorage(() => localStorage),
      // Only persist user-specific bits — never the socket or live ephemeral state
      partialize: (s) => ({
        savedIds: s.savedIds,
        chatHistory: s.chatHistory,
      }),
    },
  ),
);
