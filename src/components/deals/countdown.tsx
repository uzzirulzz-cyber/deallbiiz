"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface CountdownProps {
  /** ISO date string — when the deal expires. */
  to: string;
  /** Compact mode: hides days & labels, smaller text. */
  compact?: boolean;
  className?: string;
}

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

/**
 * Live countdown to a future ISO date.
 * - Renders DD:HH:MM:SS when > 24h away, else HH:MM:SS.
 * - Turns rose/red when < 1h away (urgency).
 * - Memoized against the `to` prop; ticks every second.
 */
export function Countdown({ to, compact = false, className }: CountdownProps) {
  const target = useMemo(() => new Date(to).getTime(), [to]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, target - now);
  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  const urgent = diff < 3600_000; // < 1h
  const expired = diff <= 0;

  if (expired) {
    return (
      <span className={cn("font-mono tabular-nums text-rose-400", className)}>
        {compact ? "Ended" : "Deal ended"}
      </span>
    );
  }

  if (compact) {
    return (
      <span
        className={cn(
          "font-mono tabular-nums tracking-tight",
          urgent ? "text-rose-400" : "text-foreground",
          className,
        )}
      >
        {days > 0 ? `${days}d ` : ""}
        {pad(hours)}:{pad(minutes)}:{pad(seconds)}
      </span>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 font-mono tabular-nums",
        urgent ? "text-rose-400" : "text-foreground",
        className,
      )}
      aria-label={`Deal ends in ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`}
    >
      {days > 0 && (
        <>
          <TimeBlock value={days} label="d" />
          <Sep />
        </>
      )}
      <TimeBlock value={hours} label="h" />
      <Sep />
      <TimeBlock value={minutes} label="m" />
      <Sep />
      <TimeBlock value={seconds} label="s" />
    </div>
  );
}

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <span className="inline-flex items-baseline gap-0.5">
      <span className="text-lg font-semibold sm:text-xl">{pad(value)}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </span>
  );
}

function Sep() {
  return <span className="text-muted-foreground/60 text-lg sm:text-xl">:</span>;
}
