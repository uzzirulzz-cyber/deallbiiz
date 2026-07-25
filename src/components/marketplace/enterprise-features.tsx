"use client";

import { motion } from "framer-motion";
import {
  Code2, Globe2, Shield, Headphones, BarChart3, Workflow,
  Lock, RefreshCw, Server, KeyRound,
} from "lucide-react";

const FEATURES = [
  {
    icon: Code2,
    title: "Full REST API",
    desc: "Programmatic access to listings, orders, payments, and analytics. Build custom dashboards, bots, and integrations.",
    color: "#3b82f6",
  },
  {
    icon: Globe2,
    title: "Multi-Currency",
    desc: "Display prices in USD, PKR, EUR, GBP, AED. Auto-conversion with live exchange rates for global buyers.",
    color: "#8b5cf6",
  },
  {
    icon: Shield,
    title: "Escrow Protection",
    desc: "Secure payments held in escrow until deal milestones are met. End-to-end encrypted transactions.",
    color: "#10b981",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    desc: "Real-time KPIs, deal-flow charts, category breakdowns, revenue tracking, and custom report exports.",
    color: "#f59e0b",
  },
  {
    icon: Workflow,
    title: "Bulk Operations",
    desc: "Upload listings via CSV, bulk-update pricing, manage multiple deals simultaneously with batch tools.",
    color: "#ef4444",
  },
  {
    icon: KeyRound,
    title: "White-Label",
    desc: "Launch your own branded marketplace on your domain. Custom logo, colors, and theme via the website builder.",
    color: "#06b6d4",
  },
  {
    icon: Server,
    title: "99.9% SLA",
    desc: "Enterprise-grade infrastructure with guaranteed uptime, auto-scaling, and global CDN delivery.",
    color: "#84cc16",
  },
  {
    icon: Lock,
    title: "SOC 2 Compliant",
    desc: "Bank-grade security, audit trails, role-based access control, and data residency options.",
    color: "#f97316",
  },
  {
    icon: Headphones,
    title: "Dedicated Manager",
    desc: "Personal account manager, priority support channel, and same-day response SLA for enterprise clients.",
    color: "#a78bfa",
  },
  {
    icon: RefreshCw,
    title: "Auto-Sync",
    desc: "Real-time data sync across devices, instant storefront updates from admin, live deal-close feed.",
    color: "#34d399",
  },
];

export function EnterpriseFeatures() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#a78bfa]">
            <Server className="size-3.5" /> Enterprise Platform
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Built for <span className="gradient-text">global enterprises</span>
          </h2>
          <p className="mt-3 text-base text-[#9ca3af] sm:text-lg">
            Everything you need to run a world-class M&A marketplace — APIs, analytics, security, and white-label deployment.
          </p>
        </div>

        {/* Features grid */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative overflow-hidden rounded-2xl border border-white/8 bg-[#111128]/60 p-5 transition-all hover:border-white/15 hover:bg-[#111128]"
              >
                {/* Hover glow */}
                <div
                  className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full opacity-0 blur-3xl transition-opacity group-hover:opacity-30"
                  style={{ backgroundColor: f.color }}
                />
                <div className="relative z-10">
                  <span
                    className="grid size-11 place-items-center rounded-xl"
                    style={{ backgroundColor: `${f.color}20`, color: f.color }}
                  >
                    <Icon className="size-5" />
                  </span>
                  <h3 className="mt-3 text-sm font-bold text-white">{f.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#9ca3af]">{f.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
