"use client";

import { useQuery } from "@tanstack/react-query";

export interface HeroContent {
  eyebrow: string; title: string; titleAccent: string; subtitle: string;
  ctaPrimary: string; ctaPrimaryHref: string; ctaSecondary: string;
}
export interface StatContent { icon: string; value: string; label: string; accent: boolean; }
export interface StepContent { icon: string; title: string; description: string; }
export interface SectionsContent {
  hero: boolean; statsBar: boolean; liveTicker: boolean; trendingRail: boolean;
  categoryPills: boolean; howItWorks: boolean; ctaBand: boolean;
}
export interface SiteContentAll {
  hero: HeroContent; stats: StatContent[]; howItWorks: StepContent[];
  sections: SectionsContent; themeColor: string; accentColor: string;
  brandName: string; tagline: string; footerNote: string;
}

export const DEFAULT_SITE_CONTENT: SiteContentAll = {
  hero: {
    eyebrow: "GLOBAL ENTERPRISE MARKETPLACE",
    title: "Buy, Sell & Invest in",
    titleAccent: "Businesses Worldwide",
    subtitle: "The marketplace for SaaS, Real Estate, Startups, E-commerce, AI Solutions, and 50+ business categories.",
    ctaPrimary: "Explore Projects", ctaPrimaryHref: "#listings", ctaSecondary: "List Your Business",
  },
  stats: [
    { icon: "TrendingUp", value: "$22.4K", label: "Portfolio Value", accent: true },
    { icon: "Briefcase", value: "13", label: "Live Listings", accent: false },
    { icon: "LayoutGrid", value: "18", label: "Categories", accent: false },
    { icon: "Globe2", value: "120+", label: "Countries", accent: false },
  ],
  howItWorks: [
    { icon: "UserPlus", title: "Create Your Account", description: "Register and verify your identity to start exploring business opportunities worldwide." },
    { icon: "Search", title: "List or Browse", description: "Publish your projects for sale or explore thousands of verified business listings." },
    { icon: "MessageSquare", title: "Connect & Negotiate", description: "Chat directly with buyers and sellers, ask questions, and make competitive offers." },
    { icon: "Handshake", title: "Close the Deal", description: "Sign contracts, process secure payments, and transfer assets with full support." },
  ],
  sections: { hero: true, statsBar: true, liveTicker: true, trendingRail: true, categoryPills: true, howItWorks: true, ctaBand: true },
  themeColor: "#3B82F6", accentColor: "#8B5CF6",
  brandName: "Make This Deal", tagline: "Together We Grow Strong", footerNote: "Global Enterprise Marketplace",
};

export async function fetchSiteContent(): Promise<SiteContentAll> {
  try {
    const res = await fetch("/api/admin/content", { cache: "no-store" });
    if (!res.ok) return DEFAULT_SITE_CONTENT;
    const json = await res.json();
    const c = json?.content || {};
    return {
      hero: { ...DEFAULT_SITE_CONTENT.hero, ...(c.hero || {}) },
      stats: Array.isArray(c.stats) && c.stats.length > 0 ? c.stats : DEFAULT_SITE_CONTENT.stats,
      howItWorks: Array.isArray(c.howItWorks) && c.howItWorks.length > 0 ? c.howItWorks : DEFAULT_SITE_CONTENT.howItWorks,
      sections: { ...DEFAULT_SITE_CONTENT.sections, ...(c.sections || {}) },
      themeColor: c.themeColor || DEFAULT_SITE_CONTENT.themeColor,
      accentColor: c.accentColor || DEFAULT_SITE_CONTENT.accentColor,
      brandName: c.brandName || DEFAULT_SITE_CONTENT.brandName,
      tagline: c.tagline || DEFAULT_SITE_CONTENT.tagline,
      footerNote: c.footerNote || DEFAULT_SITE_CONTENT.footerNote,
    };
  } catch {
    return DEFAULT_SITE_CONTENT;
  }
}

export function useSiteContent() {
  return useQuery<SiteContentAll>({
    queryKey: ["site-content"],
    queryFn: fetchSiteContent,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    placeholderData: DEFAULT_SITE_CONTENT,
    retry: 1,
  });
}
