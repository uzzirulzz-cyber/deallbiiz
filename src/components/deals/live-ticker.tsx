"use client";

import { useMemo } from "react";
import { Flame } from "lucide-react";
import { useDealsStore } from "./use-deals-store";

function relativeTime(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  return `${Math.floor(diff / 3_600_000)}h ago`;
}

export function LiveTicker() {
  const online = useDealsStore((s) => s.online);
  const claims = useDealsStore((s) => s.recentClaims);

  // Duplicate the claims list so the marquee can scroll seamlessly.
  const loop = useMemo(() => {
    const base = claims.length > 0 ? claims : [];
    return [...base, ...base];
  }, [claims]);

  return (
    <div
      className="border-b border-border/40 bg-muted/30"
      role="status"
      aria-live="polite"
      aria-label="Live deal activity"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-2 sm:px-6">
        {/* Online pulse */}
        <div className="flex shrink-0 items-center gap-2 text-xs font-medium text-emerald-300">
          <span className="relative flex size-2">
            <span className="ttd-live-dot absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span className="tabular-nums">{online || 1} shoppers online</span>
        </div>

        <div className="h-4 w-px shrink-0 bg-border/60" aria-hidden />

        {/* Marquee */}
        <div className="relative flex-1 overflow-hidden">
          {claims.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Watching the feed for the freshest claims…
            </p>
          ) : (
            <div className="animate-marquee flex w-max items-center gap-8 whitespace-nowrap">
              {loop.map((c, i) => (
                <span
                  key={`${c.id}-${i}`}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <Flame className="size-3.5 text-amber-500" />
                  <span className="font-medium text-foreground/90">
                    {c.user}
                  </span>
                  <span>just claimed</span>
                  <span className="font-medium text-amber-300">
                    {c.dealTitle}
                  </span>
                  <span className="text-muted-foreground/70">from {c.store}</span>
                  <span className="text-muted-foreground/60">· {relativeTime(c.at)}</span>
                  <span className="text-muted-foreground/40">•</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
