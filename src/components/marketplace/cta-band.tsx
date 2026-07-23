"use client";

import { motion } from "framer-motion";
import { ArrowRight, Headset, Sparkles } from "lucide-react";

import { useMarketplaceStore } from "./use-marketplace-store";

export function CtaBand() {
  const setSnapOpen = useMarketplaceStore((s) => s.setSnapOpen);
  const setAiOpen = useMarketplaceStore((s) => s.setAiOpen);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A1D2E] to-[#2C2E3E] px-6 py-12 sm:px-12 sm:py-16"
      >
        {/* Radial glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full bg-[#FF7A00]/25 blur-[100px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-20 size-[360px] rounded-full bg-[#FF5757]/10 blur-[100px]"
        />

        <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 max-w-2xl">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[#FF7A00]/30 bg-[#FF7A00]/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#FF8C32]">
              <Sparkles className="size-3.5" />
              Ready to grow?
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Make a Deal?
            </h2>
            <p className="text-sm leading-relaxed text-white/70 sm:text-base">
              Join thousands of founders, investors, and brokers closing
              business acquisitions on Make This Deal. List your business,
              browse verified opportunities, or let our AI value one for you —
              free to start.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setSnapOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF7A00] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(255,122,0,0.32)] transition hover:bg-[#FF8C32]"
            >
              Get Started Free
              <ArrowRight className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setAiOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              <Headset className="size-4" />
              Talk to Dealio
            </button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
