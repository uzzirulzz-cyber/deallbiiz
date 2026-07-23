// Thin fetch wrappers around every backend endpoint.
// All requests use relative paths so the gateway/Caddy can route them.

import type {
  AnalyzedDeal,
  Category,
  ChatHistoryItem,
  Deal,
  SortKey,
  WebDeal,
} from "./types";

async function jsonFetch<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

// ---- Deals list ----------------------------------------------------------
export interface ListDealsParams {
  category?: string;
  sort?: SortKey;
  q?: string;
  flash?: boolean;
  trending?: boolean;
  featured?: boolean;
  limit?: number;
}

export function fetchDeals(params: ListDealsParams = {}): Promise<{ deals: Deal[]; count: number }> {
  const sp = new URLSearchParams();
  if (params.category && params.category !== "all") sp.set("category", params.category);
  if (params.sort) sp.set("sort", params.sort);
  if (params.q?.trim()) sp.set("q", params.q.trim());
  if (params.flash) sp.set("flash", "1");
  if (params.trending) sp.set("trending", "1");
  if (params.featured) sp.set("featured", "1");
  if (params.limit) sp.set("limit", String(params.limit));
  return jsonFetch(`/api/deals?${sp.toString()}`);
}

export function fetchFeaturedDeal(): Promise<{ deal: Deal | null }> {
  return jsonFetch(`/api/deals/featured`);
}

export function fetchTrendingDeals(): Promise<{ deals: Deal[] }> {
  return jsonFetch(`/api/deals/trending`);
}

export function fetchDealById(id: string): Promise<{ deal: Deal; saved: boolean; claimed: boolean }> {
  return jsonFetch(`/api/deals/${encodeURIComponent(id)}`);
}

// ---- Categories ----------------------------------------------------------
export function fetchCategories(): Promise<{ categories: (Category & { _count: { deals: number } })[] }> {
  return jsonFetch(`/api/categories`);
}

// ---- Saved deals ---------------------------------------------------------
export function fetchSavedDeals(): Promise<{ saved: Deal[] }> {
  return jsonFetch(`/api/user/saved`);
}

export function saveDeal(dealId: string): Promise<{ ok: true }> {
  return jsonFetch(`/api/user/saved`, {
    method: "POST",
    body: JSON.stringify({ dealId }),
  });
}

export function unsaveDeal(dealId: string): Promise<{ ok: true }> {
  return jsonFetch(`/api/user/saved?dealId=${encodeURIComponent(dealId)}`, {
    method: "DELETE",
  });
}

// ---- Claims --------------------------------------------------------------
export function claimDeal(dealId: string): Promise<{ ok: true; claimedCount: number }> {
  return jsonFetch(`/api/user/claims`, {
    method: "POST",
    body: JSON.stringify({ dealId }),
  });
}

// ---- Create deal ---------------------------------------------------------
export interface NewDealInput {
  title: string;
  store: string;
  storeLogo?: string;
  imageUrl: string;
  originalPrice: number;
  dealPrice: number;
  currency?: string;
  url: string;
  categorySlug: string;
  description?: string;
  expiresAt: string;
  flashDeal?: boolean;
  tags?: string;
}

export function createDeal(input: NewDealInput): Promise<{ deal: Deal }> {
  return jsonFetch(`/api/deals`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// ---- AI chat -------------------------------------------------------------
export function chatWithDealio(
  message: string,
  history: ChatHistoryItem[],
): Promise<{ reply: string; error?: string }> {
  return jsonFetch(`/api/chat`, {
    method: "POST",
    body: JSON.stringify({ message, history }),
  });
}

// ---- VLM analyze ---------------------------------------------------------
export function analyzeDealImage(imageDataUrl: string): Promise<{ deal: AnalyzedDeal }> {
  return jsonFetch(`/api/deals/analyze`, {
    method: "POST",
    body: JSON.stringify({ image: imageDataUrl }),
  });
}

// ---- Web search ----------------------------------------------------------
export function searchWebDeals(q: string, num = 8): Promise<{ query: string; deals: WebDeal[] }> {
  return jsonFetch(`/api/deals/search-web?q=${encodeURIComponent(q)}&num=${num}`);
}
