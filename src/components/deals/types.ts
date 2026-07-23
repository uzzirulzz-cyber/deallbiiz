// Shared types for the Take This Deal frontend — matches the backend API contract.

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string; // emoji
  color: string; // tailwind color token
  _count?: { deals: number };
}

export interface Deal {
  id: string;
  title: string;
  description: string;
  store: string;
  storeLogo: string | null;
  imageUrl: string;
  originalPrice: number;
  dealPrice: number;
  currency: string;
  discountPct: number;
  url: string;
  categorySlug: string;
  featured: boolean;
  trending: boolean;
  flashDeal: boolean;
  expiresAt: string; // ISO date
  claimedCount: number;
  viewCount: number;
  rating: number;
  tags: string;
  createdAt: string;
  category?: Category;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

export interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

export interface AnalyzedDeal {
  title: string;
  store: string;
  storeLogo: string;
  description: string;
  originalPrice: number;
  dealPrice: number;
  currency: string;
  url: string;
  categorySlug: string;
  tags: string;
  confidence?: number;
}

export interface WebDeal {
  title: string;
  store: string;
  storeLogo: string;
  description: string;
  url: string;
  host: string;
  date?: string;
  favicon?: string;
}

export interface LiveClaim {
  id: string;
  dealTitle: string;
  store: string;
  user: string;
  at: number;
}

export interface WSStats {
  online: number;
  viewers: Array<{ dealId: string; count: number }>;
  claimsLastHour: number;
}

export interface WSWelcome {
  online: number;
  recentClaims: LiveClaim[];
}

export type SortKey =
  | "discount"
  | "price"
  | "price-desc"
  | "expires"
  | "trending"
  | "rating"
  | "claimed";

export function formatCurrency(amount: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}

export function formatClaimed(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
