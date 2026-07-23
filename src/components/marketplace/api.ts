// Thin typed fetch wrappers around every backend endpoint.
// All requests use relative paths so the gateway/Caddy can route them.

import type {
  AnalyzedListing,
  Category,
  ChatHistoryItem,
  Listing,
  SortKey,
  Stage,
  WebListing,
} from "./types";

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
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

// ---- Listings list -------------------------------------------------------
export interface ListListingsParams {
  category?: string;
  sort?: SortKey;
  q?: string;
  trending?: boolean;
  featured?: boolean;
  stage?: Stage | "all";
  verified?: boolean;
  limit?: number;
}

export function fetchListings(
  params: ListListingsParams = {},
): Promise<{ listings: Listing[]; count: number }> {
  const sp = new URLSearchParams();
  if (params.category && params.category !== "all")
    sp.set("category", params.category);
  if (params.sort) sp.set("sort", params.sort);
  if (params.q?.trim()) sp.set("q", params.q.trim());
  if (params.trending) sp.set("trending", "1");
  if (params.featured) sp.set("featured", "1");
  if (params.stage && params.stage !== "all") sp.set("stage", params.stage);
  if (params.verified) sp.set("verified", "1");
  if (params.limit) sp.set("limit", String(params.limit));
  return jsonFetch(`/api/listings?${sp.toString()}`);
}

export function fetchFeaturedListing(): Promise<{ listing: Listing | null }> {
  return jsonFetch(`/api/listings/featured`);
}

export function fetchTrendingListings(): Promise<{ listings: Listing[] }> {
  return jsonFetch(`/api/listings/trending`);
}

export function fetchListingById(
  id: string,
): Promise<{ listing: Listing; saved: boolean; inquired: boolean }> {
  return jsonFetch(`/api/listings/${encodeURIComponent(id)}`);
}

// ---- Categories ----------------------------------------------------------
export function fetchCategories(): Promise<{
  categories: (Category & { _count: { listings: number } })[];
}> {
  return jsonFetch(`/api/categories`);
}

// ---- Saved listings ------------------------------------------------------
export function fetchSavedListings(): Promise<{ saved: Listing[] }> {
  return jsonFetch(`/api/user/saved`);
}

export function saveListing(listingId: string): Promise<{ ok: true }> {
  return jsonFetch(`/api/user/saved`, {
    method: "POST",
    body: JSON.stringify({ listingId }),
  });
}

export function unsaveListing(listingId: string): Promise<{ ok: true }> {
  return jsonFetch(
    `/api/user/saved?listingId=${encodeURIComponent(listingId)}`,
    { method: "DELETE" },
  );
}

// ---- Inquiries -----------------------------------------------------------
export function sendInquiry(
  listingId: string,
  message?: string,
): Promise<{ ok: true; inquiryCount: number }> {
  return jsonFetch(`/api/user/inquiries`, {
    method: "POST",
    body: JSON.stringify({ listingId, message }),
  });
}

// ---- Create listing ------------------------------------------------------
export interface NewListingInput {
  title: string;
  tagline?: string;
  description?: string;
  categorySlug: string;
  askingPrice: number;
  valuation?: number;
  currency?: string;
  annualRevenue?: number;
  annualProfit?: number;
  stage?: Stage;
  location?: string;
  ageYears?: number;
  employees?: number;
  imageUrl: string;
  metrics?: string;
  tags?: string;
  url?: string;
}

export function createListing(input: NewListingInput): Promise<{
  listing: Listing;
}> {
  return jsonFetch(`/api/listings`, {
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
export function analyzeListingImage(
  imageDataUrl: string,
): Promise<{ listing: AnalyzedListing }> {
  return jsonFetch(`/api/listings/analyze`, {
    method: "POST",
    body: JSON.stringify({ image: imageDataUrl }),
  });
}

// ---- Web search ----------------------------------------------------------
export function searchWebListings(
  q: string,
  num = 8,
): Promise<{ query: string; listings: WebListing[] }> {
  return jsonFetch(
    `/api/listings/search-web?q=${encodeURIComponent(q)}&num=${num}`,
  );
}
