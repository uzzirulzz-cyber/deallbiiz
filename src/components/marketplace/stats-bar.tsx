"use client";

import { motion } from "framer-motion";
import { Briefcase, Globe2, LayoutGrid, TrendingUp } from "lucide-react";

interface Stat {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  value: string;
  label: string;
  accent?: boolean;
}

const STATS: Stat[] = [
  { icon: TrendingUp, value: "$12.30M", label: "Portfolio Value", accent: true },
  { icon: Briefcase, value: "12", label: "Active Listings" },
  { icon: LayoutGrid, value: "18", label: "Categories" },
  { icon: Globe2, value: "120+", label: "Countries" },
];

export function StatsBar() {
  return (
    <section className="mx-auto -mt-8 w-full max-w-7xl px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="grid grid-cols-2 gap-3 rounded-3xl border border-[#E5E7EB] bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] sm:gap-5 sm:p-6 lg:grid-cols-4"
      >
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className={`flex items-center gap-3.5 rounded-2xl p-3 transition hover:bg-[#FAFAFB] sm:p-4 ${
              i !== STATS.length - 1 ? "lg:border-r lg:border-[#F3F4F6]" : ""
            }`}
          >
            <span
              className={`grid size-11 shrink-0 place-items-center rounded-full ${
                s.accent
                  ? "bg-[#FF7A00] text-white"
                  : "bg-[#FFF4EB] text-[#FF7A00]"
              }`}
            >
              <s.icon className="size-5" strokeWidth={2} />
            </span>
            <div className="flex flex-col">
              <span
                className={`text-xl font-bold tabular-nums sm:text-2xl ${
                  s.accent ? "text-[#FF7A00]" : "text-[#111827]"
                }`}
              >
                {s.value}
              </span>
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#6B7280] sm:text-xs">
                {s.label}
              </span>
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
