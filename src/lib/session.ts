import { cookies } from "next/headers";

export const SESSION_COOKIE = "mtd_session";

/**
 * Get or create an anonymous session id for the current request.
 * Stored in a cookie so saved listings / inquiries persist for the visitor.
 */
export async function getSessionId(): Promise<string> {
  const store = await cookies();
  let sid = store.get(SESSION_COOKIE)?.value;
  if (!sid) {
    sid = "s_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    store.set(SESSION_COOKIE, sid, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }
  return sid;
}

export interface ListingWithCategory {
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
  stage: string;
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
}

export function formatCurrency(amount: number, currency = "USD", opts: { compact?: boolean } = {}) {
  if (opts.compact) {
    const abs = Math.abs(amount);
    const sign = amount < 0 ? "-" : "";
    if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 1 : 2)}M`;
    if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(abs >= 100_000 ? 0 : 1)}K`;
    return `${sign}$${abs.toFixed(0)}`;
  }
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
