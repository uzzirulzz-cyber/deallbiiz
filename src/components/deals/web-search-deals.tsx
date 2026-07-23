"use client";

import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { ExternalLink, Globe, Link2, Loader2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDealsStore } from "./use-deals-store";
import { searchWebDeals } from "./api";
import type { WebDeal } from "./types";
import { toast } from "sonner";

export function WebSearchDeals() {
  const open = useDealsStore((s) => s.webOpen);
  const setOpen = useDealsStore((s) => s.setWebOpen);

  const [query, setQuery] = useState("");
  const [num, setNum] = useState("8");
  const [submitted, setSubmitted] = useState<{ q: string; n: number } | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["web-deals", submitted],
    queryFn: () => searchWebDeals(submitted!.q, submitted!.n),
    enabled: !!submitted,
    staleTime: 60_000,
    retry: false,
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      // Reset when the dialog closes (avoids stale results next time)
      setSubmitted(null);
      setQuery("");
    }
    setOpen(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSubmitted({ q, n: parseInt(num, 10) });
  };

  const results: WebDeal[] = data?.deals ?? [];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden rounded-2xl border-border/60 bg-background p-0 sm:max-w-2xl">
        <div className="flex flex-col gap-0">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border/60 bg-gradient-to-r from-amber-500/10 to-transparent px-5 py-4">
            <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-amber-950 shadow-lg shadow-amber-500/20">
              <Globe className="size-5" />
            </span>
            <DialogHeader className="p-0">
              <DialogTitle className="text-base font-bold">
                Web Deal Search
              </DialogTitle>
              <DialogDescription className="text-xs">
                Finds real deals on the web — open them in a new tab.
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Search form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-wrap items-center gap-2 border-b border-border/40 px-5 py-3"
          >
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. mechanical keyboard black friday"
                aria-label="Web deal search query"
                className="h-10 rounded-full bg-input/40 pl-9"
              />
            </div>
            <Select value={num} onValueChange={setNum}>
              <SelectTrigger className="h-10 w-28 rounded-full" aria-label="Number of results">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["4", "6", "8", "10", "12"].map((n) => (
                  <SelectItem key={n} value={n}>
                    {n} results
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="submit"
              className="h-10 rounded-full bg-amber-500 text-amber-950 hover:bg-amber-400"
              disabled={isLoading || !query.trim()}
            >
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
              Search
            </Button>
          </form>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
            {!submitted && (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <Globe className="size-8 text-muted-foreground/60" />
                <p className="text-sm text-muted-foreground">
                  Type a query above to find real deals on the web.
                </p>
              </div>
            )}

            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="mb-3 flex gap-3">
                  <Skeleton className="size-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}

            {isError && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-center text-sm text-destructive">
                Search failed{error instanceof Error ? `: ${error.message}` : ""}.
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Retry
                </Button>
              </div>
            )}

            {!isLoading && !isError && submitted && results.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <Link2 className="size-8 text-muted-foreground/60" />
                <p className="text-sm text-muted-foreground">
                  No web results found for &ldquo;{submitted.q}&rdquo;.
                </p>
              </div>
            )}

            {!isLoading && !isError && results.length > 0 && (
              <div className="flex flex-col gap-3">
                {results.map((r, i) => (
                  <WebResultCard key={`${r.url}-${i}`} deal={r} />
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WebResultCard({ deal }: { deal: WebDeal }) {
  return (
    <div className="flex gap-3 rounded-xl border border-border/60 bg-card/60 p-3 transition-colors hover:border-amber-500/30">
      <div className="grid size-10 shrink-0 place-items-center rounded-lg border border-border/60 bg-input/40 text-base">
        {deal.favicon ? (
          <img
            src={deal.favicon}
            alt=""
            className="size-6 rounded object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <Link2 className="size-4 text-muted-foreground" />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate">{deal.host}</span>
          {deal.date && <span>· {deal.date}</span>}
        </div>
        <h4 className="line-clamp-1 text-sm font-medium">{deal.title}</h4>
        {deal.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {deal.description}
          </p>
        )}
        <Button
          asChild
          size="sm"
          variant="outline"
          className="mt-1 w-fit rounded-full"
        >
          <a
            href={deal.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => toast.success("Opening web deal ↗")}
          >
            <ExternalLink className="size-3.5" />
            Open deal
          </a>
        </Button>
      </div>
    </div>
  );
}
