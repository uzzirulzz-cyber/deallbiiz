"use client";

import { motion } from "framer-motion";
import { Star, Globe2, Shield, Award } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Amelia Kensington",
    role: "Partner, Kensington Capital",
    location: "Manhattan, USA",
    text: "Make This Deal found us a SaaS acquisition in 2 weeks that our team had been searching 6 months for. The AI valuation tool alone paid for itself.",
    rating: 5,
    avatar: "AK",
    color: "#3b82f6",
  },
  {
    name: "Rashid Al-Mansouri",
    role: "CEO, Gulf Ventures",
    location: "Dubai, UAE",
    text: "The multi-currency support and escrow protection made our cross-border acquisition seamless. This is how M&A should work in 2026.",
    rating: 5,
    avatar: "RA",
    color: "#8b5cf6",
  },
  {
    name: "Hiroshi Tanaka",
    role: "Director, Tokyo Fund",
    location: "Tokyo, Japan",
    text: "We closed 3 deals through the platform last quarter. The API access lets us pipe listings directly into our internal deal-flow pipeline.",
    rating: 5,
    avatar: "HT",
    color: "#10b981",
  },
  {
    name: "Sofia Marchetti",
    role: "Founder, Milan Ventures",
    location: "Milan, Italy",
    text: "As a first-time acquirer, the AI advisor walked me through valuation, multiples, and negotiation. I felt like I had a full M&A team.",
    rating: 5,
    avatar: "SM",
    color: "#f59e0b",
  },
];

const STATS = [
  { value: "$22.4K+", label: "Active Portfolio", icon: Globe2 },
  { value: "120+", label: "Countries Served", icon: Shield },
  { value: "15K+", label: "Registered Members", icon: Award },
  { value: "4.9/5", label: "Client Satisfaction", icon: Star },
];

export function GlobalTrust() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      {/* Background */}
      <div aria-hidden className="glow-orb-blue pointer-events-none absolute right-0 top-1/4 size-[400px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        {/* Global stats bar */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className="glass-card rounded-2xl p-5 text-center"
              >
                <span className="mx-auto grid size-10 place-items-center rounded-xl bg-[#3b82f6]/15 text-[#3b82f6]">
                  <Icon className="size-5" />
                </span>
                <p className="mt-3 text-2xl font-bold tabular-nums text-white sm:text-3xl">{s.value}</p>
                <p className="text-[11px] text-[#9ca3af]">{s.label}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Testimonials */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Trusted by <span className="gradient-text">deal-makers worldwide</span>
          </h2>
          <p className="mt-2 text-sm text-[#9ca3af]">From Manhattan to Tokyo — investors use Make This Deal to close better deals, faster.</p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="size-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              {/* Quote */}
              <p className="mt-3 text-sm leading-relaxed text-[#e5e7eb]">"{t.text}"</p>
              {/* Author */}
              <div className="mt-4 flex items-center gap-3">
                <span
                  className="grid size-10 place-items-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: t.color }}
                >
                  {t.avatar}
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-[11px] text-[#9ca3af]">{t.role} · {t.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Partner/trust badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 opacity-60">
          {["SOC 2 Type II", "PCI DSS", "GDPR Ready", "ISO 27001", "256-bit SSL"].map((badge) => (
            <span key={badge} className="inline-flex items-center gap-1.5 text-xs font-medium text-[#9ca3af]">
              <Shield className="size-3.5 text-[#10b981]" /> {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
