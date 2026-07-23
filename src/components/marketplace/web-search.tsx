"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ExternalLink,
  Globe,
  Loader2,
  Search,
} from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useMarketplaceStore } from "./use-marketplace-store";
import { searchWebListings } from "./api";

function hostFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function faviconUrl(url: string): string {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?sz=64&domain=${host}`;
  } catch {
    return "";
  }
}

function WebResultCard({
  result,
}: {
  result: {
    title: string;
    description: string;
    url: string;
    host?: string;
    date?: string;
    favicon?: string;
    storeLogo?: string;
  };
}) {
  const host = result.host || hostFromUrl(result.url);
  const favicon = result.favicon || faviconUrl(result.url);
  return (
    <a
      href={result.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-2 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:border-[#FF7A00]/30 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
    >
      <div className="flex items-center gap-2">
        {favicon ? (
          <img
            src={favicon}
            alt=""
            className="size-4 rounded-sm"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <span className="grid size-4 place-items-center text-[10px]">🔗</span>
        )}
        <span className="text-[11px] font-medium text-[#6B7280]">{host}</span>
        {result.date && (
          <span className="text-[10px] text-[#9CA3AF]">· {result.date}</span>
        )}
        <ExternalLink className="ml-auto size-3.5 text-[#9CA3AF] transition group-hover:text-[#FF7A00]" />
      </div>
      <h3 className="line-clamp-2 text-sm font-semibold text-[#111827]">
        {result.title}
      </h3>
      <p className="line-clamp-2 text-xs text-[#6B7280]">
        {result.description}
      </p>
      <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#FF7A00]">
        Open listing ↗
      </span>
    </a>
  );
}

export function WebSearch() {
  const open = useMarketplaceStore((s) => s.webOpen);
  const setOpen = useMarketplaceStore((s) => s.setWebOpen);
  const [query, setQuery] = useState("");
  const [num, setNum] = useState("8");
  const [submitted, setSubmitted] = useState<{
    q: string;
    num: number;
  } | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["web-search", submitted],
    queryFn: () =>
      searchWebListings(submitted!.q, Number(submitted!.num) || 8),
    enabled: !!submitted,
    staleTime: 60_000,
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      toast.error("Enter a search query");
      return;
    }
    setSubmitted({ q, num: Number(num) || 8 });
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setQuery("");
      setSubmitted(null);
    }
    setOpen(next);
  };

  const results = data?.listings ?? [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden rounded-3xl border-[#E5E7EB] bg-white p-0 sm:max-w-2xl">
        <div className="flex max-h-[90vh] flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-[#E5E7EB] bg-gradient-to-r from-[#1A1D2E]/5 to-transparent px-5 py-4">
            <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[#1A1D2E] to-[#2C2E3E] text-white shadow-[0_4px_14px_rgba(26,29,46,0.22)]">
              <Globe className="size-5" />
            </span>
            <DialogHeader className="p-0">
              <DialogTitle className="text-base font-bold text-[#111827]">
                Web Business Search 🌐
              </DialogTitle>
              <DialogDescription className="text-xs">
                Find businesses for sale across the web. Real-time results
                from marketplaces worldwide.
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Search bar */}
          <form
            onSubmit={onSubmit}
            className="flex items-center gap-2 border-b border-[#E5E7EB] bg-[#FAFAFB] px-5 py-3"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. SaaS business for sale under $500K"
                className="h-10 w-full rounded-full border border-[#E5E7EB] bg-white pl-10 pr-4 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#FF7A00] focus:outline-none"
              />
            </div>
            <Select value={num} onValueChange={setNum}>
              <SelectTrigger className="h-10 w-20 rounded-full border-[#E5E7EB] bg-white text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-2xl">
                {["4", "6", "8", "10", "12"].map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              type="submit"
              disabled={isLoading}
              className="grid size-10 shrink-0 place-items-center rounded-full bg-[#FF7A00] text-white shadow-[0_4px_14px_rgba(255,122,0,0.24)] transition hover:bg-[#FF8C32] disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Search className="size-5" />
              )}
            </button>
          </form>

          {/* Results */}
          <div className="flex-1 overflow-y-auto p-5">
            {!submitted && (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <span className="grid size-12 place-items-center rounded-2xl bg-[#FFF4EB] text-[#FF7A00]">
                  <Globe className="size-6" />
                </span>
                <p className="text-sm text-[#6B7280]">
                  Search for businesses for sale across the web — try
                  &ldquo;Shopify store for sale&rdquo; or &ldquo;AI startup
                  acquisition&rdquo;.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-28 animate-pulse rounded-2xl bg-[#F3F4F6]"
                  />
                ))}
              </div>
            )}

            {isError && (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <p className="text-sm text-[#6B7280]">
                  Web search hit a snag. Try again?
                </p>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="rounded-full bg-[#FF7A00] px-5 py-2 text-sm font-semibold text-white hover:bg-[#FF8C32]"
                >
                  Retry
                </button>
              </div>
            )}

            {!isLoading && submitted && results.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <p className="text-sm font-semibold text-[#111827]">
                  No results for &ldquo;{submitted.q}&rdquo;
                </p>
                <p className="text-xs text-[#6B7280]">
                  Try a broader query, or use AI Valuation for a deeper search.
                </p>
              </div>
            )}

            {!isLoading && results.length > 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-[#6B7280]">
                  Showing{" "}
                  <span className="font-semibold text-[#111827]">
                    {results.length}
                  </span>{" "}
                  web results for &ldquo;{submitted?.q}&rdquo;
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {results.map((r, i) => (
                    <WebResultCard key={`${r.url}-${i}`} result={r} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
