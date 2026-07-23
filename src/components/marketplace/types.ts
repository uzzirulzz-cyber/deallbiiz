// Shared types for the Make This Deal marketplace frontend.
// Matches the backend API contract documented in /home/z/my-project/worklog.md (Task ID: 7).

export type Stage = "Startup" | "Growth" | "Established";

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string; // emoji
  color: string; // tailwind color token / hex
  blurb?: string;
  _count?: { listings: number };
}

export interface Listing {
  id: string;
  title: string;
  tagline: string;
  description: string;
  categorySlug: string;
  askingPrice: number;
  valuation: number;
  currency: string;
  annualRevenue: number;
  annualProfit: number;
  revenueMultiple: number;
  profitMultiple: number;
  stage: Stage;
  location: string;
  ageYears: number;
  employees: number;
  verified: boolean;
  featured: boolean;
  trending: boolean;
  imageUrl: string;
  metrics: string;
  tags: string;
  url: string;
  viewCount: number;
  inquiryCount: number;
  rating: number;
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

export interface AnalyzedListing {
  title: string;
  tagline: string;
  description: string;
  categorySlug: string;
  askingPrice: number;
  valuation: number;
  annualRevenue: number;
  annualProfit: number;
  stage: Stage;
  location: string;
  ageYears: number;
  employees: number;
  metrics: string;
  tags: string;
  confidence?: number;
}

export interface WebListing {
  title: string;
  store: string;
  storeLogo: string;
  description: string;
  url: string;
  host: string;
  date?: string;
  favicon?: string;
}

export interface LiveClose {
  id: string;
  listingTitle: string;
  categorySlug: string;
  amount: number;
  party: string;
  at: number;
}

export interface WSStats {
  online: number;
  viewers: Array<{ listingId: string; count: number }>;
  dealsClosed24h: number;
}

export interface WSWelcome {
  online: number;
  recentCloses: LiveClose[];
}

export type SortKey =
  | "trending"
  | "asking"
  | "asking-desc"
  | "revenue"
  | "multiple"
  | "newest"
  | "popular"
  | "rating";

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

/** Compact money: $1.2M, $480K, $45K */
export function formatCompactMoney(amount: number, currency = "USD"): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 1_000_000)
    return `${sign}$${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 1 : 2)}M`;
  if (abs >= 1_000)
    return `${sign}$${(abs / 1_000).toFixed(abs >= 100_000 ? 0 : 1)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

/** Full money: $1,200,000 */
export function formatMoney(amount: number, currency = "USD"): string {
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

/** Compact count: 1.2k, 480, 12 */
export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}
