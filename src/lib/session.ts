import { cookies } from "next/headers";

export const SESSION_COOKIE = "ttd_session";

/**
 * Get or create an anonymous session id for the current request.
 * Stored in a cookie so saved/claimed deals persist for the visitor.
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

export interface DealWithCategory {
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
  expiresAt: string;
  claimedCount: number;
  viewCount: number;
  rating: number;
  tags: string;
  createdAt: string;
}

export function formatCurrency(amount: number, currency = "USD") {
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
