"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { SortKey, ChatMessage, LiveClaim, WSStats } from "./types";

interface DealsState {
  // Filters
  category: string; // "all" or slug
  sort: SortKey;
  query: string;
  flashOnly: boolean;

  // Saved deals (localStorage)
  savedIds: string[];

  // UI panels
  savedOpen: boolean;
  aiOpen: boolean;
  snapOpen: boolean;
  webOpen: boolean;
  mobileMenuOpen: boolean;

  // Live feed (websocket)
  online: number;
  recentClaims: LiveClaim[];
  viewerCounts: Record<string, number>;
  claimsLastHour: number;
  socketConnected: boolean;

  // AI chat history (persisted)
  chatHistory: ChatMessage[];
  chatTyping: boolean;

  // Refs to the live socket (not persisted — set from the page effect)
  socket: { emit: (ev: string, data?: unknown) => void; disconnect: () => void } | null;

  // Actions
  setCategory: (c: string) => void;
  setSort: (s: SortKey) => void;
  setQuery: (q: string) => void;
  setFlashOnly: (f: boolean) => void;

  toggleSaved: (id: string) => void;
  isSaved: (id: string) => boolean;
  setSavedIds: (ids: string[]) => void;

  setSavedOpen: (b: boolean) => void;
  setAiOpen: (b: boolean) => void;
  setSnapOpen: (b: boolean) => void;
  setWebOpen: (b: boolean) => void;
  setMobileMenuOpen: (b: boolean) => void;

  setOnline: (n: number) => void;
  setRecentClaims: (c: LiveClaim[]) => void;
  addClaim: (c: LiveClaim) => void;
  setViewerCount: (dealId: string, count: number) => void;
  setClaimsLastHour: (n: number) => void;
  setSocketConnected: (b: boolean) => void;
  setSocket: (s: DealsState["socket"]) => void;

  addChatMessage: (m: ChatMessage) => void;
  setChatTyping: (b: boolean) => void;
  clearChat: () => void;
}

export const useDealsStore = create<DealsState>()(
  persist(
    (set, get) => ({
      category: "all",
      sort: "discount",
      query: "",
      flashOnly: false,

      savedIds: [],

      savedOpen: false,
      aiOpen: false,
      snapOpen: false,
      webOpen: false,
      mobileMenuOpen: false,

      online: 0,
      recentClaims: [],
      viewerCounts: {},
      claimsLastHour: 0,
      socketConnected: false,

      chatHistory: [],
      chatTyping: false,

      socket: null,

      setCategory: (c) => set({ category: c }),
      setSort: (s) => set({ sort: s }),
      setQuery: (q) => set({ query: q }),
      setFlashOnly: (f) => set({ flashOnly: f }),

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
      setRecentClaims: (c) => set({ recentClaims: c }),
      addClaim: (c) =>
        set((s) => ({
          recentClaims: [c, ...s.recentClaims].slice(0, 30),
        })),
      setViewerCount: (dealId, count) =>
        set((s) => ({
          viewerCounts: { ...s.viewerCounts, [dealId]: count },
        })),
      setClaimsLastHour: (n) => set({ claimsLastHour: n }),
      setSocketConnected: (b) => set({ socketConnected: b }),
      setSocket: (s) => set({ socket: s }),

      addChatMessage: (m) =>
        set((s) => ({ chatHistory: [...s.chatHistory, m] })),
      setChatTyping: (b) => set({ chatTyping: b }),
      clearChat: () => set({ chatHistory: [] }),
    }),
    {
      name: "ttd-store",
      storage: createJSONStorage(() => localStorage),
      // Only persist user-specific bits — never the socket or live ephemeral state
      partialize: (s) => ({
        savedIds: s.savedIds,
        chatHistory: s.chatHistory,
      }),
    },
  ),
);
